import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyLead, PipelineStatus, RadarFilter, RamoAtividade, AppMode, SolicitacaoProposta, StatusSolicitacao, SolicitacaoHistoricoItem } from '../types';
import { SEED_LEADS_SP } from '../data/seedLeads';
import { SEED_SOLICITACOES } from '../data/lopesProdutos';
import { consultarCnpjBrasilApi } from '../services/brasilApi';
import { useAuth } from './AuthContext';
import {
  testSupabaseConnection,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  getStoredSupabaseCredentials,
  syncLeadToSupabase,
  updateContactInSupabase,
  fetchLeadsFromSupabase,
  SupabaseHealthResult,
} from '../services/supabaseClient';

interface LeadsContextType {
  leads: CompanyLead[];
  loadingSearch: boolean;
  searchError: string | null;
  searchCnpj: (cnpj: string) => Promise<CompanyLead>;
  addToCarteira: (lead: CompanyLead, targetUserId?: string, targetUserName?: string) => void;
  removeFromCarteira: (leadId: string) => void;
  updateLeadContactInfo: (
    leadId: string,
    updates: {
      telefone?: string;
      email?: string;
      contato_nome?: string;
      contato_cargo?: string;
      pipeline_status?: PipelineStatus;
      valor_estimado?: number;
      razao_social?: string;
      nome_fantasia?: string;
    }
  ) => void;
  addNote: (leadId: string, text: string, canal: 'whatsapp' | 'email' | 'telefone' | 'presencial') => void;
  reassignLead: (leadId: string, newUserId: string, newUserName: string) => void;
  deleteLead: (leadId: string) => void;
  radarFilter: RadarFilter;
  setRadarFilter: React.Dispatch<React.SetStateAction<RadarFilter>>;
  getFilteredLeads: () => CompanyLead[];
  supabaseInfo: SupabaseHealthResult;
  checkConnection: () => Promise<SupabaseHealthResult>;
  updateSupabaseCredentials: (url: string, key: string) => Promise<SupabaseHealthResult>;
  disconnectSupabase: () => void;
  syncAllToSupabase: () => Promise<{ success: number; failed: number }>;
  loadLeadsFromSupabase: () => Promise<{ loaded: number; error?: string }>;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  solicitacoes: SolicitacaoProposta[];
  solicitacaoSelecionada: SolicitacaoProposta | null;
  setSolicitacaoSelecionada: (s: SolicitacaoProposta | null) => void;
  criarSolicitacao: (dados: {
    lead_id: string;
    cnpj: string;
    cnpj_raw: string;
    razao_social: string;
    nome_fantasia?: string;
    cnae_descricao?: string;
    produto_lopes: string;
    categoria_produto: 'imoveis' | 'locacao_corporativa' | 'expansao_franquias' | 'facilities' | 'consultoria';
    descricao_produto: string;
    valor_proposta: number;
    condicoes_pagamento: string;
    validade_dias: number;
  }) => SolicitacaoProposta;
  responderSolicitacaoCliente: (
    solicitacaoId: string,
    acao: 'aprovar' | 'revisar' | 'recusar',
    mensagem?: string
  ) => void;
  buscarSolicitacoesPorCnpjOuCodigo: (termo: string) => SolicitacaoProposta[];
  stats: {
    totalLeads: number;
    carteiraCount: number;
    imobiliariasCount: number;
    servicosLopesCount: number;
    totalPipelineValue: number;
    solicitacoesAtivasCount: number;
  };
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export const SP_DEFAULT_CENTER = {
  lat: -23.5615,
  lng: -46.6560,
  name: 'Av. Paulista, São Paulo - SP',
};

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [leads, setLeads] = useState<CompanyLead[]>(() => {
    const saved = localStorage.getItem('lopes_crm_leads_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_LEADS_SP;
  });

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modo Vendedor ou Modo Cliente
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('lopes_app_mode');
    return (saved === 'cliente' || saved === 'vendedor') ? saved : 'vendedor';
  });

  // Solicitações e Propostas Comerciais Lopes
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoProposta[]>(() => {
    const saved = localStorage.getItem('lopes_solicitacoes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_SOLICITACOES;
  });

  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoProposta | null>(null);

  useEffect(() => {
    localStorage.setItem('lopes_app_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('lopes_solicitacoes_v2', JSON.stringify(solicitacoes));
  }, [solicitacoes]);

  const [supabaseInfo, setSupabaseInfo] = useState<SupabaseHealthResult>({
    connected: false,
    message: 'Verificando status...',
    url: getStoredSupabaseCredentials().url,
  });

  const checkConnection = async (): Promise<SupabaseHealthResult> => {
    const status = await testSupabaseConnection();
    setSupabaseInfo(status);
    return status;
  };

  const updateSupabaseCredentials = async (url: string, key: string): Promise<SupabaseHealthResult> => {
    const res = saveSupabaseCredentials(url, key);
    if (!res.success) {
      const errResult: SupabaseHealthResult = {
        connected: false,
        message: res.error || 'Erro ao validar chaves.',
        url,
      };
      setSupabaseInfo(errResult);
      return errResult;
    }
    const status = await testSupabaseConnection(url, key);
    setSupabaseInfo(status);
    return status;
  };

  const disconnectSupabase = () => {
    clearSupabaseCredentials();
    setSupabaseInfo({
      connected: false,
      message: 'Chaves desconectadas.',
      url: '',
    });
  };

  const syncAllToSupabase = async (): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;
    for (const lead of leads) {
      const ok = await syncLeadToSupabase(lead);
      if (ok) success++;
      else failed++;
    }
    await checkConnection();
    return { success, failed };
  };

  const loadLeadsFromSupabase = async (): Promise<{ loaded: number; error?: string }> => {
    try {
      const fetched = await fetchLeadsFromSupabase();
      if (!fetched || fetched.length === 0) {
        return { loaded: 0, error: 'Nenhum lead encontrado no banco ou tabelas vazias.' };
      }
      setLeads((prev) => {
        const merged = [...prev];
        for (const item of fetched) {
          const idx = merged.findIndex((m) => m.cnpj_raw === item.cnpj_raw);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...item };
          } else {
            merged.unshift(item);
          }
        }
        return merged;
      });
      return { loaded: fetched.length };
    } catch (err: any) {
      return { loaded: 0, error: err.message || 'Erro ao buscar do Supabase.' };
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const [radarFilter, setRadarFilter] = useState<RadarFilter>({
    centerLat: SP_DEFAULT_CENTER.lat,
    centerLng: SP_DEFAULT_CENTER.lng,
    centerName: SP_DEFAULT_CENTER.name,
    radiusKm: 10,
    ramo: 'todos',
    ramoBuscaLivre: '',
    status: 'todos',
    apenasMinhaCarteira: false,
    somenteComTelefone: false,
    somenteComEmail: false,
  });

  useEffect(() => {
    localStorage.setItem('lopes_crm_leads_v2', JSON.stringify(leads));
  }, [leads]);

  const searchCnpj = async (cnpjInput: string): Promise<CompanyLead> => {
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const foundLead = await consultarCnpjBrasilApi(cnpjInput);

      const existingIndex = leads.findIndex((l) => l.cnpj_raw === foundLead.cnpj_raw);
      if (existingIndex >= 0) {
        setLoadingSearch(false);
        return leads[existingIndex];
      }

      setLeads((prev) => [foundLead, ...prev]);

      // Sincroniza em segundo plano com o Supabase se conectado
      syncLeadToSupabase(foundLead);

      setLoadingSearch(false);
      return foundLead;
    } catch (err: any) {
      setSearchError(err.message || 'Erro ao consultar CNPJ na BrasilAPI');
      setLoadingSearch(false);
      throw err;
    }
  };

  const addToCarteira = (lead: CompanyLead, targetUserId?: string, targetUserName?: string) => {
    const assignedId = targetUserId || currentUser?.id || 'usr_gestor_1';
    const assignedName = targetUserName || currentUser?.name || 'Gestor Lopes';

    setLeads((prev) => {
      const existing = prev.find((l) => l.id === lead.id || l.cnpj_raw === lead.cnpj_raw);
      if (existing) {
        const updatedList = prev.map((l) => {
          if (l.id === existing.id) {
            const updatedLead = {
              ...l,
              in_carteira: true,
              assigned_to_user_id: assignedId,
              assigned_to_user_name: assignedName,
              pipeline_status: l.pipeline_status === 'prospectado' ? ('contato_iniciado' as PipelineStatus) : l.pipeline_status,
              updated_at: new Date().toISOString(),
              notes: [
                ...l.notes,
                {
                  id: `note_${Date.now()}`,
                  user_name: currentUser?.name || 'Sistema',
                  date: new Date().toLocaleString('pt-BR'),
                  text: `Empresa inserida na carteira de ${assignedName}.`,
                  canal: 'presencial' as const,
                },
              ],
            };
            syncLeadToSupabase(updatedLead);
            return updatedLead;
          }
          return l;
        });
        return updatedList;
      } else {
        const newLead: CompanyLead = {
          ...lead,
          in_carteira: true,
          assigned_to_user_id: assignedId,
          assigned_to_user_name: assignedName,
          pipeline_status: 'contato_iniciado',
          updated_at: new Date().toISOString(),
          notes: [
            ...lead.notes,
            {
              id: `note_${Date.now()}`,
              user_name: currentUser?.name || 'Sistema',
              date: new Date().toLocaleString('pt-BR'),
              text: `Empresa inserida na carteira de ${assignedName}.`,
              canal: 'presencial' as const,
            },
          ],
        };
        syncLeadToSupabase(newLead);
        return [newLead, ...prev];
      }
    });
  };

  const removeFromCarteira = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated = {
            ...l,
            in_carteira: false,
            assigned_to_user_id: '',
            assigned_to_user_name: '',
            updated_at: new Date().toISOString(),
          };
          syncLeadToSupabase(updated);
          return updated;
        }
        return l;
      })
    );
  };

  const updateLeadContactInfo = (
    leadId: string,
    updates: {
      telefone?: string;
      email?: string;
      contato_nome?: string;
      contato_cargo?: string;
      pipeline_status?: PipelineStatus;
      valor_estimado?: number;
      razao_social?: string;
      nome_fantasia?: string;
    }
  ) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated: CompanyLead = {
            ...l,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          updateContactInSupabase(l.cnpj_raw, updates);
          return updated;
        }
        return l;
      })
    );
  };

  const addNote = (leadId: string, text: string, canal: 'whatsapp' | 'email' | 'telefone' | 'presencial') => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            updated_at: new Date().toISOString(),
            notes: [
              {
                id: `note_${Date.now()}`,
                user_name: currentUser?.name || 'Usuário',
                date: new Date().toLocaleString('pt-BR'),
                text,
                canal,
              },
              ...l.notes,
            ],
          };
        }
        return l;
      })
    );
  };

  const reassignLead = (leadId: string, newUserId: string, newUserName: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated = {
            ...l,
            assigned_to_user_id: newUserId,
            assigned_to_user_name: newUserName,
            updated_at: new Date().toISOString(),
          };
          syncLeadToSupabase(updated);
          return updated;
        }
        return l;
      })
    );
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const getFilteredLeads = (): CompanyLead[] => {
    return leads
      .map((lead) => {
        const dist = calculateDistanceKm(
          radarFilter.centerLat,
          radarFilter.centerLng,
          lead.endereco.latitude,
          lead.endereco.longitude
        );
        return {
          ...lead,
          distancia_km: dist,
        };
      })
      .filter((lead) => {
        // Filtro de Raio
        if (lead.distancia_km! > radarFilter.radiusKm) {
          return false;
        }

        // Filtro de Ramo por categoria pré-definida
        if (radarFilter.ramo !== 'todos') {
          if (lead.ramo !== radarFilter.ramo) {
            return false;
          }
        }

        // Filtro de Ramo Livre / Qualquer Atividade Econômica
        if (radarFilter.ramoBuscaLivre && radarFilter.ramoBuscaLivre.trim() !== '') {
          const query = radarFilter.ramoBuscaLivre.toLowerCase().trim();
          const matchCnae = lead.cnae_fiscal.toLowerCase().includes(query);
          const matchCnaeDesc = lead.cnae_fiscal_descricao.toLowerCase().includes(query);
          const matchRamo = (lead.ramo || '').toLowerCase().includes(query);
          const matchRazao = lead.razao_social.toLowerCase().includes(query);
          const matchFantasia = lead.nome_fantasia.toLowerCase().includes(query);
          const matchSecundarios = lead.cnaes_secundarios?.some(
            (s) => s.descricao.toLowerCase().includes(query) || String(s.codigo).includes(query)
          );

          if (!matchCnae && !matchCnaeDesc && !matchRamo && !matchRazao && !matchFantasia && !matchSecundarios) {
            return false;
          }
        }

        // Filtro de Pipeline
        if (radarFilter.status !== 'todos' && lead.pipeline_status !== radarFilter.status) {
          return false;
        }

        // Filtro apenas minha carteira
        if (radarFilter.apenasMinhaCarteira) {
          if (!lead.in_carteira) return false;
          if (currentUser?.role === 'vendedor' && lead.assigned_to_user_id !== currentUser.id) {
            return false;
          }
        }

        // Filtros de telefone e email
        if (radarFilter.somenteComTelefone && (!lead.telefone || lead.telefone.trim() === '')) {
          return false;
        }
        if (radarFilter.somenteComEmail && (!lead.email || lead.email.trim() === '')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (a.distancia_km || 0) - (b.distancia_km || 0));
  };

  const criarSolicitacao = (dados: {
    lead_id: string;
    cnpj: string;
    cnpj_raw: string;
    razao_social: string;
    nome_fantasia?: string;
    cnae_descricao?: string;
    produto_lopes: string;
    categoria_produto: 'imoveis' | 'locacao_corporativa' | 'expansao_franquias' | 'facilities' | 'consultoria';
    descricao_produto: string;
    valor_proposta: number;
    condicoes_pagamento: string;
    validade_dias: number;
  }): SolicitacaoProposta => {
    const now = new Date().toISOString();
    const id = `PROP-${new Date().getFullYear()}-${String(solicitacoes.length + 1).padStart(3, '0')}`;

    const nova: SolicitacaoProposta = {
      ...dados,
      id,
      vendedor_id: currentUser?.id || 'vendedor_carlos_01',
      vendedor_nome: currentUser?.name || 'Carlos Silva',
      vendedor_cargo: currentUser?.cargo || 'Consultor Comercial Lopes',
      vendedor_telefone: currentUser?.phone || '(11) 91234-5678',
      vendedor_email: currentUser?.email || 'carlos.silva@lopes.com.br',
      status: 'proposta_disponivel',
      data_criacao: now,
      data_atualizacao: now,
      historico: [
        {
          id: `hist_${Date.now()}`,
          data: now,
          autor: `${currentUser?.name || 'Consultor Lopes'} (${currentUser?.cargo || 'Comercial Lopes'})`,
          papel: 'vendedor',
          mensagem: `Proposta comercial "${dados.produto_lopes}" criada no valor de R$ ${dados.valor_proposta.toLocaleString('pt-BR')}.`,
          novo_status: 'proposta_disponivel',
        },
      ],
    };

    setSolicitacoes((prev) => [nova, ...prev]);

    // Atualiza o lead na carteira com proposta_enviada
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === dados.lead_id || lead.cnpj_raw === dados.cnpj_raw) {
          const updatedNotes = [
            {
              id: `note_${Date.now()}`,
              user_name: currentUser?.name || 'Consultor Lopes',
              date: new Date().toLocaleDateString('pt-BR'),
              text: `Proposta oficial emitida (${nova.id}): ${dados.produto_lopes} - R$ ${dados.valor_proposta.toLocaleString('pt-BR')}. Cliente pode consultar via Portal do Cliente pelo CNPJ.`,
              canal: 'whatsapp' as const,
            },
            ...lead.notes,
          ];
          return {
            ...lead,
            pipeline_status: 'proposta_enviada' as PipelineStatus,
            in_carteira: true,
            valor_estimado: dados.valor_proposta,
            notes: updatedNotes,
            updated_at: now,
          };
        }
        return lead;
      })
    );

    return nova;
  };

  const responderSolicitacaoCliente = (
    solicitacaoId: string,
    acao: 'aprovar' | 'revisar' | 'recusar',
    mensagem?: string
  ) => {
    const now = new Date().toISOString();
    let novoStatus: StatusSolicitacao = 'proposta_disponivel';
    let novoPipelineStatus: PipelineStatus = 'negociacao';

    if (acao === 'aprovar') {
      novoStatus = 'aprovada_pelo_cliente';
      novoPipelineStatus = 'fechado';
    } else if (acao === 'revisar') {
      novoStatus = 'em_revisao';
      novoPipelineStatus = 'negociacao';
    } else if (acao === 'recusar') {
      novoStatus = 'recusada';
      novoPipelineStatus = 'perdido';
    }

    setSolicitacoes((prev) =>
      prev.map((s) => {
        if (s.id === solicitacaoId) {
          const updated: SolicitacaoProposta = {
            ...s,
            status: novoStatus,
            data_atualizacao: now,
            observacoes_cliente: mensagem || s.observacoes_cliente,
            historico: [
              ...s.historico,
              {
                id: `hist_${Date.now()}`,
                data: now,
                autor: `Representante ${s.razao_social} (Cliente)`,
                papel: 'cliente',
                mensagem:
                  mensagem ||
                  (acao === 'aprovar'
                    ? 'Proposta comercial aprovada pelo cliente. Aguardando formalização de contrato.'
                    : acao === 'revisar'
                    ? 'Cliente solicitou revisão de condições comerciais.'
                    : 'Proposta recusada pelo cliente.'),
                novo_status: novoStatus,
              },
            ],
          };
          if (solicitacaoSelecionada?.id === solicitacaoId) {
            setSolicitacaoSelecionada(updated);
          }
          return updated;
        }
        return s;
      })
    );

    // Também sincroniza com o lead do vendedor
    setLeads((prev) =>
      prev.map((l) => {
        const sol = solicitacoes.find((s) => s.id === solicitacaoId);
        if (sol && (l.id === sol.lead_id || l.cnpj_raw === sol.cnpj_raw)) {
          return {
            ...l,
            pipeline_status: novoPipelineStatus,
            notes: [
              {
                id: `note_${Date.now()}`,
                user_name: 'Portal do Cliente Lopes',
                date: new Date().toLocaleDateString('pt-BR'),
                text: `Resposta do Cliente (${solicitacaoId}): ${
                  acao === 'aprovar'
                    ? '✅ Proposta Aprovada'
                    : acao === 'revisar'
                    ? '⚠️ Revisão Solicitada'
                    : '❌ Proposta Recusada'
                }. ${mensagem ? `"${mensagem}"` : ''}`,
                canal: 'presencial' as const,
              },
              ...l.notes,
            ],
            updated_at: now,
          };
        }
        return l;
      })
    );
  };

  const buscarSolicitacoesPorCnpjOuCodigo = (termo: string): SolicitacaoProposta[] => {
    const raw = termo.replace(/\D/g, '');
    const clean = termo.trim().toLowerCase();
    if (!clean) return solicitacoes;

    return solicitacoes.filter((s) => {
      const matchCodigo = s.id.toLowerCase().includes(clean);
      const matchCnpj = raw ? s.cnpj_raw.includes(raw) : false;
      const matchNome =
        s.razao_social.toLowerCase().includes(clean) ||
        (s.nome_fantasia ? s.nome_fantasia.toLowerCase().includes(clean) : false);
      const matchProduto = s.produto_lopes.toLowerCase().includes(clean);
      return matchCodigo || matchCnpj || matchNome || matchProduto;
    });
  };

  const carteiraLeads = leads.filter((l) => l.in_carteira);
  const imobiliariasCount = leads.filter((l) => l.ramo === 'imobiliaria').length;
  const servicosLopesCount = leads.filter((l) => l.ramo === 'prestacao_servicos_lopes').length;
  const totalPipelineValue = carteiraLeads.reduce((acc, curr) => acc + (curr.valor_estimado || 0), 0);
  const solicitacoesAtivasCount = solicitacoes.filter(
    (s) => s.status === 'proposta_disponivel' || s.status === 'em_revisao'
  ).length;

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loadingSearch,
        searchError,
        searchCnpj,
        addToCarteira,
        removeFromCarteira,
        updateLeadContactInfo,
        addNote,
        reassignLead,
        deleteLead,
        radarFilter,
        setRadarFilter,
        getFilteredLeads,
        supabaseInfo,
        checkConnection,
        updateSupabaseCredentials,
        disconnectSupabase,
        syncAllToSupabase,
        loadLeadsFromSupabase,
        appMode,
        setAppMode,
        solicitacoes,
        solicitacaoSelecionada,
        setSolicitacaoSelecionada,
        criarSolicitacao,
        responderSolicitacaoCliente,
        buscarSolicitacoesPorCnpjOuCodigo,
        stats: {
          totalLeads: leads.length,
          carteiraCount: carteiraLeads.length,
          imobiliariasCount,
          servicosLopesCount,
          totalPipelineValue,
          solicitacoesAtivasCount,
        },
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads deve ser usado dentro de um LeadsProvider');
  }
  return context;
};

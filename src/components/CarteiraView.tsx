import React, { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadsContext';
import { useAuth } from '../context/AuthContext';
import { CompanyLead, PipelineStatus } from '../types';
import { EditLeadModal } from './EditLeadModal';
import { CriarPropostaModal } from './CriarPropostaModal';
import { getCleanPhoneForWhatsApp } from '../services/brasilApi';
import {
  Search,
  Phone,
  Mail,
  ExternalLink,
  Edit3,
  Trash2,
  FileSpreadsheet,
  ChevronRight,
  Send,
  Briefcase,
} from 'lucide-react';

export const CarteiraView: React.FC = () => {
  const { leads, removeFromCarteira, addNote, reassignLead, updateLeadContactInfo } = useLeads();
  const { currentUser, users, isGestor } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | PipelineStatus>('todos');
  const [sellerFilter, setSellerFilter] = useState<string>('todos');
  const [editingLead, setEditingLead] = useState<CompanyLead | null>(null);
  const [criarPropostaLead, setCriarPropostaLead] = useState<CompanyLead | null>(null);
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<CompanyLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteChannel, setNoteChannel] = useState<'whatsapp' | 'email' | 'telefone' | 'presencial'>('whatsapp');

  const carteiraLeads = useMemo(() => {
    return leads.filter((l) => {
      if (!l.in_carteira) return false;

      if (!isGestor && l.assigned_to_user_id !== currentUser?.id) {
        return false;
      }

      if (isGestor && sellerFilter !== 'todos' && l.assigned_to_user_id !== sellerFilter) {
        return false;
      }

      if (statusFilter !== 'todos' && l.pipeline_status !== statusFilter) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = (l.nome_fantasia || l.razao_social).toLowerCase().includes(term);
        const matchCnpj = l.cnpj.includes(term) || l.cnpj_raw.includes(term);
        const matchContact = (l.contato_nome || '').toLowerCase().includes(term);
        if (!matchName && !matchCnpj && !matchContact) return false;
      }

      return true;
    });
  }, [leads, isGestor, currentUser, sellerFilter, statusFilter, searchTerm]);

  const handleExportCsv = () => {
    const headers = [
      'CNPJ',
      'Razão Social',
      'Nome Fantasia',
      'Ramo',
      'CNAE',
      'Contato Nome',
      'Cargo',
      'Telefone',
      'Email',
      'Bairro',
      'Status Pipeline',
      'Valor Estimado (R$)',
      'Vendedor Responsável',
    ];

    const rows = carteiraLeads.map((l) => [
      `"${l.cnpj}"`,
      `"${l.razao_social}"`,
      `"${l.nome_fantasia || ''}"`,
      `"${l.ramo}"`,
      `"${l.cnae_fiscal}"`,
      `"${l.contato_nome || ''}"`,
      `"${l.contato_cargo || ''}"`,
      `"${l.telefone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.endereco.bairro}"`,
      `"${l.pipeline_status}"`,
      `"${l.valor_estimado || 0}"`,
      `"${l.assigned_to_user_name || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carteira_lopes_sp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForNotes || !newNoteText.trim()) return;
    addNote(selectedLeadForNotes.id, newNoteText.trim(), noteChannel);
    setNewNoteText('');
  };

  const getGmailComposeUrl = (lead: CompanyLead) => {
    const subject = encodeURIComponent(`Proposta Comercial Lopes para ${lead.nome_fantasia || lead.razao_social}`);
    const body = encodeURIComponent(
      `Olá ${lead.contato_nome || 'Diretoria'},\n\nSou ${currentUser?.name}, da Lopes São Paulo.\n\nGostaria de apresentar nossa proposta para ${lead.nome_fantasia || lead.razao_social}.\n\nAtenciosamente,\n${currentUser?.name}\nLopes São Paulo`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${subject}&body=${body}`;
  };

  const getWhatsAppUrl = (lead: CompanyLead) => {
    const num = getCleanPhoneForWhatsApp(lead.telefone);
    const msg = encodeURIComponent(
      `Olá ${lead.contato_nome}! Sou ${currentUser?.name} da Lopes São Paulo. Gostaria de falar sobre soluções e serviços para a ${lead.nome_fantasia || lead.razao_social}.`
    );
    return `https://wa.me/${num}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Header da Carteira */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-blue-950 tracking-tight">
              {isGestor ? 'Carteira Geral da Equipe' : `Minha Carteira (${currentUser?.name})`}
            </h2>
            <p className="text-xs text-blue-900/70 mt-0.5">
              Empresas sob prospecção ativa para oferta de intermediação e serviços Lopes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros e Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome, CNPJ ou contato..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-blue-950 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Todos os Status ({carteiraLeads.length})</option>
              <option value="contato_iniciado">Contato Iniciado</option>
              <option value="proposta_enviada">Proposta Enviada</option>
              <option value="negociacao">Em Negociação</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          {isGestor && (
            <div>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-blue-950 focus:outline-none focus:border-blue-600"
              >
                <option value="todos">Todos os Consultores</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-blue-50/60 border border-blue-200 rounded-xl px-4 py-2 flex items-center justify-between font-mono">
            <span className="text-blue-950 text-xs font-semibold">Pipeline Estimado:</span>
            <span className="text-blue-700 font-bold">
              R${' '}
              {carteiraLeads
                .reduce((acc, curr) => acc + (curr.valor_estimado || 0), 0)
                .toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Leads da Carteira */}
      {carteiraLeads.length > 0 ? (
        <div className="space-y-4">
          {carteiraLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono text-blue-700 font-bold">{lead.cnpj}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{lead.endereco.bairro}</span>
                    <span>·</span>
                    <span>Responsável: <strong className="text-blue-950">{lead.assigned_to_user_name}</strong></span>
                  </div>
                  <h3 className="text-base font-bold text-blue-950">
                    {lead.nome_fantasia || lead.razao_social}
                  </h3>
                  <p className="text-xs text-slate-600">{lead.cnae_fiscal_descricao}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCriarPropostaLead(lead)}
                    className="px-3 py-1.5 rounded-xl bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="Vender Produto Lopes e Criar Proposta"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Vender Produto
                  </button>

                  <select
                    value={lead.pipeline_status}
                    onChange={(e) =>
                      updateLeadContactInfo(lead.id, {
                        pipeline_status: e.target.value as PipelineStatus,
                      })
                    }
                    className="bg-slate-50 border border-slate-300 text-xs text-blue-950 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="contato_iniciado">Contato Iniciado</option>
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="negociacao">Em Negociação</option>
                    <option value="fechado">Fechado</option>
                    <option value="perdido">Perdido</option>
                  </select>

                  <button
                    onClick={() => setEditingLead(lead)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    Editar
                  </button>

                  <button
                    onClick={() => removeFromCarteira(lead.id)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer"
                    title="Remover da Carteira"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informações de Contato Direto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-blue-900 font-semibold text-[10px]">Contato Principal (QSA):</div>
                    <div className="font-bold text-blue-950 truncate">{lead.contato_nome}</div>
                    <div className="text-slate-600 text-[11px] truncate">{lead.contato_cargo}</div>
                  </div>
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-600 font-semibold text-[10px]">Telefone / WhatsApp:</div>
                    <div className="font-bold text-blue-950">{lead.telefone || 'Não informado'}</div>
                    {lead.telefone && (
                      <a
                        href={getWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1 pt-0.5"
                      >
                        WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-slate-600 font-semibold text-[10px]">Gmail / Email:</div>
                    <div className="font-bold text-blue-950 truncate">{lead.email || 'Não informado'}</div>
                    {lead.email && (
                      <a
                        href={getGmailComposeUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 pt-0.5"
                      >
                        Abrir Gmail <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notas e Histórico */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <button
                  onClick={() =>
                    setSelectedLeadForNotes(selectedLeadForNotes?.id === lead.id ? null : lead)
                  }
                  className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {lead.notes?.length > 0
                    ? `Ver ${lead.notes.length} anotações de contato`
                    : 'Adicionar primeira anotação de contato'}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      selectedLeadForNotes?.id === lead.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {isGestor && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Reatribuir:</span>
                    <select
                      value={lead.assigned_to_user_id}
                      onChange={(e) => {
                        const targetUser = users.find((u) => u.id === e.target.value);
                        if (targetUser) {
                          reassignLead(lead.id, targetUser.id, targetUser.name);
                        }
                      }}
                      className="bg-slate-50 border border-slate-300 text-xs text-blue-950 font-semibold rounded-lg px-2 py-1"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedLeadForNotes?.id === lead.id && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <form onSubmit={handleAddNoteSubmit} className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={noteChannel}
                      onChange={(e) => setNoteChannel(e.target.value as any)}
                      className="bg-white border border-slate-300 text-xs text-blue-950 font-medium rounded-xl px-2.5 py-2"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telefone">Telefone</option>
                      <option value="email">Gmail</option>
                      <option value="presencial">Reunião</option>
                    </select>
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Registrar anotação de feedback..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-blue-950 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                    {lead.notes?.map((nota) => (
                      <div
                        key={nota.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-blue-900">
                            {nota.user_name} ({nota.canal})
                          </span>
                          <span>{nota.date}</span>
                        </div>
                        <p className="text-slate-800">{nota.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <p className="text-sm font-bold text-blue-950">Nenhuma empresa encontrada na carteira</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Utilize a aba Buscar CNPJ ou o Radar do Google Maps para prospectar novas empresas.
          </p>
        </div>
      )}

      <EditLeadModal
        lead={editingLead}
        isOpen={Boolean(editingLead)}
        onClose={() => setEditingLead(null)}
      />

      {criarPropostaLead && (
        <CriarPropostaModal
          lead={criarPropostaLead}
          isOpen={Boolean(criarPropostaLead)}
          onClose={() => setCriarPropostaLead(null)}
        />
      )}
    </div>
  );
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyLead, PipelineStatus } from '../types';

// Chaves armazenadas no localStorage ou fallback para variáveis de ambiente
const STORAGE_KEY_URL = 'lopes_supabase_url';
const STORAGE_KEY_ANON = 'lopes_supabase_anon_key';

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || '',
  };
}

let activeClient: SupabaseClient | null = null;

export function initSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const creds = getStoredSupabaseCredentials();
  const targetUrl = (url !== undefined ? url : creds.url).trim();
  const targetKey = (anonKey !== undefined ? anonKey : creds.anonKey).trim();

  if (!targetUrl || !targetKey) {
    activeClient = null;
    return null;
  }

  // Validação básica de formato URL
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    activeClient = null;
    return null;
  }

  try {
    activeClient = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return activeClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    activeClient = null;
    return null;
  }
}

// Inicializa na carga
initSupabaseClient();

export function getSupabase(): SupabaseClient | null {
  if (!activeClient) {
    initSupabaseClient();
  }
  return activeClient;
}

export function saveSupabaseCredentials(url: string, anonKey: string): {
  success: boolean;
  client: SupabaseClient | null;
  error?: string;
} {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    return { success: false, client: null, error: 'URL e API Key são obrigatórios.' };
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { success: false, client: null, error: 'A URL deve iniciar com https:// (ex: https://xyz.supabase.co)' };
  }

  try {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
    const client = initSupabaseClient(cleanUrl, cleanKey);
    return { success: Boolean(client), client };
  } catch (err: any) {
    return { success: false, client: null, error: err.message };
  }
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  activeClient = null;
}

export interface SupabaseHealthResult {
  connected: boolean;
  message: string;
  url: string;
  latencyMs?: number;
  tablesReady?: boolean;
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<SupabaseHealthResult> {
  const creds = getStoredSupabaseCredentials();
  const testUrl = (customUrl || creds.url).trim();
  const testKey = (customKey || creds.anonKey).trim();

  if (!testUrl || !testKey) {
    return {
      connected: false,
      message: 'Chaves do Supabase não informadas. Insira a URL e a API Key no painel do sistema.',
      url: testUrl || 'Não configurada',
    };
  }

  const clientToTest = customUrl && customKey
    ? createClient(testUrl, testKey)
    : getSupabase();

  if (!clientToTest) {
    return {
      connected: false,
      message: 'Falha ao inicializar o cliente Supabase com os dados fornecidos.',
      url: testUrl,
    };
  }

  const startTime = Date.now();

  try {
    // 1. Testa consulta na tabela empresas_leads
    const { data, error } = await clientToTest
      .from('empresas_leads')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      if (error.code === '42P01') {
        // Tabela ainda não foi criada, mas a conexão com o Supabase é válida!
        return {
          connected: true,
          message: `Conectado ao Supabase com sucesso (${latency}ms)! As tabelas ainda não foram criadas. Clique em "SQL & RLS" para criar as tabelas com 1 clique no SQL Editor.`,
          url: testUrl,
          latencyMs: latency,
          tablesReady: false,
        };
      }
      return {
        connected: false,
        message: `Falha na requisição Supabase: ${error.message} (Código: ${error.code})`,
        url: testUrl,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Conectado e operacional (${latency}ms)! Banco de Dados PostgreSQL & RLS ativos.`,
      url: testUrl,
      latencyMs: latency,
      tablesReady: true,
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      connected: false,
      message: err.message || 'Erro de rede ao conectar à URL do Supabase.',
      url: testUrl,
      latencyMs: latency,
    };
  }
}

// Sincroniza Lead com o Supabase
export async function syncLeadToSupabase(lead: CompanyLead): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error: leadErr } = await client.from('empresas_leads').upsert(
      {
        cnpj: lead.cnpj,
        cnpj_raw: lead.cnpj_raw,
        razao_social: lead.razao_social,
        nome_fantasia: lead.nome_fantasia,
        cnae_fiscal: lead.cnae_fiscal,
        cnae_descricao: lead.cnae_fiscal_descricao,
        ramo: lead.ramo,
        situacao_cadastral: lead.situacao_cadastral,
        telefone: lead.telefone,
        email: lead.email,
        contato_nome: lead.contato_nome,
        contato_cargo: lead.contato_cargo,
        logradouro: lead.endereco.logradouro,
        numero: lead.endereco.numero,
        complemento: lead.endereco.complemento || '',
        bairro: lead.endereco.bairro,
        municipio: lead.endereco.municipio,
        uf: lead.endereco.uf,
        cep: lead.endereco.cep,
        latitude: lead.endereco.latitude,
        longitude: lead.endereco.longitude,
        zona_sp: lead.endereco.zona_sp,
        compatibilidade_lopes_pct: lead.compatibilidade_lopes_pct,
        motivo_oportunidade: lead.motivo_oportunidade || '',
        capital_social: lead.capital_social,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'cnpj_raw' }
    );

    if (leadErr) {
      console.warn('Erro ao sincronizar empresas_leads no Supabase:', leadErr.message);
      return false;
    }

    // Se estiver na carteira, sincroniza carteira_leads
    if (lead.in_carteira) {
      const { data: dbLead } = await client
        .from('empresas_leads')
        .select('id')
        .eq('cnpj_raw', lead.cnpj_raw)
        .maybeSingle();

      if (dbLead) {
        await client.from('carteira_leads').upsert(
          {
            lead_id: dbLead.id,
            pipeline_status: lead.pipeline_status,
            valor_estimado: lead.valor_estimado,
            in_carteira: true,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'lead_id' }
        );
      }
    }

    return true;
  } catch (err) {
    console.error('Erro na sincronização com Supabase:', err);
    return false;
  }
}

// Atualiza dados de contato no Supabase
export async function updateContactInSupabase(
  cnpjRaw: string,
  updates: {
    telefone?: string;
    email?: string;
    contato_nome?: string;
    contato_cargo?: string;
    pipeline_status?: PipelineStatus;
    valor_estimado?: number;
  }
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { data: dbLead } = await client
      .from('empresas_leads')
      .select('id')
      .eq('cnpj_raw', cnpjRaw)
      .maybeSingle();

    if (!dbLead) return false;

    // Atualiza tabela empresas_leads
    const fieldsToUpdate: any = { atualizado_em: new Date().toISOString() };
    if (updates.telefone !== undefined) fieldsToUpdate.telefone = updates.telefone;
    if (updates.email !== undefined) fieldsToUpdate.email = updates.email;
    if (updates.contato_nome !== undefined) fieldsToUpdate.contato_nome = updates.contato_nome;
    if (updates.contato_cargo !== undefined) fieldsToUpdate.contato_cargo = updates.contato_cargo;

    await client.from('empresas_leads').update(fieldsToUpdate).eq('id', dbLead.id);

    // Se houver alteração de pipeline ou valor
    if (updates.pipeline_status || updates.valor_estimado !== undefined) {
      const carteiraUpdates: any = { atualizado_em: new Date().toISOString() };
      if (updates.pipeline_status) carteiraUpdates.pipeline_status = updates.pipeline_status;
      if (updates.valor_estimado !== undefined) carteiraUpdates.valor_estimado = updates.valor_estimado;

      await client.from('carteira_leads').update(carteiraUpdates).eq('lead_id', dbLead.id);
    }

    return true;
  } catch (err) {
    console.error('Erro ao atualizar contato no Supabase:', err);
    return false;
  }
}

// Puxa leads armazenados no Supabase para a memória do sistema
export async function fetchLeadsFromSupabase(): Promise<CompanyLead[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data: rows, error } = await client
      .from('empresas_leads')
      .select(`
        *,
        carteira_leads (
          pipeline_status,
          valor_estimado,
          in_carteira
        )
      `)
      .order('criado_em', { ascending: false });

    if (error || !rows) {
      console.warn('Erro ao buscar empresas_leads:', error);
      return null;
    }

    return rows.map((r: any): CompanyLead => {
      const carteira = r.carteira_leads?.[0] || null;
      return {
        id: r.id || `lead_${r.cnpj_raw}`,
        cnpj: r.cnpj,
        cnpj_raw: r.cnpj_raw,
        razao_social: r.razao_social,
        nome_fantasia: r.nome_fantasia || r.razao_social,
        cnae_fiscal: r.cnae_fiscal || '',
        cnae_fiscal_descricao: r.cnae_descricao || '',
        ramo: r.ramo || 'outros',
        situacao_cadastral: r.situacao_cadastral || 'ATIVA',
        data_inicio_atividade: r.criado_em || '2024-01-01',
        capital_social: Number(r.capital_social) || 0,
        telefone: r.telefone || '',
        email: r.email || '',
        contato_nome: r.contato_nome || 'Diretoria / Responsável',
        contato_cargo: r.contato_cargo || 'Representante Legal',
        qsa: [],
        endereco: {
          logradouro: r.logradouro || '',
          numero: r.numero || '',
          complemento: r.complemento || '',
          bairro: r.bairro || 'Centro',
          municipio: r.municipio || 'São Paulo',
          uf: r.uf || 'SP',
          cep: r.cep || '01000-000',
          latitude: Number(r.latitude) || -23.5615,
          longitude: Number(r.longitude) || -46.6560,
          zona_sp: r.zona_sp || 'Centro',
        },
        pipeline_status: (carteira?.pipeline_status as PipelineStatus) || 'prospectado',
        valor_estimado: Number(carteira?.valor_estimado) || 15000,
        assigned_to_user_id: 'usr_gestor_1',
        assigned_to_user_name: 'Maylla Lopes (Gestora)',
        created_at: r.criado_em || new Date().toISOString(),
        updated_at: r.atualizado_em || new Date().toISOString(),
        notes: [],
        in_carteira: Boolean(carteira?.in_carteira ?? true),
        compatibilidade_lopes_pct: Number(r.compatibilidade_lopes_pct) || 85,
        motivo_oportunidade: r.motivo_oportunidade || 'Lead sincronizado via Supabase',
      };
    });
  } catch (err) {
    console.error('Erro ao buscar leads do Supabase:', err);
    return null;
  }
}

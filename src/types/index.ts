export type UserRole = 'gestor' | 'vendedor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  cargo: string;
  meta_mensal?: number;
}

export type PipelineStatus = 
  | 'prospectado'
  | 'contato_iniciado'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado'
  | 'perdido';

export type RamoAtividade = 
  | 'imobiliaria'
  | 'prestacao_servicos_lopes'
  | 'facility_condominios'
  | 'consultoria_gestao'
  | 'tecnologia_software'
  | 'saude_medicina'
  | 'alimentacao_restaurantes'
  | 'direito_juridico'
  | 'contabilidade_financeiro'
  | 'construcao_engenharia'
  | 'educacao'
  | 'logistica_transporte'
  | 'comercio_varejo'
  | 'industria'
  | 'outros'
  | string;

export interface SocioQSA {
  nome_socio: string;
  qualificacao_socio: string;
  faixa_etaria?: string;
  cpf_representante_legal?: string;
  nome_representante?: string;
}

export interface EnderecoEmpresa {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  latitude: number;
  longitude: number;
  zona_sp?: 'Centro' | 'Zona Sul' | 'Zona Oeste' | 'Zona Norte' | 'Zona Leste' | 'Grande SP';
}

export interface InteracaoNota {
  id: string;
  user_name: string;
  date: string;
  text: string;
  canal: 'whatsapp' | 'email' | 'telefone' | 'presencial';
}

export interface CompanyLead {
  id: string;
  cnpj: string;
  cnpj_raw: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  cnaes_secundarios?: Array<{ codigo: string | number; descricao: string }>;
  ramo: RamoAtividade;
  ramo_nome_amigavel?: string;
  situacao_cadastral: string;
  data_inicio_atividade: string;
  capital_social: number;
  telefone: string;
  email: string;
  contato_nome: string; // Automaticamente preenchido pelo QSA
  contato_cargo: string;
  qsa: SocioQSA[];
  endereco: EnderecoEmpresa;
  pipeline_status: PipelineStatus;
  valor_estimado: number;
  assigned_to_user_id: string;
  assigned_to_user_name: string;
  created_at: string;
  updated_at: string;
  notes: InteracaoNota[];
  in_carteira: boolean;
  distancia_km?: number;
  compatibilidade_lopes_pct: number;
  motivo_oportunidade?: string;
}

export interface RadarFilter {
  centerLat: number;
  centerLng: number;
  centerName: string;
  radiusKm: number;
  ramo: string; // 'todos' ou qualquer categoria específica
  ramoBuscaLivre: string; // Campo aberto para buscar QUALQUER ramo ou CNAE (ex: "médico", "software", "padaria", "farmácia")
  status: 'todos' | PipelineStatus;
  apenasMinhaCarteira: boolean;
  somenteComTelefone: boolean;
  somenteComEmail: boolean;
}

export type AppMode = 'vendedor' | 'cliente';

export type StatusSolicitacao = 
  | 'proposta_disponivel'
  | 'aprovada_pelo_cliente'
  | 'em_revisao'
  | 'contrato_emitido'
  | 'recusada';

export interface SolicitacaoHistoricoItem {
  id: string;
  data: string;
  autor: string;
  papel: 'vendedor' | 'cliente';
  mensagem: string;
  novo_status?: StatusSolicitacao;
}

export interface SolicitacaoProposta {
  id: string; // Ex: "PROP-2026-001"
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
  vendedor_id: string;
  vendedor_nome: string;
  vendedor_cargo: string;
  vendedor_telefone: string;
  vendedor_email: string;
  status: StatusSolicitacao;
  data_criacao: string;
  data_atualizacao: string;
  observacoes_cliente?: string;
  historico: SolicitacaoHistoricoItem[];
}

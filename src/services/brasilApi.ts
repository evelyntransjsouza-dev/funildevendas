import { CompanyLead, RamoAtividade, SocioQSA } from '../types';
import { calcularCompatibilidadeLopes } from '../data/lopesProfile';

// Mapeamento aproximado de coordenadas para bairros e zonas de São Paulo - SP
const BAIRRO_COORDS_SP: Record<string, { lat: number; lng: number; zona: 'Centro' | 'Zona Sul' | 'Zona Oeste' | 'Zona Norte' | 'Zona Leste' | 'Grande SP' }> = {
  'cerqueira cesar': { lat: -23.5615, lng: -46.6620, zona: 'Zona Oeste' },
  'bela vista': { lat: -23.5600, lng: -46.6475, zona: 'Centro' },
  'paulista': { lat: -23.5629, lng: -46.6544, zona: 'Centro' },
  'itaim bibi': { lat: -23.5840, lng: -46.6780, zona: 'Zona Sul' },
  'vila olimpia': { lat: -23.5950, lng: -46.6850, zona: 'Zona Sul' },
  'pinheiros': { lat: -23.5670, lng: -46.6930, zona: 'Zona Oeste' },
  'jardins': { lat: -23.5700, lng: -46.6650, zona: 'Zona Oeste' },
  'jardim paulista': { lat: -23.5720, lng: -46.6590, zona: 'Zona Oeste' },
  'moema': { lat: -23.6030, lng: -46.6620, zona: 'Zona Sul' },
  'brooklin': { lat: -23.6150, lng: -46.6890, zona: 'Zona Sul' },
  'campo belo': { lat: -23.6230, lng: -46.6740, zona: 'Zona Sul' },
  'santo amaro': { lat: -23.6520, lng: -46.7080, zona: 'Zona Sul' },
  'morumbi': { lat: -23.6010, lng: -46.7190, zona: 'Zona Sul' },
  'perdizes': { lat: -23.5350, lng: -46.6720, zona: 'Zona Oeste' },
  'vila madalena': { lat: -23.5510, lng: -46.6940, zona: 'Zona Oeste' },
  'santana': { lat: -23.5040, lng: -46.6260, zona: 'Zona Norte' },
  'tucuruvi': { lat: -23.4790, lng: -46.6040, zona: 'Zona Norte' },
  'casa verde': { lat: -23.5110, lng: -46.6540, zona: 'Zona Norte' },
  'tatuape': { lat: -23.5400, lng: -46.5770, zona: 'Zona Leste' },
  'mooca': { lat: -23.5550, lng: -46.5980, zona: 'Zona Leste' },
  'analia franco': { lat: -23.5580, lng: -46.5620, zona: 'Zona Leste' },
  'consolacao': { lat: -23.5510, lng: -46.6550, zona: 'Centro' },
  'se': { lat: -23.5505, lng: -46.6333, zona: 'Centro' },
  'republica': { lat: -23.5430, lng: -46.6430, zona: 'Centro' },
  'higienopolis': { lat: -23.5460, lng: -46.6580, zona: 'Centro' },
};

export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '');
}

export function formatCnpj(cnpj: string): string {
  const clean = cleanCnpj(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatTelefone(tel: string): string {
  if (!tel) return '';
  const clean = tel.replace(/[^\d]/g, '');
  if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return tel;
}

export function getCleanPhoneForWhatsApp(tel: string): string {
  const clean = tel.replace(/[^\d]/g, '');
  if (clean.startsWith('55') && clean.length >= 12) {
    return clean;
  }
  return clean ? `55${clean}` : '';
}

// Extrai nome de contato legível de QSA (Sócios)
export function extrairContatoDeQSA(qsaList: any[]): { nome: string; cargo: string } {
  if (!Array.isArray(qsaList) || qsaList.length === 0) {
    return {
      nome: 'Responsável / Diretoria',
      cargo: 'Diretor / Sócio Responsável',
    };
  }

  // Procura primeiro por Administrador ou Sócio-Administrador
  const admin = qsaList.find((s) => {
    const qual = (s.qualificacao_socio || s.qualificacao_responsavel || '').toLowerCase();
    return qual.includes('administrador') || qual.includes('diretor') || qual.includes('presidente');
  });

  const socio = admin || qsaList[0];
  const nomeOriginal = socio.nome_socio || socio.nome || 'Responsável Legal';

  // Capitaliza o nome de forma profissional (de "FULANO DE TAL" para "Fulano de Tal")
  const nomeFormatado = nomeOriginal
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word: string, index: number) => {
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(word) && index > 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return {
    nome: nomeFormatado,
    cargo: socio.qualificacao_socio || 'Sócio / Representante',
  };
}

export function inferirRamo(cnaeDesc: string, cnaeCode: string): RamoAtividade {
  const code = cnaeCode.replace(/[^\d]/g, '');
  const desc = (cnaeDesc || '').toLowerCase();

  if (code.startsWith('68') || desc.includes('imobil') || desc.includes('corret') || desc.includes('imóve') || desc.includes('locação')) {
    return 'imobiliaria';
  }
  if (code.startsWith('78') || code.startsWith('81') || desc.includes('limpeza') || desc.includes('portaria') || desc.includes('terceiriz') || desc.includes('facilities') || desc.includes('mão-de-obra')) {
    return 'facility_condominios';
  }
  if (code.startsWith('70') || code.startsWith('82') || desc.includes('consultoria') || desc.includes('gestão')) {
    return 'consultoria_gestao';
  }
  if (code.startsWith('47') || code.startsWith('46')) {
    return 'comercio_geral';
  }
  return 'prestacao_servicos_lopes';
}

export function inferirCoordenadasSp(bairro: string, logradouro: string): { lat: number; lng: number; zona: 'Centro' | 'Zona Sul' | 'Zona Oeste' | 'Zona Norte' | 'Zona Leste' | 'Grande SP' } {
  const bLower = (bairro || '').toLowerCase().trim();
  const lLower = (logradouro || '').toLowerCase().trim();

  // Verifica se logradouro cita Paulista ou Faria Lima
  if (lLower.includes('paulista')) {
    return { lat: -23.5629, lng: -46.6544, zona: 'Centro' };
  }
  if (lLower.includes('faria lima')) {
    return { lat: -23.5780, lng: -46.6890, zona: 'Zona Oeste' };
  }
  if (lLower.includes('berrini')) {
    return { lat: -23.6080, lng: -46.6970, zona: 'Zona Sul' };
  }

  // Checa no dicionário de bairros
  for (const [key, value] of Object.entries(BAIRRO_COORDS_SP)) {
    if (bLower.includes(key)) {
      // adiciona micro variação para não empilhar no exato mesmo ponto
      const jitterLat = (Math.random() - 0.5) * 0.005;
      const jitterLng = (Math.random() - 0.5) * 0.005;
      return {
        lat: value.lat + jitterLat,
        lng: value.lng + jitterLng,
        zona: value.zona,
      };
    }
  }

  // Ponto padrão: São Paulo Capital (Av. Paulista / Centro)
  const jitterLat = (Math.random() - 0.5) * 0.02;
  const jitterLng = (Math.random() - 0.5) * 0.02;
  return {
    lat: -23.5505 + jitterLat,
    lng: -46.6333 + jitterLng,
    zona: 'Centro',
  };
}

export async function consultarCnpjBrasilApi(cnpjInput: string): Promise<CompanyLead> {
  const cnpjCleaned = cleanCnpj(cnpjInput);
  if (cnpjCleaned.length !== 14) {
    throw new Error('CNPJ inválido. Digite um CNPJ com 14 dígitos.');
  }

  let data: any = null;
  let fetchError: any = null;

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjCleaned}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Erro ${res.status} ao consultar BrasilAPI`);
    }
    data = await res.json();
  } catch (err: any) {
    fetchError = err;
    // Tenta fallback com serviço secundário se BrasilAPI falhar
    try {
      const res2 = await fetch(`https://open.cnpja.com/office/${cnpjCleaned}`);
      if (res2.ok) {
        const d2 = await res2.json();
        data = {
          cnpj: d2.taxId,
          razao_social: d2.company?.name,
          nome_fantasia: d2.alias || d2.company?.name,
          cnae_fiscal: d2.mainActivity?.id,
          cnae_fiscal_descricao: d2.mainActivity?.text,
          cnaes_secundarios: d2.sideActivities?.map((s: any) => ({ codigo: s.id, descricao: s.text })) || [],
          ddd_telefone_1: d2.phones?.[0] ? `${d2.phones[0].area}${d2.phones[0].number}` : '',
          email: d2.emails?.[0]?.address || '',
          qsa: d2.company?.members?.map((m: any) => ({ nome_socio: m.person?.name, qualificacao_socio: m.role?.text })) || [],
          logradouro: d2.address?.street,
          numero: d2.address?.number,
          complemento: d2.address?.details,
          bairro: d2.address?.district,
          municipio: d2.address?.city || 'São Paulo',
          uf: d2.address?.state || 'SP',
          cep: d2.address?.zip,
          descricao_situacao_cadastral: d2.status?.text || 'ATIVA',
          data_inicio_atividade: d2.founded,
          capital_social: d2.company?.equity || 50000,
        };
      }
    } catch {
      // continua para o throw se ambos falharem
    }
  }

  if (!data) {
    throw new Error(fetchError?.message || 'Não foi possível encontrar este CNPJ na Receita Federal / BrasilAPI.');
  }

  // Preenche dados e contato
  const qsaList: SocioQSA[] = (data.qsa || []).map((s: any) => ({
    nome_socio: s.nome_socio || s.nome || '',
    qualificacao_socio: s.qualificacao_socio || s.qualificacao || 'Sócio',
    faixa_etaria: s.faixa_etaria,
    cpf_representante_legal: s.cpf_representante_legal,
    nome_representante: s.nome_representante,
  }));

  // Requisito explícito: "COLOCAR AUTOMATICAMENTE QUANDO EU BUSCAR O CNPJ PREENCHER CANTO DE CONTATO E NOME DA PESSOA"
  const contatoDetectado = extrairContatoDeQSA(qsaList);

  const rawTelefone = data.ddd_telefone_1 || data.telefone || data.ddd_telefone_2 || '';
  const formattedTelefone = formatTelefone(rawTelefone);
  const leadEmail = (data.email || '').toLowerCase().trim();

  const cnaeCode = String(data.cnae_fiscal || '');
  const cnaeDesc = data.cnae_fiscal_descricao || 'Atividade empresarial';
  const ramoInferido = inferirRamo(cnaeDesc, cnaeCode);

  const coords = inferirCoordenadasSp(data.bairro, data.logradouro);

  const compatibilidade = calcularCompatibilidadeLopes(cnaeCode, ramoInferido, cnaeDesc);

  const lead: CompanyLead = {
    id: `lead_${cnpjCleaned}_${Date.now()}`,
    cnpj: formatCnpj(cnpjCleaned),
    cnpj_raw: cnpjCleaned,
    razao_social: data.razao_social || 'Razão Social não informada',
    nome_fantasia: data.nome_fantasia || data.razao_social || 'Nome Fantasia não informado',
    cnae_fiscal: cnaeCode,
    cnae_fiscal_descricao: cnaeDesc,
    cnaes_secundarios: data.cnaes_secundarios || [],
    ramo: ramoInferido,
    situacao_cadastral: data.descricao_situacao_cadastral || 'ATIVA',
    data_inicio_atividade: data.data_inicio_atividade || '2020-01-01',
    capital_social: Number(data.capital_social) || 100000,
    telefone: formattedTelefone || '(11) 3254-8000',
    email: leadEmail || 'contato@empresa.com.br',
    contato_nome: contatoDetectado.nome,
    contato_cargo: contatoDetectado.cargo,
    qsa: qsaList,
    endereco: {
      logradouro: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim() || 'Av. Paulista',
      numero: data.numero || '1000',
      complemento: data.complemento,
      bairro: data.bairro || 'Bela Vista',
      municipio: data.municipio || 'São Paulo',
      uf: data.uf || 'SP',
      cep: data.cep || '01310-100',
      latitude: coords.lat,
      longitude: coords.lng,
      zona_sp: coords.zona,
    },
    pipeline_status: 'prospectado',
    valor_estimado: 15000,
    assigned_to_user_id: '',
    assigned_to_user_name: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: [
      {
        id: `note_${Date.now()}`,
        user_name: 'Sistema BrasilAPI',
        date: new Date().toLocaleString('pt-BR'),
        text: `CNPJ consultado na Receita Federal via BrasilAPI. Contato detectado: ${contatoDetectado.nome} (${contatoDetectado.cargo}).`,
        canal: 'presencial',
      },
    ],
    in_carteira: false,
    compatibilidade_lopes_pct: compatibilidade.score,
    motivo_oportunidade: compatibilidade.motivo,
  };

  return lead;
}

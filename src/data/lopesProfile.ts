export interface LopesCnaeItem {
  codigo: string;
  descricao: string;
  categoria: 'imobiliario' | 'servicos' | 'facilities' | 'gestao';
  propostaValor: string;
}

export const LOPES_COMPANY_PROFILE = {
  nome: 'Lopes Prestação de Serviços & Soluções Imobiliárias',
  cnaePrincipal: {
    codigo: '6821-8/01',
    codigoFormatado: '68.21-8-01',
    descricao: 'Corretagem na compra e venda e avaliação de imóveis',
  },
  cnaesServicosLopes: [
    {
      codigo: '68.21-8-01',
      descricao: 'Corretagem na compra e venda e avaliação de imóveis',
      categoria: 'imobiliario',
      propostaValor: 'Parcerias imobiliárias, intermediação de ativos e carteiras comerciais.',
    },
    {
      codigo: '68.21-8-02',
      descricao: 'Intermediação na compra, venda e locação de imóveis',
      categoria: 'imobiliario',
      propostaValor: 'Locação corporativa, expansão de sedes e desmobilização de ativos.',
    },
    {
      codigo: '68.22-6-00',
      descricao: 'Gestão e administração da propriedade imobiliária',
      categoria: 'imobiliario',
      propostaValor: 'Gestão patrimonial, administração condominial e mall corporate.',
    },
    {
      codigo: '78.10-8-00',
      descricao: 'Locação de mão-de-obra temporária e serviços de apoio',
      categoria: 'servicos',
      propostaValor: 'Fornecimento de equipes qualificadas para portaria, recepção e backoffice.',
    },
    {
      codigo: '81.11-7-00',
      descricao: 'Serviços combinados para apoio a edifícios e condomínios',
      categoria: 'facilities',
      propostaValor: 'Manutenção predial integrada, zeladoria, facilities e conservação.',
    },
    {
      codigo: '70.20-4-00',
      descricao: 'Atividades de consultoria em gestão empresarial',
      categoria: 'gestao',
      propostaValor: 'Otimização de custos fixos, renegociação de contratos e aluguel comercial.',
    },
    {
      codigo: '82.11-3-00',
      descricao: 'Serviços combinados de escritório e apoio administrativo',
      categoria: 'servicos',
      propostaValor: 'Terceirização de processos operacionais e suporte comercial Lopes.',
    },
  ] as LopesCnaeItem[],
};

export function calcularCompatibilidadeLopes(cnaeLead: string, ramoLead: string, descricaoLead: string): {
  score: number;
  motivo: string;
} {
  const cnaeClean = cnaeLead.replace(/[^\d]/g, '');
  const descLower = descricaoLead.toLowerCase();

  // Se for imobiliária
  if (cnaeClean.startsWith('68') || descLower.includes('imobil') || descLower.includes('corret') || descLower.includes('imoveis')) {
    return {
      score: 96,
      motivo: 'Forte sinergia imobiliária (CNAE 68): Co-brokerage, repasse de carteiras e permutas em SP.',
    };
  }

  // Se for prestação de serviços / facilities / mão de obra
  if (cnaeClean.startsWith('78') || cnaeClean.startsWith('81') || descLower.includes('limpeza') || descLower.includes('portaria') || descLower.includes('facilities') || descLower.includes('conservacao')) {
    return {
      score: 92,
      motivo: 'Alinhamento direto com serviços de apoio e facilities Lopes (CNAE 78/81).',
    };
  }

  // Se for consultoria, gestão ou apoio administrativo
  if (cnaeClean.startsWith('70') || cnaeClean.startsWith('82') || descLower.includes('consultoria') || descLower.includes('administra')) {
    return {
      score: 85,
      motivo: 'Potencial cliente corporativo para prestação de serviços e gestão imobiliária Lopes.',
    };
  }

  // Se for construção civil ou incorporação
  if (cnaeClean.startsWith('41') || cnaeClean.startsWith('42') || cnaeClean.startsWith('43') || descLower.includes('constru') || descLower.includes('incorpor')) {
    return {
      score: 89,
      motivo: 'Demanda contínua por vendas de lançamentos e administração de condomínios.',
    };
  }

  return {
    score: 72,
    motivo: 'Oportunidade de prestação de serviços de facilities e renegociação imobiliária Lopes.',
  };
}

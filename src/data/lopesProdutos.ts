import { SolicitacaoProposta } from '../types';

export interface ProdutoCatalogo {
  id: string;
  categoria: 'imoveis' | 'locacao_corporativa' | 'expansao_franquias' | 'facilities' | 'consultoria';
  nome: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  valorSugerido: number;
  condicoesSugeridas: string;
  prazoDiasPadrao: number;
  beneficios: string[];
}

export const PRODUTOS_CATALOGO_LOPES: ProdutoCatalogo[] = [
  {
    id: 'prod_lopes_venda',
    categoria: 'imoveis',
    nome: 'Intermediação e Venda Imobiliária Exclusiva Lopes',
    descricaoCurta: 'Venda de imóveis comerciais e corporativos com a maior rede imobiliária do Brasil.',
    descricaoCompleta: 'Plano comercial completo com vistoria técnica, precificação por inteligência de mercado Lopes, veiculação nos principais portais e ação ativa com corretores credenciados.',
    valorSugerido: 45000.00,
    condicoesSugeridas: 'Comissão de 6% sobre o valor venal no êxito da escritura ou contrato de compra e venda.',
    prazoDiasPadrao: 180,
    beneficios: [
      'Divulgação em rede exclusiva de mais de 10.000 corretores Lopes',
      'Fotografia profissional e tour virtual 360° do imóvel',
      'Assessoria jurídica completa para análise documental de compradores',
      'Garantia de atendimento ágil e visitas qualificadas com agendamento'
    ]
  },
  {
    id: 'prod_lopes_locacao',
    categoria: 'locacao_corporativa',
    nome: 'Locação Comercial & Lajes Corporativas SP',
    descricaoCurta: 'Locação ágil para lajes, consultórios e sedes empresariais nas melhores regiões de São Paulo.',
    descricaoCompleta: 'Estruturação da proposta de locação comercial, seleção rigorosa de inquilinos com análise de crédito e seguro fiança, garantindo rentabilidade e segurança contratual.',
    valorSugerido: 25000.00,
    condicoesSugeridas: 'Taxa de intermediação de 1º aluguel + taxa de administração de 8% mensal.',
    prazoDiasPadrao: 90,
    beneficios: [
      'Garantia de análise cadastral e financeira em menos de 24h',
      'Minutas contratuais corporativas personalizadas com compliance',
      'Vistoria de entrada e saída com laudo fotográfico detalhado',
      'Cobrança e repasse automatizado de aluguéis e encargos'
    ]
  },
  {
    id: 'prod_lopes_expansao',
    categoria: 'expansao_franquias',
    nome: 'Expansão de Pontos Comerciais & Franquias',
    descricaoCurta: 'Mapeamento estratégico e captação de pontos comerciais de alto tráfego em SP.',
    descricaoCompleta: 'Inteligência geográfica Lopes para abertura de filiais, lojas de rua, quiosques ou sedes corporativas nas principais avenidas e centros comerciais de São Paulo.',
    valorSugerido: 35000.00,
    condicoesSugeridas: 'Honorários de captação fixa + taxa de sucesso na assinatura da locação/compra.',
    prazoDiasPadrao: 120,
    beneficios: [
      'Estudo de geomarketing com densidade demográfica e poder aquisitivo',
      'Acesso a imóveis fora do mercado (off-market e exclusivos)',
      'Negociação direta com proprietários para adequação de carência de obra',
      'Suporte na obtenção de alvarás e viabilidade urbanística municipal'
    ]
  },
  {
    id: 'prod_lopes_facilities',
    categoria: 'facilities',
    nome: 'Gestão de Facilities & Infraestrutura Predial',
    descricaoCurta: 'Serviços integrados de portaria, zeladoria, limpeza técnica e manutenção comercial.',
    descricaoCompleta: 'Atendimento às exigências do CNAE 81.11-7 e 78.10-8 com equipe terceirizada especializada, treinamento contínuo, supervisão periódica e substituição imediata.',
    valorSugerido: 18500.00,
    condicoesSugeridas: 'Contrato anual com mensalidades faturadas via boleto bancário a cada 30 dias.',
    prazoDiasPadrao: 365,
    beneficios: [
      'Equipe uniformizada e rigorosamente capacitada para ambiente corporativo',
      'Zero passivo trabalhista para o cliente contratante',
      'Supervisão operacional 24/7 com relatórios mensais de conformidade',
      'Fornecimento de equipamentos e insumos certificados'
    ]
  },
  {
    id: 'prod_lopes_consultoria',
    categoria: 'consultoria',
    nome: 'Consultoria e Avaliação Patrimonial (Valuation)',
    descricaoCurta: 'Laudo mercadológico de precisão e reestruturação patrimonial de empresas.',
    descricaoCompleta: 'Elaboração de laudo de avaliação segundo normas da ABNT (NBR 14.653) para fins contábeis, garantias bancárias, reavaliação de ativos ou cisões societárias.',
    valorSugerido: 12000.00,
    condicoesSugeridas: '50% na contratação + 50% na entrega e protocolo do laudo técnico assinado.',
    prazoDiasPadrao: 30,
    beneficios: [
      'Engenheiros e peritos avaliadores credenciados pelo CREA e COFECI',
      'Válido judicialmente para garantias bancárias e inventários',
      'Mapeamento comparativo com base de dados de transações reais em SP',
      'Diagnóstico de vocação imobiliária para máxima valorização'
    ]
  }
];

export const SEED_SOLICITACOES: SolicitacaoProposta[] = [
  {
    id: 'PROP-2026-001',
    lead_id: 'lead_lopes_01',
    cnpj: '62.000.123/0001-45',
    cnpj_raw: '62000123000145',
    razao_social: 'Lopes Consultoria de Imóveis S.A.',
    nome_fantasia: 'Lopes Imobiliária - Jardins HQ',
    cnae_descricao: 'Corretagem na compra e venda e avaliação de imóveis (68.21-8-01)',
    produto_lopes: 'Intermediação e Venda Imobiliária Exclusiva Lopes',
    categoria_produto: 'imoveis',
    descricao_produto: 'Proposta de parceria comercial para exclusividade de vendas corporativas na Zona Oeste e Jardins de SP.',
    valor_proposta: 85000.00,
    condicoes_pagamento: 'Comissão negociada de 5% no êxito das vendas de carteira fechada.',
    validade_dias: 30,
    vendedor_id: 'vendedor_carlos_01',
    vendedor_nome: 'Carlos Silva',
    vendedor_cargo: 'Consultor Comercial Imobiliário Senior',
    vendedor_telefone: '(11) 91234-5678',
    vendedor_email: 'carlos.silva@lopes.com.br',
    status: 'proposta_disponivel',
    data_criacao: '2026-10-01T10:00:00Z',
    data_atualizacao: '2026-10-01T10:00:00Z',
    historico: [
      {
        id: 'hist_01',
        data: '2026-10-01T10:00:00Z',
        autor: 'Carlos Silva (Consultor Lopes)',
        papel: 'vendedor',
        mensagem: 'Proposta inicial elaborada e disponibilizada para o cliente verificar no portal.',
        novo_status: 'proposta_disponivel'
      }
    ]
  },
  {
    id: 'PROP-2026-002',
    lead_id: 'lead_quinto_02',
    cnpj: '16.789.012/0001-34',
    cnpj_raw: '16789012000134',
    razao_social: 'Quinto Andar Serviços Imobiliários Ltda.',
    nome_fantasia: 'QuintoAndar SP Corporate',
    cnae_descricao: 'Serviços combinados de escritório e apoio administrativo (82.11-3-00)',
    produto_lopes: 'Gestão de Facilities & Infraestrutura Predial',
    categoria_produto: 'facilities',
    descricao_produto: 'Contrato corporativo para terceirização e gestão de infraestrutura de escritórios na Vila Olímpia.',
    valor_proposta: 38000.00,
    condicoes_pagamento: 'Pagamento mensal de R$ 38.000,00 faturado com vencimento dia 10 de cada mês.',
    validade_dias: 45,
    vendedor_id: 'vendedor_juliana_02',
    vendedor_nome: 'Juliana Mendes',
    vendedor_cargo: 'Consultora de Facilities & Serviços Lopes',
    vendedor_telefone: '(11) 97654-3210',
    vendedor_email: 'juliana.mendes@lopes.com.br',
    status: 'aprovada_pelo_cliente',
    data_criacao: '2026-09-28T14:30:00Z',
    data_atualizacao: '2026-10-01T09:15:00Z',
    observacoes_cliente: 'Proposta aprovada pela diretoria. Aguardando minuta do contrato de prestação.',
    historico: [
      {
        id: 'hist_02_1',
        data: '2026-09-28T14:30:00Z',
        autor: 'Juliana Mendes (Consultora Lopes)',
        papel: 'vendedor',
        mensagem: 'Proposta comercial de Facilities e Portaria enviada.',
        novo_status: 'proposta_disponivel'
      },
      {
        id: 'hist_02_2',
        data: '2026-10-01T09:15:00Z',
        autor: 'Representante QuintoAndar (Cliente)',
        papel: 'cliente',
        mensagem: 'Condições comerciais acordadas e aprovadas pelo conselho gestor.',
        novo_status: 'aprovada_pelo_cliente'
      }
    ]
  },
  {
    id: 'PROP-2026-003',
    lead_id: 'lead_loft_03',
    cnpj: '30.456.789/0001-90',
    cnpj_raw: '30456789000190',
    razao_social: 'Loft I Soluções Imobiliárias S.A.',
    nome_fantasia: 'Loft São Paulo Hub Faria Lima',
    cnae_descricao: 'Corretagem no aluguel de imóveis (68.21-8-02)',
    produto_lopes: 'Locação Comercial & Lajes Corporativas SP',
    categoria_produto: 'locacao_corporativa',
    descricao_produto: 'Locação de conjunto corporativo de 420m² na região do Itaim Bibi / Faria Lima.',
    valor_proposta: 52000.00,
    condicoes_pagamento: 'Aluguel mensal + condomínio com carência de 60 dias para obras.',
    validade_dias: 20,
    vendedor_id: 'vendedor_carlos_01',
    vendedor_nome: 'Carlos Silva',
    vendedor_cargo: 'Consultor Comercial Imobiliário Senior',
    vendedor_telefone: '(11) 91234-5678',
    vendedor_email: 'carlos.silva@lopes.com.br',
    status: 'em_revisao',
    data_criacao: '2026-09-29T16:00:00Z',
    data_atualizacao: '2026-09-30T11:20:00Z',
    observacoes_cliente: 'Cliente solicitou aumento da carência de 60 para 90 dias.',
    historico: [
      {
        id: 'hist_03_1',
        data: '2026-09-29T16:00:00Z',
        autor: 'Carlos Silva (Consultor Lopes)',
        papel: 'vendedor',
        mensagem: 'Proposta de locação corporativa enviada para análise.',
        novo_status: 'proposta_disponivel'
      },
      {
        id: 'hist_03_2',
        data: '2026-09-30T11:20:00Z',
        autor: 'Gestor Loft (Cliente)',
        papel: 'cliente',
        mensagem: 'Gostaria de verificar se conseguimos estender a carência de reforma para 90 dias.',
        novo_status: 'em_revisao'
      }
    ]
  }
];

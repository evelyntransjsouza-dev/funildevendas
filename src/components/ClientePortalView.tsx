import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import { SolicitacaoProposta, StatusSolicitacao } from '../types';
import {
  Building2,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  MessageCircle,
  Send,
  User,
  Phone,
  Mail,
  Printer,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  XCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const ClientePortalView: React.FC = () => {
  const {
    solicitacoes,
    solicitacaoSelecionada,
    setSolicitacaoSelecionada,
    responderSolicitacaoCliente,
    buscarSolicitacoesPorCnpjOuCodigo,
    setAppMode,
  } = useLeads();

  const [buscaTermo, setBuscaTermo] = useState('');
  const [mensagemRevisao, setMensagemRevisao] = useState('');
  const [modalRevisaoOpen, setModalRevisaoOpen] = useState(false);
  const [modalAprovadoSucesso, setModalAprovadoSucesso] = useState(false);

  // Filtra as solicitações com base no termo
  const solicitacoesFiltradas = buscarSolicitacoesPorCnpjOuCodigo(buscaTermo);

  // Proposta ativa no detalhe (ou primeira encontrada)
  const propostaAtiva =
    solicitacaoSelecionada || (solicitacoesFiltradas.length > 0 ? solicitacoesFiltradas[0] : null);

  const getStatusBadge = (status: StatusSolicitacao) => {
    switch (status) {
      case 'proposta_disponivel':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Disponível para Análise
          </span>
        );
      case 'aprovada_pelo_cliente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Proposta Aprovada pelo Cliente
          </span>
        );
      case 'em_revisao':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            Em Revisão de Condições
          </span>
        );
      case 'contrato_emitido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Contrato em Emissão
          </span>
        );
      case 'recusada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Proposta Recusada
          </span>
        );
      default:
        return null;
    }
  };

  const handleAprovar = () => {
    if (!propostaAtiva) return;
    responderSolicitacaoCliente(
      propostaAtiva.id,
      'aprovar',
      'Proposta comercial aprovada pela diretoria da empresa. Solicitamos o envio da minuta do contrato.'
    );
    setModalAprovadoSucesso(true);
  };

  const handleEnviarRevisao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propostaAtiva || !mensagemRevisao.trim()) return;
    responderSolicitacaoCliente(propostaAtiva.id, 'revisar', mensagemRevisao.trim());
    setModalRevisaoOpen(false);
    setMensagemRevisao('');
  };

  const handleRecusar = () => {
    if (!propostaAtiva) return;
    const confirmou = window.confirm(
      'Tem certeza que deseja recusar esta proposta comercial? Essa ação notificará o consultor responsável.'
    );
    if (confirmou) {
      responderSolicitacaoCliente(
        propostaAtiva.id,
        'recusar',
        'Cliente optou por não prosseguir com esta proposta no momento.'
      );
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleFalarWhatsapp = () => {
    if (!propostaAtiva) return;
    const cleanPhone = propostaAtiva.vendedor_telefone.replace(/\D/g, '');
    const phone = cleanPhone.length >= 10 ? `55${cleanPhone}` : '';
    const text = encodeURIComponent(
      `Olá ${propostaAtiva.vendedor_nome}! Sou da empresa ${propostaAtiva.razao_social} (CNPJ: ${propostaAtiva.cnpj}).\n` +
      `Estou verificando a Solicitação *${propostaAtiva.id}* (${propostaAtiva.produto_lopes}) no Portal do Cliente e gostaria de tirar uma dúvida.`
    );
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Boas-Vindas Modo Cliente */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold border border-white/20 text-blue-100">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Modo Cliente · Portal de Solicitações e Propostas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Verifique a Solicitação Comercial da sua Empresa
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Consulte propostas oficiais emitidas pela <strong>Lopes Consultoria</strong>, analise valores,
              condições de pagamento e aprove diretamente com o consultor responsável.
            </p>
          </div>

          <button
            onClick={() => setAppMode('vendedor')}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Modo Vendedor</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca de Solicitação / CNPJ */}
      <div className="bg-white border-2 border-blue-200 rounded-3xl p-5 shadow-sm space-y-3">
        <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider">
          Consulte pelo CNPJ da Empresa ou Código da Solicitação:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscaTermo}
              onChange={(e) => setBuscaTermo(e.target.value)}
              placeholder="Digite o CNPJ (ex: 62.000.123/0001-45) ou código (ex: PROP-2026-001)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-blue-200 bg-white text-blue-950 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {buscaTermo && (
              <button
                onClick={() => setBuscaTermo('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Chips de Acesso Rápido para Demonstração */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Exemplos rápidos para teste:</span>
          {solicitacoes.slice(0, 3).map((sol) => (
            <button
              key={sol.id}
              onClick={() => {
                setBuscaTermo(sol.cnpj);
                setSolicitacaoSelecionada(sol);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold transition cursor-pointer"
            >
              {sol.razao_social.split(' ')[0]} ({sol.id})
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal: Lista Lateral e Detalhe da Proposta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Solicitações da Empresa */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
              Solicitações Encontradas ({solicitacoesFiltradas.length})
            </h3>
            <span className="text-[11px] text-slate-500">Selecione para ver</span>
          </div>

          {solicitacoesFiltradas.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Nenhuma solicitação encontrada</h4>
              <p className="text-xs text-slate-500">
                Verifique o CNPJ ou código digitado, ou clique em um dos exemplos rápidos acima.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {solicitacoesFiltradas.map((sol) => {
                const isSelected = propostaAtiva?.id === sol.id;
                return (
                  <button
                    key={sol.id}
                    onClick={() => setSolicitacaoSelecionada(sol)}
                    className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                        {sol.id}
                      </span>
                      {getStatusBadge(sol.status)}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-blue-950 leading-snug line-clamp-1">
                        {sol.produto_lopes}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {sol.razao_social}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        CNPJ: {sol.cnpj}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Valor Ofertado:</span>
                      <strong className="text-emerald-700 font-extrabold text-sm">
                        R$ {sol.valor_proposta.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Detalhe Completo da Solicitação */}
        <div className="lg:col-span-8">
          {propostaAtiva ? (
            <div className="bg-white border-2 border-blue-200 rounded-3xl overflow-hidden shadow-md space-y-6">
              {/* Header da Proposta com Dados Oficiais Lopes */}
              <div className="bg-linear-to-r from-blue-950 to-blue-900 text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-blue-950 px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold">
                      {propostaAtiva.id}
                    </span>
                    <span className="text-xs text-blue-200 font-medium">
                      Emitida em: {new Date(propostaAtiva.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">{propostaAtiva.produto_lopes}</h2>
                  <p className="text-xs text-blue-200">
                    Proposta Comercial Oficial · Lopes Consultoria de Imóveis
                  </p>
                </div>

                <div className="shrink-0">{getStatusBadge(propostaAtiva.status)}</div>
              </div>

              <div className="p-6 space-y-6">
                {/* Dados da Empresa Cliente */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Empresa Consultada (Destinatária)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500">Razão Social:</div>
                      <div className="font-extrabold text-blue-950 text-sm">
                        {propostaAtiva.razao_social}
                      </div>
                      {propostaAtiva.nome_fantasia && (
                        <div className="text-slate-600 text-[11px]">
                          Fantasia: {propostaAtiva.nome_fantasia}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-500">CNPJ:</div>
                      <div className="font-mono font-bold text-blue-950 text-sm">
                        {propostaAtiva.cnpj}
                      </div>
                      {propostaAtiva.cnae_descricao && (
                        <div className="text-slate-600 text-[11px] line-clamp-1">
                          {propostaAtiva.cnae_descricao}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes do Produto & Escopo */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Escopo do Serviço & Especificações
                  </h4>
                  <div className="bg-white border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed space-y-3">
                    <p>{propostaAtiva.descricao_produto}</p>

                    <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200">
                      <div className="font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Garantias e Padrão de Qualidade Lopes:
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-blue-900">
                        <li>• Assessoria jurídica contratual completa inclusa</li>
                        <li>• Vistoria técnica com laudo fotográfico e digital</li>
                        <li>• Suporte comercial dedicado durante toda a vigência</li>
                        <li>• Conformidade regulatória perante os órgãos de São Paulo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bloco Financeiro e Condições */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Valor Total da Proposta
                    </span>
                    <div className="text-xl font-black text-emerald-700 mt-1">
                      R$ {propostaAtiva.valor_proposta.toLocaleString('pt-BR')}
                    </div>
                    <span className="text-[10px] text-emerald-600">Sem taxas ocultas</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      Validade da Proposta
                    </span>
                    <div className="text-lg font-black text-blue-950 mt-1">
                      {propostaAtiva.validade_dias} Dias
                    </div>
                    <span className="text-[10px] text-blue-700">A partir da emissão</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Condições de Pagamento
                    </span>
                    <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                      {propostaAtiva.condicoes_pagamento}
                    </div>
                  </div>
                </div>

                {/* Consultor Lopes Responsável */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                      {propostaAtiva.vendedor_nome.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Consultor Comercial Lopes Designado
                      </span>
                      <h4 className="text-sm font-extrabold text-blue-950">
                        {propostaAtiva.vendedor_nome}
                      </h4>
                      <p className="text-xs text-slate-600">{propostaAtiva.vendedor_cargo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFalarWhatsapp}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar no WhatsApp
                    </button>
                    <button
                      onClick={handleImprimir}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                      title="Imprimir Proposta"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Histórico e Linha do Tempo */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Linha do Tempo e Histórico da Solicitação
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    {propostaAtiva.historico.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-xs">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            h.papel === 'cliente'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {h.papel === 'cliente' ? 'C' : 'L'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-950">{h.autor}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(h.data).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] mt-0.5">{h.mensagem}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AÇÕES DECISÓRIAS DO CLIENTE */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {propostaAtiva.status !== 'recusada' && (
                      <button
                        type="button"
                        onClick={handleRecusar}
                        className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                      >
                        Recusar Proposta
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {propostaAtiva.status !== 'aprovada_pelo_cliente' && (
                      <button
                        type="button"
                        onClick={() => setModalRevisaoOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        Pedir Ajuste / Revisão
                      </button>
                    )}

                    {propostaAtiva.status === 'aprovada_pelo_cliente' ? (
                      <div className="px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-2 border border-emerald-300">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Proposta Aprovada com Sucesso
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAprovar}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar Proposta Comercial
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-blue-950">
                Nenhuma solicitação selecionada
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Consulte pelo CNPJ da sua empresa na barra de busca acima para verificar a proposta comercial.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Solicitação de Revisão / Contraproposta */}
      {modalRevisaoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-blue-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Solicitar Ajuste na Proposta Comercial
            </h3>
            <p className="text-xs text-slate-600">
              Descreva as alterações desejadas (ex: ajuste de carência, prazos, formas de pagamento ou valores)
              para o consultor Lopes avaliar.
            </p>

            <form onSubmit={handleEnviarRevisao} className="space-y-4">
              <textarea
                rows={4}
                required
                value={mensagemRevisao}
                onChange={(e) => setMensagemRevisao(e.target.value)}
                placeholder="Ex: Gostaríamos de solicitar um prazo de carência de 60 dias para reforma do imóvel..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRevisaoOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Solicitação ao Consultor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Parabéns pela Aprovação */}
      {modalAprovadoSucesso && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-emerald-300 w-full max-w-md p-6 text-center shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-blue-950">
              Proposta Aprovada com Sucesso!
            </h3>
            <p className="text-xs text-slate-600">
              Agradecemos a confiança na <strong>Lopes Consultoria</strong>! O consultor comercial{' '}
              <strong>{propostaAtiva?.vendedor_nome}</strong> já foi notificado e dará início à emissão
              da minuta do contrato definitivo.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setModalAprovadoSucesso(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Continuar no Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

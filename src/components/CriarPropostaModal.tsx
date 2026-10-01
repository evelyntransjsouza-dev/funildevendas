import React, { useState } from 'react';
import { CompanyLead, SolicitacaoProposta } from '../types';
import { PRODUTOS_CATALOGO_LOPES, ProdutoCatalogo } from '../data/lopesProdutos';
import { useLeads } from '../context/LeadsContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  FileCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Briefcase,
  DollarSign,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CriarPropostaModalProps {
  lead: CompanyLead;
  isOpen: boolean;
  onClose: () => void;
  onSuccessViewCliente?: (solicitacao: SolicitacaoProposta) => void;
}

export const CriarPropostaModal: React.FC<CriarPropostaModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccessViewCliente,
}) => {
  const { criarSolicitacao, setAppMode, setSolicitacaoSelecionada } = useLeads();
  const { currentUser } = useAuth();

  const [selectedProduto, setSelectedProduto] = useState<ProdutoCatalogo>(PRODUTOS_CATALOGO_LOPES[0]);
  const [valor, setValor] = useState<number>(selectedProduto.valorSugerido);
  const [condicoes, setCondicoes] = useState<string>(selectedProduto.condicoesSugeridas);
  const [descricao, setDescricao] = useState<string>(selectedProduto.descricaoCompleta);
  const [validadeDias, setValidadeDias] = useState<number>(selectedProduto.prazoDiasPadrao);

  const [solicitacaoCriada, setSolicitacaoCriada] = useState<SolicitacaoProposta | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSelectProduto = (prod: ProdutoCatalogo) => {
    setSelectedProduto(prod);
    setValor(prod.valorSugerido);
    setCondicoes(prod.condicoesSugeridas);
    setDescricao(prod.descricaoCompleta);
    setValidadeDias(prod.prazoDiasPadrao);
  };

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    const nova = criarSolicitacao({
      lead_id: lead.id,
      cnpj: lead.cnpj,
      cnpj_raw: lead.cnpj_raw,
      razao_social: lead.razao_social,
      nome_fantasia: lead.nome_fantasia,
      cnae_descricao: lead.cnae_fiscal_descricao,
      produto_lopes: selectedProduto.nome,
      categoria_produto: selectedProduto.categoria,
      descricao_produto: descricao,
      valor_proposta: valor,
      condicoes_pagamento: condicoes,
      validade_dias: validadeDias,
    });
    setSolicitacaoCriada(nova);
  };

  const handleCopyLink = () => {
    if (!solicitacaoCriada) return;
    const msg = `Olá! A proposta comercial da Lopes Consultoria para a empresa ${lead.razao_social} foi gerada com sucesso.\n\nCódigo da Proposta: ${solicitacaoCriada.id}\nCNPJ: ${lead.cnpj}\nProduto: ${solicitacaoCriada.produto_lopes}\nValor: R$ ${solicitacaoCriada.valor_proposta.toLocaleString('pt-BR')}\n\nAcesse o Portal do Cliente Lopes para verificar a solicitação e aprovar.`;
    navigator.clipboard.writeText(msg);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAbrirWhatsapp = () => {
    if (!solicitacaoCriada) return;
    const cleanPhone = lead.telefone ? lead.telefone.replace(/\D/g, '') : '';
    const phone = cleanPhone.length >= 10 ? `55${cleanPhone}` : '';
    const msg = encodeURIComponent(
      `Olá ${lead.contato_nome || 'Diretor(a)'}! Sou ${currentUser?.name || 'Consultor Lopes'}, da Lopes Consultoria de Imóveis.\n\n` +
      `Geramos a proposta comercial oficial para a ${lead.razao_social} referente a:\n` +
      `📌 *${solicitacaoCriada.produto_lopes}*\n` +
      `💰 *Valor Estimado:* R$ ${solicitacaoCriada.valor_proposta.toLocaleString('pt-BR')}\n` +
      `🔑 *Código da Solicitação:* ${solicitacaoCriada.id}\n\n` +
      `Você pode verificar e aprovar a solicitação diretamente em nosso Portal do Cliente consultando pelo seu CNPJ (${lead.cnpj}).`
    );

    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`
      : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleIrParaModoCliente = () => {
    if (!solicitacaoCriada) return;
    setSolicitacaoSelecionada(solicitacaoCriada);
    setAppMode('cliente');
    onClose();
    if (onSuccessViewCliente) {
      onSuccessViewCliente(solicitacaoCriada);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-blue-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Topo do Modal */}
        <div className="bg-white border-b border-blue-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Modo Vendedor · Inteligência Comercial Lopes
              </span>
              <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
                Criar Solicitação & Vender Produto Lopes
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Card Resumo do CNPJ / Cliente */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Empresa Destinatária (Cliente)
              </span>
              <h3 className="text-base font-extrabold text-blue-950">{lead.razao_social}</h3>
              <p className="text-xs text-blue-900 font-medium">
                CNPJ: <strong>{lead.cnpj}</strong> · {lead.endereco.bairro}, {lead.endereco.municipio} - SP
              </p>
              {lead.contato_nome && (
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Contato Decisor (QSA): <strong>{lead.contato_nome}</strong> ({lead.contato_cargo || 'Sócio'})
                </p>
              )}
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-blue-200 text-right shrink-0">
              <div className="text-[10px] text-blue-700 font-bold uppercase">Compatibilidade Lopes</div>
              <div className="text-base font-extrabold text-blue-950">
                {lead.compatibilidade_lopes_pct || 85}%
              </div>
            </div>
          </div>

          {!solicitacaoCriada ? (
            <form onSubmit={handleCriar} className="space-y-6">
              {/* Seleção do Produto Lopes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-blue-950">
                  1. Selecione o Produto / Serviço Lopes para Vender:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRODUTOS_CATALOGO_LOPES.map((prod) => {
                    const isSelected = selectedProduto.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduto(prod)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {prod.categoria.replace('_', ' ')}
                            </span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                          </div>
                          <h4 className="text-xs font-bold text-blue-950 leading-snug">{prod.nome}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{prod.descricaoCurta}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Valor sugerido:</span>
                          <span className="font-extrabold text-blue-900">
                            R$ {prod.valorSugerido.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Benefícios inclusos */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Diferenciais e Benefícios Inclusos na Proposta Oficial Lopes:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                  {selectedProduto.beneficios.map((b, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Valores e Condições */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Valor da Proposta Comercial (R$)
                  </label>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    min={100}
                    step={500}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-blue-950 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Valor sugerido: R$ {selectedProduto.valorSugerido.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Validade da Proposta (Dias)
                  </label>
                  <input
                    type="number"
                    value={validadeDias}
                    onChange={(e) => setValidadeDias(Number(e.target.value))}
                    min={5}
                    max={365}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-blue-950 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Tempo para o cliente analisar e aprovar no portal
                  </span>
                </div>
              </div>

              {/* Descrição e Condições */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    Condições Comerciais e Forma de Pagamento:
                  </label>
                  <input
                    type="text"
                    value={condicoes}
                    onChange={(e) => setCondicoes(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Ex: 50% na entrada + 50% na assinatura do contrato definitivo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    Escopo Detalhado da Proposta para o Cliente:
                  </label>
                  <textarea
                    rows={3}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                    placeholder="Descreva os detalhes da operação imobiliária ou de facilities..."
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  Emitir Solicitação & Disponibilizar para o Cliente
                </button>
              </div>
            </form>
          ) : (
            /* Tela de Confirmação de Emissão com Link e WhatsApp */
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                  Solicitação Emitida com Sucesso
                </span>
                <h3 className="text-xl font-extrabold text-blue-950 mt-2">
                  Proposta {solicitacaoCriada.id}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  A solicitação foi registrada no sistema. O cliente já pode consultar e verificar a proposta
                  no <strong>Modo Cliente</strong> informando o CNPJ <strong>{lead.cnpj}</strong>.
                </p>
              </div>

              {/* Card com Detalhes da Proposta */}
              <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-left max-w-lg mx-auto space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Produto Lopes:</span>
                  <strong className="text-blue-950">{solicitacaoCriada.produto_lopes}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Valor da Proposta:</span>
                  <strong className="text-emerald-700 text-sm">
                    R$ {solicitacaoCriada.valor_proposta.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Validade:</span>
                  <span className="text-slate-700 font-semibold">{solicitacaoCriada.validade_dias} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultor Responsável:</span>
                  <span className="text-blue-900 font-bold">{solicitacaoCriada.vendedor_nome}</span>
                </div>
              </div>

              {/* Ações Rápidas de Compartilhamento */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAbrirWhatsapp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Notificação no WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-blue-950 border border-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                  {copiedLink ? 'Dados Copiados!' : 'Copiar Resumo da Proposta'}
                </button>

                <button
                  type="button"
                  onClick={handleIrParaModoCliente}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <span>Verificar no Modo Cliente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

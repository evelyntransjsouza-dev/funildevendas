import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import { useAuth } from '../context/AuthContext';
import { CNPJS_EXEMPLO_TESTE } from '../data/seedLeads';
import { CompanyLead } from '../types';
import { cleanCnpj, formatCnpj, getCleanPhoneForWhatsApp } from '../services/brasilApi';
import { EditLeadModal } from './EditLeadModal';
import { CriarPropostaModal } from './CriarPropostaModal';
import {
  Search,
  Phone,
  Mail,
  User,
  MapPin,
  ExternalLink,
  Edit3,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CnpjSearchSection: React.FC = () => {
  const { searchCnpj, loadingSearch, searchError, addToCarteira } = useLeads();
  const { currentUser } = useAuth();

  const [inputVal, setInputVal] = useState('');
  const [currentResult, setCurrentResult] = useState<CompanyLead | null>(null);
  const [editingLead, setEditingLead] = useState<CompanyLead | null>(null);
  const [criarPropostaLead, setCriarPropostaLead] = useState<CompanyLead | null>(null);
  const [addedToast, setAddedToast] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = cleanCnpj(e.target.value).slice(0, 14);
    setInputVal(formatCnpj(raw));
  };

  const handleSearch = async (cnpjToSearch?: string) => {
    const target = cnpjToSearch || inputVal;
    if (!target) return;
    try {
      const result = await searchCnpj(target);
      setCurrentResult(result);
    } catch {
      // erro tratado no context
    }
  };

  const handleAddCurrentToCarteira = () => {
    if (!currentResult) return;
    addToCarteira(currentResult, currentUser?.id, currentUser?.name);
    setCurrentResult({
      ...currentResult,
      in_carteira: true,
      assigned_to_user_id: currentUser?.id || '',
      assigned_to_user_name: currentUser?.name || '',
    });
    setAddedToast(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
    setTimeout(() => setAddedToast(false), 3000);
  };

  const getGmailComposeUrl = (email: string, empresa: string) => {
    const subject = encodeURIComponent(`Proposta Comercial Lopes para ${empresa}`);
    const body = encodeURIComponent(
      `Olá ${currentResult?.contato_nome || 'Diretoria'},\n\nSou ${currentUser?.name}, da Lopes Prestação de Serviços & Imóveis em São Paulo.\n\nGostaria de apresentar nossas soluções corporativas para ${empresa}.\n\nAtenciosamente,\n${currentUser?.name}\nLopes São Paulo`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
  };

  const getWhatsAppUrl = (phone: string, contato: string, empresa: string) => {
    const num = getCleanPhoneForWhatsApp(phone);
    const msg = encodeURIComponent(
      `Olá ${contato || 'tudo bem'}! Sou ${currentUser?.name} da Lopes São Paulo. Gostaria de conversar com você sobre soluções imobiliárias e serviços para a ${empresa}.`
    );
    return `https://wa.me/${num}?text=${msg}`;
  };

  const getGoogleMapsDirectionsUrl = (lead: CompanyLead) => {
    const query = encodeURIComponent(
      `${lead.razao_social}, ${lead.endereco.logradouro}, ${lead.endereco.numero}, São Paulo - SP`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="space-y-6">
      {/* Busca Principal de CNPJ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-950 tracking-tight">
            Consulta Oficial de CNPJ via BrasilAPI
          </h2>
          <p className="text-xs text-blue-900/70 mt-1">
            Capture em tempo real a Razão Social, CNAE, endereço em São Paulo, telefone, email e o contato do sócio-administrador (QSA).
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="Digite o CNPJ (ex: 62.000.123/0001-45)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm text-blue-950 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loadingSearch || !inputVal}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            {loadingSearch ? 'Consultando na Receita...' : 'Buscar CNPJ'}
          </button>
        </form>

        {/* Sugestões de teste */}
        <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-blue-950">Exemplos para teste:</span>
          {CNPJS_EXEMPLO_TESTE.map((item) => (
            <button
              key={item.cnpj}
              onClick={() => {
                setInputVal(item.cnpj);
                handleSearch(item.cnpj);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-blue-900 text-xs transition cursor-pointer font-mono font-medium"
            >
              {item.cnpj} ({item.nome.split('(')[0].trim()})
            </button>
          ))}
        </div>
      </div>

      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{searchError}</span>
        </div>
      )}

      {addedToast && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Empresa inserida com sucesso na carteira de {currentUser?.name}.</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono font-bold">Status: Contato Iniciado</span>
        </div>
      )}

      {currentResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header da Empresa */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-mono text-blue-700 font-bold">{currentResult.cnpj}</span>
                <span>·</span>
                <span className="text-emerald-700 font-bold">{currentResult.situacao_cadastral}</span>
                <span>·</span>
                <span className="text-blue-900">CNAE {currentResult.cnae_fiscal}</span>
              </div>
              <h3 className="text-xl font-bold text-blue-950">
                {currentResult.nome_fantasia || currentResult.razao_social}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentResult.cnae_fiscal_descricao}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setCriarPropostaLead(currentResult)}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Vender Produto Lopes
              </button>

              <button
                onClick={() => setEditingLead(currentResult)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-blue-950 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                Editar Contato
              </button>

              <button
                onClick={handleAddCurrentToCarteira}
                disabled={currentResult.in_carteira}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentResult.in_carteira
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentResult.in_carteira ? 'Já está na Carteira' : 'Inserir na Carteira'}
              </button>
            </div>
          </div>

          {/* Dados de Contato Direto & QSA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Contato Principal (Auto QSA) */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-1">
              <div className="text-blue-800 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Contato Principal (QSA)
              </div>
              <div className="text-sm font-bold text-blue-950">{currentResult.contato_nome}</div>
              <div className="text-slate-600">{currentResult.contato_cargo}</div>
            </div>

            {/* Telefone e WhatsApp */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-600 font-bold">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Telefone
                </span>
                <button
                  onClick={() => setEditingLead(currentResult)}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  Editar
                </button>
              </div>
              <div className="text-sm font-bold text-blue-950">{currentResult.telefone || 'Não informado'}</div>
              {currentResult.telefone && (
                <a
                  href={getWhatsAppUrl(
                    currentResult.telefone,
                    currentResult.contato_nome,
                    currentResult.nome_fantasia || currentResult.razao_social
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline pt-1"
                >
                  Chamar no WhatsApp <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Gmail */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-600 font-bold">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Gmail / Email
                </span>
                <button
                  onClick={() => setEditingLead(currentResult)}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  Editar
                </button>
              </div>
              <div className="text-sm font-bold text-blue-950 truncate">
                {currentResult.email || 'Não informado'}
              </div>
              {currentResult.email && (
                <a
                  href={getGmailComposeUrl(
                    currentResult.email,
                    currentResult.nome_fantasia || currentResult.razao_social
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline pt-1"
                >
                  Abrir no Gmail <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Endereço e Compatibilidade Lopes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-blue-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Endereço em São Paulo:
              </div>
              <p className="text-slate-800 font-medium">
                {currentResult.endereco.logradouro}, {currentResult.endereco.numero} - {currentResult.endereco.bairro}
              </p>
              <div className="text-slate-500">
                CEP {currentResult.endereco.cep} · {currentResult.endereco.municipio}/{currentResult.endereco.uf}
              </div>
              <a
                href={getGoogleMapsDirectionsUrl(currentResult)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline pt-1"
              >
                Localizar no Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span>Compatibilidade Lopes: {currentResult.compatibilidade_lopes_pct}%</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {currentResult.motivo_oportunidade}
              </p>
            </div>
          </div>
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

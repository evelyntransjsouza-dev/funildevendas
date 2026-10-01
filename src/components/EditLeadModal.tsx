import React from 'react';
import { CompanyLead, PipelineStatus } from '../types';
import { useLeads } from '../context/LeadsContext';
import { X, Save, Phone, Mail, User, Building2, DollarSign, Tag, CheckCircle } from 'lucide-react';

interface EditLeadModalProps {
  lead: CompanyLead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, isOpen, onClose }) => {
  const { updateLeadContactInfo } = useLeads();

  const [telefone, setTelefone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [contatoNome, setContatoNome] = React.useState('');
  const [contatoCargo, setContatoCargo] = React.useState('');
  const [status, setStatus] = React.useState<PipelineStatus>('prospectado');
  const [valorEstimado, setValorEstimado] = React.useState<number>(15000);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    if (lead) {
      setTelefone(lead.telefone || '');
      setEmail(lead.email || '');
      setContatoNome(lead.contato_nome || '');
      setContatoCargo(lead.contato_cargo || '');
      setStatus(lead.pipeline_status || 'prospectado');
      setValorEstimado(lead.valor_estimado || 15000);
      setSavedSuccess(false);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLeadContactInfo(lead.id, {
      telefone,
      email,
      contato_nome: contatoNome,
      contato_cargo: contatoCargo,
      pipeline_status: status,
      valor_estimado: Number(valorEstimado),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border-2 border-blue-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-blue-950 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-blue-950">Editar Dados de Contato do CNPJ</h3>
              <p className="text-xs text-blue-700 font-semibold font-mono">
                {lead.nome_fantasia || lead.razao_social} · {lead.cnpj}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 bg-white">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 font-medium leading-relaxed">
            Se o telefone ou o email estiverem incorretos ou precisarem de correção, altere os campos abaixo. As alterações serão salvas imediatamente na sua carteira e sincronizadas no Supabase.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
              <span className="text-[11px] text-blue-700/80 font-medium">Insira com DDD para envio de WhatsApp</span>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Gmail / Email Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com.br"
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
              <span className="text-[11px] text-blue-700/80 font-medium">Usado para abertura direta no Gmail</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Pessoa de Contato */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Nome da Pessoa de Contato
              </label>
              <input
                type="text"
                value={contatoNome}
                onChange={(e) => setContatoNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Lopes"
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
              <span className="text-[11px] text-blue-700/80 font-medium">Extraído automaticamente do QSA</span>
            </div>

            {/* Cargo / Qualificação */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Cargo / Responsabilidade
              </label>
              <input
                type="text"
                value={contatoCargo}
                onChange={(e) => setContatoCargo(e.target.value)}
                placeholder="Ex: Sócio-Administrador"
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status do Pipeline */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1">
                Fase da Prospecção / Carteira
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PipelineStatus)}
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="prospectado">Novo Prospect</option>
                <option value="contato_iniciado">Contato Iniciado</option>
                <option value="proposta_enviada">Proposta Comercial Enviada</option>
                <option value="negociacao">Em Negociação</option>
                <option value="fechado">Contrato Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>

            {/* Valor Estimado da Proposta */}
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor da Proposta Estimada (R$)
              </label>
              <input
                type="number"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(Number(e.target.value))}
                step={1000}
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex items-center justify-between border-t border-blue-100">
            <span className="text-xs text-blue-900 font-bold flex items-center gap-1">
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Salvo com sucesso no sistema e Supabase!
                </>
              ) : (
                'Atualiza imediatamente no sistema.'
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-950 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

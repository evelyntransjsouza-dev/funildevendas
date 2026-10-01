import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle,
  LogIn,
} from 'lucide-react';

export const TeamManagementSection: React.FC = () => {
  const { users, currentUser, addNewSeller, switchUser } = useAuth();
  const { leads } = useLeads();

  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoCargo, setNovoCargo] = useState('Consultor Comercial SP');
  const [sucessoMsg, setSucessoMsg] = useState(false);

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoEmail) return;
    addNewSeller(novoNome, novoEmail, novoTelefone, novoCargo);
    setNovoNome('');
    setNovoEmail('');
    setNovoTelefone('');
    setSucessoMsg(true);
    setTimeout(() => setSucessoMsg(false), 3000);
  };

  const teamMetrics = users.map((user) => {
    const userLeads = leads.filter((l) => l.in_carteira && l.assigned_to_user_id === user.id);
    const fechados = userLeads.filter((l) => l.pipeline_status === 'fechado');
    const emNegociacao = userLeads.filter((l) => l.pipeline_status === 'negociacao' || l.pipeline_status === 'proposta_enviada');
    const valorTotalFechado = fechados.reduce((acc, curr) => acc + (curr.valor_estimado || 0), 0);
    const valorPipeline = userLeads.reduce((acc, curr) => acc + (curr.valor_estimado || 0), 0);

    return {
      user,
      totalLeads: userLeads.length,
      fechadosCount: fechados.length,
      emNegociacaoCount: emNegociacao.length,
      valorTotalFechado,
      valorPipeline,
      metaPct: Math.min(Math.round((valorPipeline / (user.meta_mensal || 100000)) * 100), 100),
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner de Gestão de Equipe em Fundo Branco */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Painel do Gestor Comercial Lopes</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-950">
          Gestão de Consultores, Metas e Distribuição de Carteira
        </h2>
        <p className="text-xs text-blue-900/70">
          Supervisione a performance da equipe de prospecção, redistribua CNPJs e cadastre novos consultores.
        </p>
      </div>

      {/* Cards de Métricas da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teamMetrics.map((item) => (
          <div
            key={item.user.id}
            className={`bg-white border rounded-2xl p-5 shadow-xs transition space-y-4 ${
              currentUser?.id === item.user.id
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                    {item.user.name}
                    {item.user.role === 'gestor' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        GESTOR
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{item.user.cargo}</div>
                </div>
              </div>

              {currentUser?.id !== item.user.id && (
                <button
                  onClick={() => switchUser(item.user.id)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Acessar como este usuário"
                >
                  <LogIn className="w-3.5 h-3.5" /> Assumir
                </button>
              )}
            </div>

            {/* Indicadores de Vendas */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-600 text-[11px] block font-semibold">Leads na Carteira:</span>
                <span className="text-base font-bold text-blue-950">{item.totalLeads}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-600 text-[11px] block font-semibold">Contratos Fechados:</span>
                <span className="text-base font-bold text-emerald-700">
                  {item.fechadosCount}
                </span>
              </div>
            </div>

            {/* Barra de Progresso da Meta */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-semibold">Pipeline Total:</span>
                <span className="font-mono text-blue-700 font-bold">
                  R$ {item.valorPipeline.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${item.metaPct}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                Meta Mensal: R$ {(item.user.meta_mensal || 100000).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário de Cadastro de Novo Vendedor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>Cadastrar Novo Vendedor na Equipe Lopes</span>
        </div>

        {sucessoMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Novo consultor cadastrado com sucesso! Já pode receber atribuição de CNPJs.
          </div>
        )}

        <form onSubmit={handleAddSeller} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome Completo do Vendedor"
            required
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-blue-950 focus:outline-none focus:border-blue-600"
          />
          <input
            type="email"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            placeholder="email.vendedor@lopes.com.br"
            required
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-blue-950 focus:outline-none focus:border-blue-600"
          />
          <input
            type="text"
            value={novoTelefone}
            onChange={(e) => setNovoTelefone(e.target.value)}
            placeholder="WhatsApp / Telefone (11)"
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-blue-950 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Vendedor
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadsContext';
import {
  Compass,
  Search,
  Briefcase,
  Users,
  Database,
  ChevronDown,
  LogOut,
  Building,
  Building2,
  Key,
  CheckCircle,
  AlertCircle,
  Server,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: 'radar' | 'busca' | 'carteira' | 'gestao' | 'armazenamento';
  setActiveTab: (tab: 'radar' | 'busca' | 'carteira' | 'gestao' | 'armazenamento') => void;
  onOpenSqlModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSqlModal,
  onOpenSupabaseModal,
}) => {
  const { currentUser, users, switchUser, logout, isGestor } = useAuth();
  const { stats, supabaseInfo, appMode, setAppMode } = useLeads();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-200 text-blue-950 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Marca Lopes em Azul e Fundo Branco */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-blue-950 text-base flex items-center gap-1.5">
                Lopes Corporate
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                  {appMode === 'vendedor' ? 'VENDEDOR' : 'CLIENTE'}
                </span>
              </span>
              <span className="text-blue-700 font-semibold text-xs hidden sm:block">
                {appMode === 'vendedor'
                  ? 'São Paulo · Prospecção CNPJ & Venda de Produtos Lopes'
                  : 'Portal do Cliente · Verificar Solicitação'}
              </span>
            </div>

            {/* Alternador de Modo: Vendedor vs Cliente */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 ml-2">
              <button
                type="button"
                onClick={() => setAppMode('vendedor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appMode === 'vendedor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-950'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Modo Vendedor</span>
              </button>

              <button
                type="button"
                onClick={() => setAppMode('cliente')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appMode === 'cliente'
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-950'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Modo Cliente</span>
                {stats.solicitacoesAtivasCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {stats.solicitacoesAtivasCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Zone 2: Links em Azul Escuro e Letras Azul */}
          {appMode === 'vendedor' ? (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-blue-900/80">
              <button
                onClick={() => setActiveTab('radar')}
                className={`transition-colors cursor-pointer py-1 border-b-2 ${
                  activeTab === 'radar'
                    ? 'text-blue-700 border-blue-600 font-bold'
                    : 'border-transparent hover:text-blue-950 hover:border-blue-300'
                }`}
              >
                Radar Google Maps SP
              </button>

              <button
                onClick={() => setActiveTab('busca')}
                className={`transition-colors cursor-pointer py-1 border-b-2 ${
                  activeTab === 'busca'
                    ? 'text-blue-700 border-blue-600 font-bold'
                    : 'border-transparent hover:text-blue-950 hover:border-blue-300'
                }`}
              >
                Buscar CNPJ
              </button>

              <button
                onClick={() => setActiveTab('carteira')}
                className={`transition-colors cursor-pointer py-1 border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'carteira'
                    ? 'text-blue-700 border-blue-600 font-bold'
                    : 'border-transparent hover:text-blue-950 hover:border-blue-300'
                }`}
              >
                <span>{isGestor ? 'Carteira Geral' : 'Minha Carteira'}</span>
                {stats.carteiraCount > 0 && (
                  <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">
                    {stats.carteiraCount}
                  </span>
                )}
              </button>

              {isGestor && (
                <button
                  onClick={() => setActiveTab('gestao')}
                  className={`transition-colors cursor-pointer py-1 border-b-2 ${
                    activeTab === 'gestao'
                      ? 'text-blue-700 border-blue-600 font-bold'
                      : 'border-transparent hover:text-blue-950 hover:border-blue-300'
                  }`}
                >
                  Gestão da Equipe
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('armazenamento');
                  onOpenSqlModal();
                }}
                className="text-blue-700 hover:text-blue-950 font-bold transition-colors cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200"
              >
                Políticas & Dados
              </button>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Área do Cliente · Consulta & Aprovação de Solicitação
              </span>
            </div>
          )}

          {/* Zone 3: Perfil do Usuário */}
          <div className="flex items-center gap-2.5">
            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-xs text-blue-950 transition cursor-pointer shadow-2xs"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500"
                />
                <span className="font-bold text-blue-950 hidden sm:inline">{currentUser?.name}</span>
                <span className="text-[11px] text-blue-600 font-bold uppercase">({currentUser?.role})</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-blue-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-blue-100">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      Alternar Perfil
                    </span>
                    <span className="text-xs text-blue-950 font-medium">
                      Teste como Gestor ou Vendedor:
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          currentUser?.id === u.id
                            ? 'bg-blue-100 text-blue-950 font-extrabold border border-blue-300'
                            : 'hover:bg-blue-50 text-blue-900'
                        }`}
                      >
                        <div>
                          <div className="text-blue-950 font-bold">{u.name}</div>
                          <div className="text-[10px] text-blue-700">{u.cargo}</div>
                        </div>
                        <span className="text-[10px] uppercase font-mono text-blue-700 font-bold">
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-blue-100 px-2 flex justify-between items-center">
                    <button
                      onClick={onOpenSupabaseModal}
                      className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 p-1 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" /> Conexão do Servidor
                    </button>
                    <button
                      onClick={() => logout()}
                      className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 p-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-blue-200 bg-white px-2 py-2 text-xs font-bold text-blue-900">
        <button
          onClick={() => setActiveTab('radar')}
          className={`p-1.5 cursor-pointer ${activeTab === 'radar' ? 'text-blue-700 font-extrabold underline' : 'text-blue-900'}`}
        >
          Radar SP
        </button>
        <button
          onClick={() => setActiveTab('busca')}
          className={`p-1.5 cursor-pointer ${activeTab === 'busca' ? 'text-blue-700 font-extrabold underline' : 'text-blue-900'}`}
        >
          Buscar CNPJ
        </button>
        <button
          onClick={() => setActiveTab('carteira')}
          className={`p-1.5 cursor-pointer ${activeTab === 'carteira' ? 'text-blue-700 font-extrabold underline' : 'text-blue-900'}`}
        >
          Carteira ({stats.carteiraCount})
        </button>
        {isGestor && (
          <button
            onClick={() => setActiveTab('gestao')}
            className={`p-1.5 cursor-pointer ${activeTab === 'gestao' ? 'text-blue-700 font-extrabold underline' : 'text-blue-900'}`}
          >
            Equipe
          </button>
        )}
      </div>
    </header>
  );
};

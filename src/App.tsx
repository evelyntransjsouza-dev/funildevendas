import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadsProvider, useLeads } from './context/LeadsContext';
import { HeaderNavbar } from './components/HeaderNavbar';
import { RadarMapSection } from './components/RadarMapSection';
import { CnpjSearchSection } from './components/CnpjSearchSection';
import { CarteiraView } from './components/CarteiraView';
import { TeamManagementSection } from './components/TeamManagementSection';
import { ClientePortalView } from './components/ClientePortalView';
import { SqlViewerModal } from './components/SqlViewerModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { SupabaseStatusCard } from './components/SupabaseStatusCard';
import {
  Lock,
  Mail,
  Database,
  Building,
  CheckCircle,
  Key,
  Server,
  Sparkles,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      setError('Credenciais inválidas. Use os acessos de demonstração abaixo.');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    await login(userEmail, '123456');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 sm:px-6 py-12 text-blue-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-md font-bold">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">
            Lopes Corporate · CRM
          </h1>
          <p className="text-xs text-blue-700 font-semibold">
            Sistema Funcional de Prospecção CNPJ · Google Maps SP · Gestão de Carteira
          </p>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-3xl p-7 shadow-lg space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> E-mail de Acesso
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@lopes.com.br"
                required
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              {loading ? 'Acessando Sistema...' : 'Entrar no Sistema Funcional'}
            </button>
          </form>

          <div className="pt-3 border-t border-blue-100 space-y-2">
            <span className="text-[11px] text-blue-700 block text-center font-bold">
              Acesso Rápido para Avaliação:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('maylla.lopes@lopes.com.br')}
                className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-blue-950">Maylla Lopes</div>
                <div className="text-[11px] text-blue-700 font-bold">Gestora Geral</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.silva@lopes.com.br')}
                className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-left transition cursor-pointer"
              >
                <div className="text-xs font-extrabold text-blue-950">Carlos Silva</div>
                <div className="text-[11px] text-blue-700 font-bold">Vendedor / Corretor</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-blue-600 font-medium">
          Sistema com persistência de dados e radar Google Maps
        </div>
      </div>
    </div>
  );
};

const MainDashboard: React.FC = () => {
  const { currentUser, isGestor } = useAuth();
  const { supabaseInfo, appMode } = useLeads();
  const [activeTab, setActiveTab] = useState<'radar' | 'busca' | 'carteira' | 'gestao' | 'armazenamento'>('radar');
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  return (
    <div className="min-h-screen bg-white text-blue-950 flex flex-col">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm font-semibold">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Navbar Superior em Fundo Branco e Letras Azul */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSqlModal={() => setSqlModalOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Sub-bar de contextualização e status do Servidor */}
      <div className="bg-blue-50/80 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-950 font-medium">
        {appMode === 'cliente' ? (
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950">Portal do Cliente Lopes:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">
                Consulta Oficial de Solicitações & Propostas Comerciais
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-800">
              <span>Consulte pelo CNPJ da sua empresa para verificar a proposta</span>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950">CNAE Lopes:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">
                68.21-8-01 (Imóveis)
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-bold hidden sm:inline">
                78.10-8 / 81.11-7 (Serviços e Facilities)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline">
                Logado: <strong className="text-blue-900">{currentUser?.name}</strong> ({currentUser?.role})
              </span>

              <span className="text-blue-300 hidden md:inline">|</span>

              <button
                onClick={() => setSqlModalOpen(true)}
                className="text-blue-700 hover:text-blue-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Políticas & Armazenamento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo Principal com Fundo Branco */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-white">
        {appMode === 'cliente' ? (
          <ClientePortalView />
        ) : (
          <>
            {activeTab === 'radar' && <RadarMapSection />}
            {activeTab === 'busca' && <CnpjSearchSection />}
            {activeTab === 'carteira' && <CarteiraView />}
            {activeTab === 'gestao' && isGestor && <TeamManagementSection />}
            {activeTab === 'armazenamento' && (
              <div className="space-y-6">
                <SupabaseStatusCard onConfigureSupabase={() => setSupabaseModalOpen(true)} />
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                  <Database className="w-12 h-12 text-blue-600 mx-auto" />
                  <h2 className="text-xl font-extrabold text-blue-950">
                    Políticas de Armazenamento e Segurança Ativadas
                  </h2>
                  <p className="text-xs text-blue-900/80 max-w-xl mx-auto font-medium">
                    Estrutura de dados com regras de acesso por perfil (Gestor e Vendedor), isolamento de carteiras
                    e pastas de armazenamento protegidas para propostas e contratos.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setSqlModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" /> Visualizar Políticas e Estrutura de Dados
                    </button>
                    <button
                      onClick={() => setSupabaseModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs inline-flex items-center gap-2 cursor-pointer border border-blue-200"
                    >
                      <Key className="w-4 h-4" /> Configurar Chaves do Servidor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modais do Sistema */}
      <SqlViewerModal isOpen={sqlModalOpen} onClose={() => setSqlModalOpen(false)} />
      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onOpenSqlModal={() => setSqlModalOpen(true)}
      />

      <footer className="border-t border-blue-100 bg-white py-4 text-center text-xs text-blue-800 font-semibold">
        Lopes Corporate · Sistema Funcional B2B de CNPJs em São Paulo · Google Maps
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LeadsProvider>
        <AppContent />
      </LeadsProvider>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <LoginScreen />;
  }
  return <MainDashboard />;
};

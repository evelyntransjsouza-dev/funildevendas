import React, { useState, useEffect } from 'react';
import { useLeads } from '../context/LeadsContext';
import { getStoredSupabaseCredentials } from '../services/supabaseClient';
import {
  Database,
  Key,
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  X,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSqlModal: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onOpenSqlModal,
}) => {
  const {
    supabaseInfo,
    checkConnection,
    updateSupabaseCredentials,
    disconnectSupabase,
    syncAllToSupabase,
    loadLeadsFromSupabase,
  } = useLeads();

  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const creds = getStoredSupabaseCredentials();
      setUrlInput(creds.url);
      setKeyInput(creds.anonKey);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setFeedback(null);

    const res = await updateSupabaseCredentials(urlInput, keyInput);
    setTesting(false);

    if (res.connected) {
      setFeedback({
        type: 'success',
        text: `Conectado com sucesso ao servidor! Latência: ${res.latencyMs || 0}ms. Sistema pronto para sincronizar em nuvem.`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.message || 'Falha ao conectar. Verifique se a URL e a Chave de Acesso estão corretas.',
      });
    }
  };

  const handleTestOnly = async () => {
    setTesting(true);
    const res = await checkConnection();
    setTesting(false);
    if (res.connected) {
      setFeedback({
        type: 'success',
        text: `Conexão ativa! Latência: ${res.latencyMs || 0}ms.`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.message,
      });
    }
  };

  const handleDisconnect = () => {
    disconnectSupabase();
    setUrlInput('');
    setKeyInput('');
    setFeedback({
      type: 'info',
      text: 'Chaves removidas. O sistema continuará operando com armazenamento local.',
    });
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setFeedback(null);
    const res = await syncAllToSupabase();
    setSyncing(false);
    setFeedback({
      type: 'success',
      text: `Sincronização concluída! ${res.success} empresas enviadas para o servidor (${res.failed} falhas).`,
    });
  };

  const handlePullLeads = async () => {
    setPulling(true);
    setFeedback(null);
    const res = await loadLeadsFromSupabase();
    setPulling(false);
    if (res.error) {
      setFeedback({ type: 'error', text: res.error });
    } else {
      setFeedback({
        type: 'success',
        text: `${res.loaded} empresas carregadas com sucesso do servidor para o sistema!`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-blue-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topo do Modal com Letras Azul e Fundo Branco */}
        <div className="bg-white border-b border-blue-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                Configuração do Servidor
                {supabaseInfo.connected ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Aguardando Conexão
                  </span>
                )}
              </h2>
              <p className="text-xs text-blue-900/70">
                Insira a URL do servidor e a chave de acesso para persistência e sincronização de dados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Alerta de Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : feedback.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {feedback.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
              {feedback.type === 'info' && <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
              <div className="flex-1">{feedback.text}</div>
            </div>
          )}

          {/* Formulário de Configuração */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  URL do Servidor
                </span>
                <span className="text-[11px] text-blue-700 font-normal">Ex: https://xxxxxx.co</span>
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://seu-servidor-projeto.co"
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  Chave de Acesso da API (Token / Key)
                </span>
                <span className="text-[11px] text-blue-700 font-normal">Chave de autenticação</span>
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={testing}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Testando Conexão...' : 'Salvar & Conectar Servidor'}
                </button>

                <button
                  type="button"
                  onClick={handleTestOnly}
                  disabled={testing}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  Testar Ping
                </button>
              </div>

              {urlInput && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Desconectar
                </button>
              )}
            </div>
          </form>

          {/* Painel Operacional de Sincronização */}
          <div className="bg-slate-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              Ações de Sincronização
            </h4>
            <p className="text-[11px] text-blue-900/70">
              Sincronize a carteira de clientes e CNPJs diretamente com o seu servidor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncing || !supabaseInfo.connected}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  supabaseInfo.connected
                    ? 'bg-white hover:bg-blue-50 border-blue-200 cursor-pointer shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Upload className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-950">Enviar Carteira para o Servidor</div>
                  <div className="text-[10px] text-blue-900/70">Gravação de todas as empresas e contatos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handlePullLeads}
                disabled={pulling || !supabaseInfo.connected}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  supabaseInfo.connected
                    ? 'bg-white hover:bg-blue-50 border-blue-200 cursor-pointer shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-950">Puxar Leads do Servidor</div>
                  <div className="text-[10px] text-blue-900/70">Carrega dados salvos para o CRM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Onde encontrar as chaves */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700">
            <div className="font-bold text-blue-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Como obter as chaves no painel do servidor:
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSqlModal();
                }}
                className="text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
              >
                Ver Políticas & Estrutura
              </button>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Acesse as configurações do seu projeto.</li>
              <li>Navegue até a seção de <strong>API</strong> nas configurações do projeto.</li>
              <li>Copie a <strong>URL do Projeto</strong> e cole no campo acima.</li>
              <li>Copie a <strong>Chave de Acesso Pública / Token</strong> e cole no campo acima.</li>
              <li>Clique em <strong>Salvar & Conectar Servidor</strong> para ativar a sincronização.</li>
            </ol>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Status: {supabaseInfo.connected ? '🟢 Operacional' : '🟡 Local'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-blue-950 text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

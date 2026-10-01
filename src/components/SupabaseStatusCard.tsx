import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import {
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  Settings,
  Server,
  Upload,
  Download,
} from 'lucide-react';

interface SupabaseStatusCardProps {
  onConfigureSupabase?: () => void;
}

export const SupabaseStatusCard: React.FC<SupabaseStatusCardProps> = ({ onConfigureSupabase }) => {
  const { supabaseInfo, checkConnection, syncAllToSupabase } = useLeads();
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await checkConnection();
    setTimeout(() => setTesting(false), 400);
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncAllToSupabase();
    setTimeout(() => setSyncing(false), 500);
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              supabaseInfo.connected
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-blue-950 flex flex-wrap items-center gap-2">
              Conexão com o Banco de Dados
              {supabaseInfo.connected ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Conectado & Políticas Ativas
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Configuração de Conexão Pendente
                </span>
              )}
            </h3>
            <p className="text-xs text-blue-900/70 font-medium mt-0.5">
              {supabaseInfo.connected
                ? `Servidor: ${supabaseInfo.url} · Latência: ${supabaseInfo.latencyMs || 0}ms`
                : 'Configure a URL do servidor e a chave de acesso para sincronizar empresas e contatos.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConfigureSupabase && (
            <button
              onClick={onConfigureSupabase}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5" />
              Configurar Conexão
            </button>
          )}

          <button
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            Testar Ping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
          <div className="text-blue-950 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-600" />
              Parâmetros de Conexão:
            </span>
            {onConfigureSupabase && (
              <button
                onClick={onConfigureSupabase}
                className="text-[11px] text-blue-700 hover:underline font-bold cursor-pointer"
              >
                Alterar Chaves
              </button>
            )}
          </div>
          <div className="font-mono text-[11px] text-blue-950 space-y-1">
            <div className="truncate">
              <strong>URL do Servidor:</strong> {supabaseInfo.url || 'Não configurada (clique em Configurar Conexão)'}
            </div>
            <div>
              <strong>Status da Conexão:</strong>{' '}
              <span className={supabaseInfo.connected ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {supabaseInfo.connected ? 'Ativo e Operacional' : 'Armazenamento Local'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
          <div className="text-blue-950 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Políticas de Dados & Sincronização:
          </div>
          <div className="text-blue-950 font-medium text-[11px] leading-relaxed">
            {supabaseInfo.message.replace(/Supabase/gi, 'Servidor').replace(/PostgreSQL/gi, 'Banco de Dados')}
          </div>
          {supabaseInfo.connected && (
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                {syncing ? 'Sincronizando...' : 'Sincronizar Carteira Agora'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

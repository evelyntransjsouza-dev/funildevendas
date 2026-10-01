import React, { useState } from 'react';
import { GENERATED_SQL_SCRIPT } from '../data/sqlPoliciesGenerator';
import { SupabaseStatusCard } from './SupabaseStatusCard';
import { Database, Copy, Check, Download, ShieldCheck, HardDrive, Key, X } from 'lucide-react';

interface SqlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlViewerModal: React.FC<SqlViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GENERATED_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([GENERATED_SQL_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estrutura_banco_politicas_armazenamento.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border-2 border-blue-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-blue-950 flex flex-col max-h-[90vh]">
        {/* Header com Fundo Branco e Letras Azul */}
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-blue-950">
                Estrutura do Banco & Políticas de Armazenamento
              </h3>
              <p className="text-xs text-blue-700 font-medium">
                Banco de dados com Políticas de Segurança e Pastas de Armazenamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-950 border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" /> Copiar Estrutura
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Arquivo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status do Servidor Conectado */}
        <div className="p-4 bg-white border-b border-blue-100">
          <SupabaseStatusCard />
        </div>

        {/* Resumo das Políticas com Fundo Branco e Azul */}
        <div className="p-4 bg-white border-b border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Políticas de Segurança Ativadas</span>
            </div>
            <p className="text-blue-900/80 text-[11px] leading-relaxed">
              Vendedores acessam apenas suas carteiras; Gestores supervisionam toda a equipe.
            </p>
          </div>

          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Pastas de Armazenamento</span>
            </div>
            <p className="text-blue-900/80 text-[11px] leading-relaxed">
              Pastas protegidas para <code className="text-blue-700">propostas</code>, <code className="text-blue-700">contratos</code> e documentos.
            </p>
          </div>

          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Segurança por Perfil</span>
            </div>
            <p className="text-blue-900/80 text-[11px] leading-relaxed">
              Controle de permissões baseado nos papéis <code className="text-blue-700">gestor</code> e <code className="text-blue-700">vendedor</code>.
            </p>
          </div>
        </div>

        {/* Editor do Código com Fundo Claro e Letras Azul */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-50 border-t border-b border-blue-100">
          <pre className="text-blue-950 leading-relaxed whitespace-pre-wrap font-mono">
            {GENERATED_SQL_SCRIPT}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-blue-100 flex items-center justify-between text-xs text-blue-900 font-medium bg-white">
          <span>Execute este script no editor do seu banco de dados para habilitar as tabelas e políticas de armazenamento.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold rounded-xl border border-blue-200 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

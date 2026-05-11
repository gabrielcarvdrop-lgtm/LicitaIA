"use client";

import { useState } from "react";
import {
  Copy,
  Download,
  Check,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  content: string;
  isStreaming: boolean;
  tipoDocumento: string;
  onRegenerate: () => void;
}

export function DocumentPreview({
  content,
  isStreaming,
  tipoDocumento,
  onRegenerate,
}: DocumentPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Texto copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = tipoDocumento
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col rounded-2xl bg-[#12121a] border border-[#1e293b] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e293b] bg-[#0d0d14]">
        <div className="flex items-center gap-2.5">
          {isStreaming ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span className="text-xs font-medium text-[#94a3b8]">
                Gerando documento...
              </span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-[#94a3b8]">
                {tipoDocumento || "Documento gerado"}
              </span>
            </>
          )}
        </div>

        {!isStreaming && content && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] bg-[#1a1a2e] border border-[#1e293b] hover:border-purple-500/30 hover:text-purple-300 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Regerar
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] bg-[#1a1a2e] border border-[#1e293b] hover:border-blue-500/30 hover:text-[#e2e8f0] transition-all"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] bg-[#1a1a2e] border border-[#1e293b] hover:border-blue-500/30 hover:text-[#e2e8f0] transition-all"
            >
              <Download className="w-3 h-3" />
              Baixar .txt
            </button>
          </div>
        )}
      </div>

      {/* Document body — styled like a paper document */}
      <div className="flex-1 overflow-auto bg-[#f8f7f4] p-6 sm:p-10">
        {!content && !isStreaming ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            O documento aparecerá aqui após a geração.
          </div>
        ) : (
          <div
            className={cn(
              "max-w-[720px] mx-auto",
              "font-['Georgia',serif] text-[14.5px] text-gray-800 leading-[1.85]",
              "whitespace-pre-wrap"
            )}
          >
            {content}
            {/* blinking cursor while streaming */}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Word count footer */}
      {content && !isStreaming && (
        <div className="px-5 py-2 border-t border-[#1e293b] bg-[#0d0d14] flex items-center justify-between">
          <span className="text-[10px] text-[#3d4f66]">
            {content.split(/\s+/).filter(Boolean).length} palavras •{" "}
            {content.length} caracteres
          </span>
          <span className="text-[10px] text-[#3d4f66]">
            Gerado por Claude Sonnet — revisar antes de protocolar
          </span>
        </div>
      )}
    </div>
  );
}

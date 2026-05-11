"use client";

import { useState } from "react";
import { Copy, Download, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  content: string;
  title?: string;
  className?: string;
}

export function DocumentEditor({ content, title, className }: DocumentEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title ?? "documento"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex flex-col rounded-2xl bg-[#12121a] border border-[#1e293b] overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0d0d14]">
        <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
          <FileText className="w-4 h-4" />
          <span>{title ?? "Documento gerado"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] bg-[#1a1a2e] border border-[#1e293b] hover:border-blue-500/30 hover:text-[#e2e8f0] transition-all"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] bg-[#1a1a2e] border border-[#1e293b] hover:border-blue-500/30 hover:text-[#e2e8f0] transition-all"
          >
            <Download className="w-3 h-3" />
            Baixar .txt
          </button>
        </div>
      </div>

      {/* Content */}
      <pre className="flex-1 p-5 text-sm text-[#e2e8f0] font-mono whitespace-pre-wrap overflow-y-auto leading-relaxed bg-[#12121a]">
        {content}
      </pre>
    </div>
  );
}

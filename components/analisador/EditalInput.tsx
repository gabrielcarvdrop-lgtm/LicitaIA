"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Loader2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  Tag,
  Hash,
  DollarSign,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditalSummary {
  numero: string | null;
  orgao: string | null;
  modalidade: string | null;
  objeto: string | null;
  dataAbertura: string | null;
  valorEstimado: string | null;
  criterio: string | null;
}

interface EditalInputProps {
  onEditalReady: (text: string, summary: EditalSummary) => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

const MAX_CHARS = 100_000;

const summaryFields = [
  { key: "numero" as const, label: "Nº do Edital", icon: Hash },
  { key: "orgao" as const, label: "Órgão", icon: Building2 },
  { key: "modalidade" as const, label: "Modalidade", icon: Tag },
  { key: "objeto" as const, label: "Objeto", icon: FileText },
  { key: "dataAbertura" as const, label: "Abertura", icon: Calendar },
  { key: "valorEstimado" as const, label: "Valor Est.", icon: DollarSign },
  { key: "criterio" as const, label: "Critério", icon: Scale },
];

export function EditalInput({ onEditalReady, onClear, isAnalyzing }: EditalInputProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<EditalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const hasText = text.trim().length >= 50;
  const isReady = !!summary;

  const handleAnalyze = async () => {
    if (!hasText || isOverLimit || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edital: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao processar edital");

      setSummary(data);
      onEditalReady(text, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar edital");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setSummary(null);
    setError(null);
    onClear();
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-[#e2e8f0]">Texto do Edital</span>
        </div>
        {(hasText || summary) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a2e] transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Novo edital
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading || isAnalyzing}
          placeholder="Cole o texto do edital aqui...

Você pode colar o conteúdo completo do edital (PDF copiado, texto do site de compras, etc.). A IA irá processar e você poderá fazer perguntas como:
• Quais documentos são obrigatórios?
• Existe risco de desclassificação?
• Quais são os prazos importantes?"
          className={cn(
            "w-full h-full min-h-[240px] resize-none rounded-xl bg-[#1a1a2e] border px-4 py-3",
            "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66] leading-relaxed",
            "focus:outline-none focus:ring-1 transition-all duration-150",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            isOverLimit
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#1e293b] focus:border-blue-500/50 focus:ring-blue-500/20"
          )}
        />

        {/* Char counter badge */}
        <div
          className={cn(
            "absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded-md",
            isOverLimit
              ? "bg-red-500/20 text-red-400"
              : charCount > MAX_CHARS * 0.9
              ? "bg-amber-500/20 text-amber-400"
              : "bg-[#12121a] text-[#3d4f66]"
          )}
        >
          {charCount.toLocaleString("pt-BR")}/{MAX_CHARS.toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Over-limit warning */}
      {isOverLimit && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Limite de 100.000 caracteres excedido. O texto será truncado automaticamente.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Analyze Button */}
      {!summary && (
        <button
          onClick={handleAnalyze}
          disabled={!hasText || isLoading || isAnalyzing}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
            hasText && !isLoading && !isAnalyzing
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              : "bg-[#1a1a2e] border border-[#1e293b] text-[#3d4f66] cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando edital...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Analisar Edital
            </>
          )}
        </button>
      )}

      {/* Summary Card */}
      {summary && (
        <div className="rounded-xl bg-[#12121a] border border-emerald-500/20 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Edital processado com sucesso</span>
          </div>
          <div className="p-3 space-y-2">
            {summaryFields.map(({ key, label, icon: Icon }) => {
              const value = summary[key];
              if (!value) return null;
              return (
                <div key={key} className="flex items-start gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-[#64748b] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wide block">
                      {label}
                    </span>
                    <span className="text-xs text-[#e2e8f0] leading-snug line-clamp-2">
                      {value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

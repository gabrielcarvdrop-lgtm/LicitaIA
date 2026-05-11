"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { Step1TipoDoc } from "./Step1TipoDoc";
import { Step2Dados } from "./Step2Dados";
import { Step3Situacao } from "./Step3Situacao";
import { DocumentPreview } from "./DocumentPreview";
import { EMPTY_FORM, type FormData } from "./types";
import type { GenerateDocumentInput } from "@/app/api/generate/route";

export function RecursosPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [document, setDocument] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleReset = () => {
    abortRef.current?.abort();
    setStep(1);
    setFormData(EMPTY_FORM);
    setDocument("");
    setIsStreaming(false);
    setHasGenerated(false);
  };

  const handleGenerate = useCallback(async () => {
    if (isStreaming) return;

    setDocument("");
    setIsStreaming(true);
    setHasGenerated(true);

    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    const input: GenerateDocumentInput = {
      tipoDocumento: formData.tipoDocumento,
      numeroEdital: formData.numeroEdital,
      orgao: formData.orgao,
      modalidade: formData.modalidade,
      objeto: formData.objeto,
      empresa: formData.empresa,
      situacao: formData.situacao,
      trechos: formData.trechos,
      sugerirArgumentos: formData.sugerirArgumentos,
    };

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erro na requisição" }));
        throw new Error(err.error ?? "Falha ao gerar documento");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) setDocument((prev) => prev + parsed.text);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Falha desconhecida";
      toast.error(`Erro ao gerar documento: ${msg}`);
      setDocument(`ERRO: ${msg}`);
    } finally {
      setIsStreaming(false);
    }
  }, [formData, isStreaming]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">
              Gerador de Recursos
            </h2>
            <p className="text-sm text-[#64748b]">
              Preencha os dados em 3 passos e a IA gera o documento jurídico completo
            </p>
          </div>
        </div>

        {hasGenerated && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5 border border-white/8 transition-all shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Novo documento
          </button>
        )}
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
          <StepIndicator currentStep={step} />
          {step > 1 && !hasGenerated && (
            <span className="hidden sm:block text-xs text-[#3d4f66] truncate max-w-[200px]">
              {formData.tipoDocumento}
            </span>
          )}
        </div>

        <div className="p-6">
          {step === 1 && (
            <Step1TipoDoc
              value={formData.tipoDocumento}
              onChange={(v) => updateField("tipoDocumento", v)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Dados
              data={formData}
              onChange={updateField}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Situacao
              data={formData}
              onChange={updateField}
              onGenerate={handleGenerate}
              onBack={() => setStep(2)}
              isLoading={isStreaming}
            />
          )}
        </div>
      </div>

      {/* Document Preview */}
      {hasGenerated && (
        <div ref={previewRef}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs text-[#64748b] px-3">Documento gerado</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <DocumentPreview
            content={document}
            isStreaming={isStreaming}
            tipoDocumento={formData.tipoDocumento}
            onRegenerate={handleGenerate}
          />
        </div>
      )}
    </div>
  );
}

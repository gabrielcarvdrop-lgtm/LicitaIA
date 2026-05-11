import { Loader2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormData } from "./types";

interface Step3Props {
  data: FormData;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onGenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Step3Situacao({ data, onChange, onGenerate, onBack, isLoading }: Step3Props) {
  const canGenerate = data.situacao.trim().length >= 30;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">
          Situação & Argumentos
        </h3>
        <p className="text-xs text-[#64748b]">
          Descreva com detalhes o que aconteceu. Quanto mais contexto você fornecer, melhor o documento gerado.
        </p>
      </div>

      {/* Main situation textarea */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-xs font-medium text-[#94a3b8]">
          Descreva a situação e seus argumentos
          <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.situacao}
          onChange={(e) => onChange("situacao", e.target.value)}
          disabled={isLoading}
          placeholder={`Descreva o que aconteceu e por que você discorda da decisão...

Exemplo:
• O edital exige que a empresa tenha sede no estado X (item 5.3), o que restringe indevidamente a competição
• A exigência de atestado de capacidade técnica (item 6.2.3) é desproporcional pois exige volume 10x maior ao do objeto
• Minha empresa foi inabilitada porque o pregoeiro interpretou incorretamente o item 4.1...`}
          rows={7}
          className={cn(
            "w-full resize-none rounded-xl bg-[#1a1a2e] border border-[#1e293b] px-4 py-3",
            "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66] leading-relaxed",
            "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
            "transition-all duration-150 disabled:opacity-60"
          )}
        />
        <p className="text-[10px] text-[#3d4f66]">
          {data.situacao.length} caracteres{" "}
          {data.situacao.length < 30 && data.situacao.length > 0 && (
            <span className="text-amber-400">— mínimo 30 caracteres</span>
          )}
        </p>
      </div>

      {/* Relevant excerpts */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#94a3b8]">
          Trechos relevantes do edital, ata ou decisão{" "}
          <span className="text-[#64748b] font-normal">(opcional)</span>
        </label>
        <textarea
          value={data.trechos}
          onChange={(e) => onChange("trechos", e.target.value)}
          disabled={isLoading}
          placeholder="Cole aqui os trechos do edital, da ata da sessão ou da decisão contestada que são relevantes para o documento..."
          rows={4}
          className={cn(
            "w-full resize-none rounded-xl bg-[#1a1a2e] border border-[#1e293b] px-4 py-3",
            "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66] leading-relaxed font-mono text-xs",
            "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
            "transition-all duration-150 disabled:opacity-60"
          )}
        />
      </div>

      {/* AI suggestions toggle */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={data.sugerirArgumentos}
            onChange={(e) => onChange("sugerirArgumentos", e.target.checked)}
            disabled={isLoading}
            className="sr-only"
          />
          <div
            className={cn(
              "w-9 h-5 rounded-full transition-all duration-200",
              data.sugerirArgumentos
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : "bg-[#1a1a2e] border border-[#1e293b]"
            )}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 absolute top-[3px]",
                data.sugerirArgumentos ? "translate-x-[18px]" : "translate-x-[3px]"
              )}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-sm font-medium text-[#e2e8f0]">
              Sugerir argumentos jurídicos adicionais
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            A IA irá incluir argumentos adicionais baseados na Lei 14.133/2021 e jurisprudência do TCU,
            além dos que você descreveu acima.
          </p>
        </div>
      </label>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl text-sm text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a2e] transition-all disabled:opacity-40"
        >
          ← Voltar
        </button>
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
            canGenerate && !isLoading
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20"
              : "bg-[#1a1a2e] border border-[#1e293b] text-[#3d4f66] cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando documento...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Gerar Documento
            </>
          )}
        </button>
      </div>
    </div>
  );
}

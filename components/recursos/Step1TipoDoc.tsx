import { Clock, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIPOS_DOCUMENTO, type FormData } from "./types";

interface Step1Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}

export function Step1TipoDoc({ value, onChange, onNext }: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">
          Qual documento você precisa gerar?
        </h3>
        <p className="text-xs text-[#64748b]">
          Selecione o tipo adequado à sua situação.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPOS_DOCUMENTO.map((tipo) => {
          const isSelected = value === tipo.id;
          return (
            <button
              key={tipo.id}
              type="button"
              onClick={() => onChange(tipo.id)}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-150",
                isSelected
                  ? "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/20"
                  : "border-[#1e293b] bg-[#1a1a2e] hover:border-[#2d3d52] hover:bg-[#1e2a3a]"
              )}
            >
              {/* Radio indicator + label */}
              <div className="flex items-center gap-2.5 w-full">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-500"
                      : "border-[#3d4f66]"
                  )}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-blue-300" : "text-[#e2e8f0]"
                  )}
                >
                  {tipo.label}
                </span>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed pl-6">
                {tipo.description}
              </p>

              <div className="flex items-center gap-3 pl-6">
                <div className="flex items-center gap-1 text-[10px] text-[#3d4f66]">
                  <Scale className="w-3 h-3" />
                  {tipo.fundamento}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#3d4f66]">
                  <Clock className="w-3 h-3" />
                  {tipo.prazo}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!value}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
            value
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20"
              : "bg-[#1a1a2e] border border-[#1e293b] text-[#3d4f66] cursor-not-allowed"
          )}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}

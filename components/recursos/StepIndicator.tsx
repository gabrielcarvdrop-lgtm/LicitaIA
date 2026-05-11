import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Tipo de Documento" },
  { number: 2, label: "Dados da Licitação" },
  { number: 3, label: "Situação & Argumentos" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle */}
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 shrink-0",
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-[#1a1a2e] border border-[#1e293b] text-[#64748b]"
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap hidden sm:block",
                  isActive
                    ? "text-[#e2e8f0]"
                    : isDone
                    ? "text-emerald-400"
                    : "text-[#64748b]"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "h-px mx-3 w-12 sm:w-20 transition-all duration-300",
                  isDone ? "bg-emerald-500/50" : "bg-[#1e293b]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

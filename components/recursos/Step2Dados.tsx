import { cn } from "@/lib/utils";
import { MODALIDADES, type FormData } from "./types";

interface Step2Props {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-medium text-[#94a3b8]">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#3d4f66]">{hint}</p>}
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-lg bg-[#1a1a2e] border border-[#1e293b] px-3 py-2.5",
  "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66]",
  "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
  "transition-all duration-150"
);

export function Step2Dados({ data, onChange, onNext, onBack }: Step2Props) {
  const canProceed =
    data.numeroEdital.trim() &&
    data.orgao.trim() &&
    data.objeto.trim() &&
    data.empresa.trim();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">
          Dados da Licitação
        </h3>
        <p className="text-xs text-[#64748b]">
          Essas informações serão usadas para identificar o documento formalmente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Número do Edital / Processo" required hint="Ex: Pregão Eletrônico nº 001/2025">
          <input
            type="text"
            value={data.numeroEdital}
            onChange={(e) => onChange("numeroEdital", e.target.value)}
            placeholder="Ex: PE nº 001/2025 — UASG 000000"
            className={inputCls}
          />
        </Field>

        <Field label="Modalidade" hint="Selecione a modalidade do processo">
          <select
            value={data.modalidade}
            onChange={(e) => onChange("modalidade", e.target.value)}
            className={cn(inputCls, "appearance-none cursor-pointer")}
          >
            <option value="">Selecione...</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Órgão / Entidade Licitante" required hint="Nome completo do órgão público">
          <input
            type="text"
            value={data.orgao}
            onChange={(e) => onChange("orgao", e.target.value)}
            placeholder="Ex: Ministério da Saúde — CGRL"
            className={inputCls}
          />
        </Field>

        <Field label="Nome da Empresa Recorrente" required hint="Razão social ou nome fantasia">
          <input
            type="text"
            value={data.empresa}
            onChange={(e) => onChange("empresa", e.target.value)}
            placeholder="Ex: Empresa XYZ Ltda."
            className={inputCls}
          />
        </Field>

        <Field label="Objeto da Licitação" required hint="Breve descrição do que está sendo licitado" >
          <input
            type="text"
            value={data.objeto}
            onChange={(e) => onChange("objeto", e.target.value)}
            placeholder="Ex: Aquisição de equipamentos de informática"
            className={cn(inputCls, "sm:col-span-2")}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a2e] transition-all"
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
            canProceed
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

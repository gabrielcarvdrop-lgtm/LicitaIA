import type { Metadata } from "next";
import { ConsultorChat } from "@/components/consultor/ConsultorChat";

export const metadata: Metadata = {
  title: "Consultor Lei 14.133 — LicitaIA",
  description:
    "Consultoria jurídica especializada na Lei 14.133/2021. Tire dúvidas sobre a Nova Lei de Licitações com IA.",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 -mb-4 sm:-mb-8 overflow-hidden animate-fade-in">
      <ConsultorChat />
    </div>
  );
}

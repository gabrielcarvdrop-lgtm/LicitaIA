import type { Metadata } from "next";
import { AnalisadorPage } from "@/components/analisador/AnalisadorPage";

export const metadata: Metadata = {
  title: "Analisador de Editais — LicitaIA",
  description:
    "Analise editais de licitação com IA. Identifique requisitos de habilitação, prazos críticos e riscos automaticamente.",
};

export default function Page() {
  return <AnalisadorPage />;
}

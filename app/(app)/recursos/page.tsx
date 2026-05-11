import type { Metadata } from "next";
import { RecursosPage } from "@/components/recursos/RecursosPage";

export const metadata: Metadata = {
  title: "Gerador de Recursos — LicitaIA",
  description:
    "Gere recursos administrativos, impugnações e pedidos de esclarecimento com fundamentação na Lei 14.133/2021.",
};

export default function Page() {
  return <RecursosPage />;
}

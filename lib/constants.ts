export const APP_NAME = "LicitaIA";
export const APP_TAGLINE = "Inteligência Artificial para Licitações";
export const APP_VERSION = "0.1.0";

export const MODULES = [
  {
    id: "analisador",
    title: "Analisador de Editais",
    description:
      "Cole o texto do edital e receba uma análise completa: requisitos, prazos, riscos e oportunidades identificados por IA.",
    href: "/analisador",
    icon: "FileSearch",
    badge: "IA Avançada",
  },
  {
    id: "recursos",
    title: "Gerador de Recursos",
    description:
      "Gere recursos administrativos, impugnações e pedidos de esclarecimento com fundamentação legal precisa e linguagem jurídica.",
    href: "/recursos",
    icon: "FileText",
    badge: "Documentos",
  },
  {
    id: "consultor",
    title: "Consultor Lei 14.133",
    description:
      "Tire dúvidas sobre a Nova Lei de Licitações com um especialista virtual disponível 24/7, atualizado com toda a jurisprudência.",
    href: "/consultor",
    icon: "Scale",
    badge: "Jurídico",
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

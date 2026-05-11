export interface FormData {
  // Step 1
  tipoDocumento: string;
  // Step 2
  numeroEdital: string;
  orgao: string;
  modalidade: string;
  objeto: string;
  empresa: string;
  // Step 3
  situacao: string;
  trechos: string;
  sugerirArgumentos: boolean;
}

export const TIPOS_DOCUMENTO = [
  {
    id: "Impugnação ao Edital",
    label: "Impugnação ao Edital",
    description: "Contra ilegalidades ou restrições indevidas no edital",
    fundamento: "Art. 164 — Lei 14.133/2021",
    prazo: "Até 3 dias úteis antes da abertura",
  },
  {
    id: "Recurso Administrativo",
    label: "Recurso Administrativo",
    description: "Contra decisão de habilitação ou inabilitação",
    fundamento: "Art. 165, I — Lei 14.133/2021",
    prazo: "3 dias úteis",
  },
  {
    id: "Recurso contra Resultado de Julgamento",
    label: "Recurso contra Resultado de Julgamento",
    description: "Contra o resultado do julgamento das propostas",
    fundamento: "Art. 165, I — Lei 14.133/2021",
    prazo: "3 dias úteis",
  },
  {
    id: "Contrarrazões de Recurso",
    label: "Contrarrazões de Recurso",
    description: "Para rebater o recurso interposto por outro licitante",
    fundamento: "Art. 165, §1º — Lei 14.133/2021",
    prazo: "3 dias úteis",
  },
  {
    id: "Pedido de Esclarecimento",
    label: "Pedido de Esclarecimento",
    description: "Dúvidas objetivas sobre cláusulas do edital",
    fundamento: "Art. 164, §1º — Lei 14.133/2021",
    prazo: "3 dias úteis antes da abertura",
  },
] as const;

export const MODALIDADES = [
  "Pregão Eletrônico",
  "Pregão Presencial",
  "Concorrência",
  "Concorrência Eletrônica",
  "Tomada de Preços",
  "Convite",
  "Leilão",
  "Concurso",
  "Diálogo Competitivo",
];

export const EMPTY_FORM: FormData = {
  tipoDocumento: "",
  numeroEdital: "",
  orgao: "",
  modalidade: "",
  objeto: "",
  empresa: "",
  situacao: "",
  trechos: "",
  sugerirArgumentos: true,
};

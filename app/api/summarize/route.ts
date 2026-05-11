import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SUMMARY_SYSTEM = `Você é um extrator de dados de editais de licitação.
Dado o texto de um edital, extraia as informações abaixo e retorne SOMENTE um JSON válido, sem nenhum texto extra.
Se um campo não for encontrado, use null.

Formato esperado:
{
  "numero": "número/código do edital ou processo",
  "orgao": "nome do órgão ou entidade licitante",
  "modalidade": "modalidade de licitação (Pregão Eletrônico, Concorrência, etc.)",
  "objeto": "descrição resumida do objeto (máx 120 caracteres)",
  "dataAbertura": "data de abertura das propostas (formato DD/MM/AAAA HH:mm ou DD/MM/AAAA)",
  "valorEstimado": "valor estimado/referência se disponível",
  "criterio": "critério de julgamento (Menor Preço, Técnica e Preço, etc.)"
}`;

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const { edital } = await request.json();
  if (!edital || edital.trim().length < 50) {
    return NextResponse.json({ error: "Texto inválido" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SUMMARY_SYSTEM,
    messages: [
      {
        role: "user",
        content: edital.slice(0, 8000),
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Falha ao extrair dados do edital" }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANALISADOR_SYSTEM_PROMPT } from "@/lib/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnalyzeRequest {
  messages: ChatMessage[];
  edital: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, edital } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!edital || edital.trim().length < 50) {
    return new Response(JSON.stringify({ error: "Texto do edital inválido ou muito curto" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const editalTruncated =
    edital.length > 100_000 ? edital.slice(0, 100_000) + "\n\n[... texto truncado em 100.000 caracteres ...]" : edital;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: ANALISADOR_SYSTEM_PROMPT(editalTruncated),
          messages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const data = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
        }

        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

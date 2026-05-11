import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 4096;

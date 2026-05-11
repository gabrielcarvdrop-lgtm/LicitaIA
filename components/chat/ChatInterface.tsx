"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageBubble, type Message } from "./MessageBubble";
import type { ChatModule } from "@/app/api/chat/route";

interface ChatInterfaceProps {
  module: ChatModule;
  placeholder?: string;
  welcomeMessage?: string;
}

export function ChatInterface({
  module,
  placeholder = "Digite sua mensagem...",
  welcomeMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage
      ? [
          {
            id: "welcome",
            role: "assistant",
            content: welcomeMessage,
            createdAt: new Date(),
          },
        ]
      : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, module }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao comunicar com a IA");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Erro: ${err instanceof Error ? err.message : "Falha na comunicação"}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages(
      welcomeMessage
        ? [
            {
              id: "welcome",
              role: "assistant",
              content: welcomeMessage,
              createdAt: new Date(),
            },
          ]
        : []
    );
    setInput("");
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#12121a] border border-[#1e293b] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-[#64748b]">
            Inicie a conversa abaixo
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#1a1a2e] border border-[#1e293b] text-sm text-[#64748b]">
              Analisando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0d0d14]">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-xl bg-[#1a1a2e] border border-[#1e293b] px-4 py-3",
              "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66]",
              "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
              "transition-all duration-150 max-h-40 min-h-[44px]"
            )}
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
            }}
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a2e] border border-[#1e293b] text-[#64748b] hover:text-[#94a3b8] transition-colors"
              title="Limpar conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150",
                input.trim() && !isLoading
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 shadow-lg shadow-blue-500/20"
                  : "bg-[#1a1a2e] border border-[#1e293b] text-[#3d4f66] cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-[#3d4f66] mt-2 text-center">
          Enter para enviar • Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

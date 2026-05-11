"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, RotateCcw, Bot, User, Scale, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  { label: "Modalidades de licitação", question: "Quais são as modalidades de licitação na nova lei?" },
  { label: "Pregão eletrônico", question: "Como funciona o pregão eletrônico na Lei 14.133?" },
  { label: "Prazos para recurso", question: "Quais os prazos para recurso administrativo na Lei 14.133/2021?" },
  { label: "Mudanças da 8.666", question: "O que mudou da Lei 8.666/93 para a Lei 14.133/2021?" },
  { label: "Registro de preços", question: "Como funciona o sistema de registro de preços na Lei 14.133?" },
  { label: "Dispensa de licitação", question: "Quais são as hipóteses de dispensa de licitação na Lei 14.133?" },
];

export function ConsultorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (!showScrollBtn && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollBtn]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming || cooldown) return;

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantId = crypto.randomUUID();
      const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 1500);

      if (textareaRef.current) textareaRef.current.style.height = "44px";

      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, module: "consultor" }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Falha na comunicação" }));
          throw new Error(err.error ?? "Erro desconhecido");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, content: m.content + parsed.text } : m)
                );
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(msg);
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: `❌ ${msg}` } : m)
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, cooldown]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar — visible only when chat has messages */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 glass shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-[#94a3b8]">Consultor Lei 14.133/2021</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Nova conversa
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="relative flex-1 min-h-0">
        {isEmpty ? (
          <div className="h-full overflow-y-auto">
            <EmptyState onSelect={(q) => sendMessage(q)} />
          </div>
        ) : (
          <>
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto"
            >
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 shrink-0">
                      <Scale className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#12121a] border border-white/8">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 4 }}
                  transition={{ duration: 0.15 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a2e] border border-white/8 text-[#94a3b8] hover:text-white hover:border-emerald-500/30 shadow-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Input bar */}
      <div className={cn(
        "shrink-0 px-4 pb-5 pt-3 glass",
        isEmpty ? "border-t-0" : "border-t border-white/5"
      )}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Pergunte sobre a Lei 14.133/2021..."
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-xl bg-white/5 border border-white/8 px-4 py-3",
                "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66] leading-relaxed",
                "focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15",
                "transition-all duration-150 min-h-[44px] max-h-40 disabled:opacity-60"
              )}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming || cooldown}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all duration-150",
                input.trim() && !isStreaming && !cooldown
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                  : "bg-white/5 border border-white/8 text-[#3d4f66] cursor-not-allowed"
              )}
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-[#3d4f66] mt-2 text-center">
            Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full px-4 py-12 space-y-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20">
            <Scale className="w-9 h-9 text-emerald-400" />
          </div>
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">
            Consultor Lei 14.133/2021
          </h2>
          <p className="text-sm text-[#64748b] mt-2 max-w-sm leading-relaxed">
            Tire dúvidas sobre a Nova Lei de Licitações como se tivesse um
            advogado especialista ao seu lado
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-xs text-[#64748b]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Claude Sonnet • Lei 14.133/2021 + jurisprudência TCU
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-[10px] font-semibold text-[#3d4f66] uppercase tracking-widest text-center mb-4">
          Perguntas frequentes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTED_QUESTIONS.map(({ label, question }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              onClick={() => onSelect(question)}
              className="flex flex-col items-start gap-1 px-4 py-3.5 rounded-xl bg-white/3 border border-white/8 text-left transition-all duration-150 hover:border-emerald-500/30 hover:bg-emerald-500/5 group"
            >
              <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                {label}
              </span>
              <span className="text-xs text-[#64748b] leading-relaxed">{question}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (!message.content) return null;

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5",
        isUser ? "bg-blue-500/20" : "bg-emerald-500/15"
      )}>
        {isUser ? <User className="w-4 h-4 text-blue-400" /> : <Scale className="w-4 h-4 text-emerald-400" />}
      </div>
      <div className={cn(
        "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser
          ? "bg-blue-600/15 text-[#e2e8f0] border border-blue-500/20 rounded-tr-sm"
          : "bg-[#12121a] text-[#e2e8f0] border border-white/8 rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <LegalMarkdown content={message.content} />
        )}
      </div>
    </div>
  );
}

function LegalMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold text-[#e2e8f0] mt-4 mb-2 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold text-[#e2e8f0] mt-4 mb-2 first:mt-0 pb-1 border-b border-white/8">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold text-emerald-300 mt-3 mb-1.5 first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="text-sm text-[#e2e8f0] mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 my-2.5 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 my-2.5 pl-1 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-sm text-[#e2e8f0] leading-relaxed list-none">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500/60 shrink-0" />
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-[#f1f5f9]">{children}</strong>,
        em: ({ children }) => <em className="italic text-[#94a3b8]">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 px-4 py-3 rounded-lg border-l-2 border-emerald-500/60 bg-emerald-500/5">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Fundamentação Legal</div>
            <div className="text-sm text-[#cbd5e1] italic leading-relaxed">{children}</div>
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-[#0d0d14] border border-white/8 rounded-lg p-3 text-xs font-mono text-[#94a3b8] my-2 overflow-x-auto whitespace-pre">{children}</code>
          ) : (
            <code className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-white/8">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-[#0d0d14]">{children}</thead>,
        th: ({ children }) => <th className="border-b border-white/8 px-3 py-2 text-left font-semibold text-[#94a3b8]">{children}</th>,
        td: ({ children }) => <td className="border-b border-white/5 px-3 py-2 text-[#e2e8f0]">{children}</td>,
        hr: () => <hr className="border-white/8 my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

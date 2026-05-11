"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, RotateCcw, Bot, User, Lightbulb, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Quais documentos são obrigatórios para habilitação?",
  "Existe risco de desclassificação neste edital?",
  "Resuma os critérios de julgamento",
  "Quais são os prazos importantes?",
  "Este edital tem exigências técnicas restritivas?",
];

const WELCOME_MESSAGE = `Olá! Analisei o edital que você enviou. 🔍

Estou pronto para responder qualquer pergunta sobre ele. Você pode me perguntar sobre:

- **Documentos e habilitação** — o que precisa estar em dia para participar
- **Prazos e cronograma** — datas críticas para não perder
- **Critérios de julgamento** — como sua proposta será avaliada
- **Riscos** — cláusulas que podem levar à desclassificação
- **Estratégia** — como maximizar suas chances de ganhar

Use as sugestões abaixo ou faça sua própria pergunta!`;

interface AnalisadorChatProps {
  edital: string;
  isEditalReady: boolean;
  onAnalyzingChange: (v: boolean) => void;
}

export function AnalisadorChat({ edital, isEditalReady, onAnalyzingChange }: AnalisadorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isEditalReady && messages.length === 0) {
      setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE }]);
    }
    if (!isEditalReady) setMessages([]);
  }, [isEditalReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll only when already near bottom
  useEffect(() => {
    if (!showScrollBtn) {
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
      if (!content.trim() || isStreaming || cooldown || !isEditalReady) return;

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: content.trim() };
      const assistantId = crypto.randomUUID();
      const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);
      setCooldown(true);
      onAnalyzingChange(true);

      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }

      setTimeout(() => setCooldown(false), 1500);

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" && m.content.trim())
        .map(({ role, content }) => ({ role, content }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, edital }),
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
        onAnalyzingChange(false);
      }
    },
    [messages, edital, isEditalReady, isStreaming, cooldown, onAnalyzingChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages(isEditalReady ? [{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE }] : []);
    setIsStreaming(false);
    onAnalyzingChange(false);
  };

  // Empty state
  if (!isEditalReady) {
    return (
      <div className="flex flex-col h-full rounded-2xl bg-white/3 border border-white/8 items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Bot className="w-8 h-8 text-[#3d4f66]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#94a3b8]">Aguardando edital</p>
          <p className="text-xs text-[#64748b] mt-1 max-w-xs">
            Cole o texto do edital ao lado e clique em{" "}
            <span className="text-blue-400">Analisar Edital</span> para iniciar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 glass">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-[#e2e8f0]">Assistente de Edital</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* Messages + scroll btn */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto p-5 space-y-5"
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500/20 shrink-0">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#1a1a2e] border border-white/8">
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

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              transition={{ duration: 0.15 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a2e] border border-white/8 text-[#94a3b8] hover:text-white hover:border-blue-500/30 shadow-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggested questions */}
      {!isStreaming && messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-[#64748b]">Perguntas sugeridas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] bg-white/3 border border-white/8 hover:border-blue-500/30 hover:text-[#e2e8f0] transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5 glass">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Faça uma pergunta sobre o edital..."
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-xl bg-white/5 border border-white/8 px-4 py-3",
              "text-sm text-[#e2e8f0] placeholder:text-[#3d4f66] leading-relaxed",
              "focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15",
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
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
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
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (!message.content) return null;

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
        isUser ? "bg-blue-500/20" : "bg-purple-500/20"
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-blue-400" /> : <Bot className="w-3.5 h-3.5 text-purple-400" />}
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
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold text-[#e2e8f0] mt-4 mb-2 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold text-[#e2e8f0] mt-3 mb-1.5 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold text-[#cbd5e1] mt-2 mb-1 first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="text-sm text-[#e2e8f0] mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-sm text-[#e2e8f0]">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-sm text-[#e2e8f0]">{children}</ol>,
        li: ({ children }) => <li className="text-sm text-[#e2e8f0] leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-[#f1f5f9]">{children}</strong>,
        em: ({ children }) => <em className="italic text-[#cbd5e1]">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-blue-500/40 pl-3 my-2 text-[#94a3b8] italic">{children}</blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-[#0d0d14] border border-white/8 rounded-lg p-3 text-xs font-mono text-[#94a3b8] my-2 overflow-x-auto whitespace-pre">{children}</code>
          ) : (
            <code className="bg-[#0d0d14] border border-white/8 rounded px-1.5 py-0.5 text-xs font-mono text-[#94a3b8]">{children}</code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-[#0d0d14]">{children}</thead>,
        th: ({ children }) => <th className="border border-white/8 px-3 py-2 text-left font-semibold text-[#94a3b8]">{children}</th>,
        td: ({ children }) => <td className="border border-white/8 px-3 py-1.5 text-[#e2e8f0]">{children}</td>,
        hr: () => <hr className="border-white/8 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

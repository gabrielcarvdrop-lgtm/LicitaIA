"use client";

import { useState, useCallback } from "react";
import { FileSearch } from "lucide-react";
import { EditalInput, type EditalSummary } from "./EditalInput";
import { AnalisadorChat } from "./AnalisadorChat";

export function AnalisadorPage() {
  const [editalText, setEditalText] = useState("");
  const [isEditalReady, setIsEditalReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleEditalReady = useCallback((text: string, _summary: EditalSummary) => {
    setEditalText(text);
    setIsEditalReady(true);
  }, []);

  const handleClear = useCallback(() => {
    setEditalText("");
    setIsEditalReady(false);
    setIsAnalyzing(false);
  }, []);

  return (
    <div className="flex flex-col h-full gap-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-start gap-4 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 shrink-0">
          <FileSearch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#e2e8f0]">
            Analisador de Editais
          </h2>
          <p className="text-sm text-[#64748b]">
            Cole o texto do edital, clique em analisar e converse com a IA sobre qualquer dúvida
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Left column — Edital input (40%) */}
        <div className="lg:w-[40%] shrink-0 flex flex-col min-h-[400px] lg:min-h-0">
          <EditalInput
            onEditalReady={handleEditalReady}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right column — Chat (60%) */}
        <div className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
          <AnalisadorChat
            edital={editalText}
            isEditalReady={isEditalReady}
            onAnalyzingChange={setIsAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Sparkles, Menu } from "lucide-react";
import { APP_VERSION } from "@/lib/constants";
import { useSidebar } from "@/context/SidebarContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Selecione um módulo para começar" },
  "/analisador": { title: "Analisador de Editais", subtitle: "Análise inteligente com IA" },
  "/recursos": { title: "Gerador de Recursos", subtitle: "Documentos jurídicos profissionais" },
  "/consultor": { title: "Consultor Lei 14.133", subtitle: "Consultoria jurídica especializada" },
};

export function Header() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const page = pageTitles[pathname] ?? pageTitles["/"];

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 glass sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[#e2e8f0] leading-tight">
            {page.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b]">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-[#94a3b8]">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Powered by Claude Sonnet</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-[#64748b]">
          v{APP_VERSION}
        </div>
      </div>
    </header>
  );
}

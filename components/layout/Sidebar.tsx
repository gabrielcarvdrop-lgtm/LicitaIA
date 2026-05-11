"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSearch,
  FileText,
  Scale,
  LayoutDashboard,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useSidebar } from "@/context/SidebarContext";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analisador de Editais", href: "/analisador", icon: FileSearch },
  { label: "Gerador de Recursos", href: "/recursos", icon: FileText },
  { label: "Consultor Lei 14.133", href: "/consultor", icon: Scale },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <aside
      className={cn(
        // Base
        "flex flex-col w-64 min-h-screen shrink-0",
        "border-r border-white/5",
        // Glass effect
        "glass",
        // Mobile: fixed overlay, hidden by default
        "fixed inset-y-0 left-0 z-50",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible, static
        "lg:static lg:translate-x-0 lg:z-auto"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#e2e8f0] tracking-tight">
            {APP_NAME}
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={close}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a2e] transition-all"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#3d4f66]">
          Módulos
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150 group",
                isActive
                  ? "bg-blue-500/12 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/10"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-[#e2e8f0] border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform duration-150",
                  isActive
                    ? "text-blue-400"
                    : "text-[#64748b] group-hover:text-[#94a3b8] group-hover:scale-110"
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[#3d4f66]">Claude AI • Online</span>
        </div>
      </div>
    </aside>
  );
}

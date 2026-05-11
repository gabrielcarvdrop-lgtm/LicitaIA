"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileSearch,
  FileText,
  Scale,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE, APP_VERSION } from "@/lib/constants";

const modules = [
  {
    id: "analisador",
    title: "Analisador de Editais",
    description:
      "Cole o texto do edital e receba uma análise completa e estruturada: requisitos de habilitação, prazos críticos, riscos e oportunidades identificados por IA.",
    href: "/analisador",
    icon: FileSearch,
    badge: "IA Avançada",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    iconGradient: "from-blue-500 to-cyan-500",
    iconGlow: "shadow-blue-500/25",
    accentColor: "text-blue-400",
    hoverBorder: "hover:border-blue-500/30",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]",
    features: ["Análise de requisitos", "Detecção de riscos", "Resumo executivo"],
  },
  {
    id: "recursos",
    title: "Gerador de Recursos",
    description:
      "Gere recursos administrativos, impugnações e pedidos de esclarecimento com fundamentação legal precisa e linguagem jurídica profissional.",
    href: "/recursos",
    icon: FileText,
    badge: "Documentos",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    iconGradient: "from-purple-500 to-pink-500",
    iconGlow: "shadow-purple-500/25",
    accentColor: "text-purple-400",
    hoverBorder: "hover:border-purple-500/30",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]",
    features: ["Recursos administrativos", "Impugnações", "Pedidos de esclarecimento"],
  },
  {
    id: "consultor",
    title: "Consultor Lei 14.133",
    description:
      "Tire dúvidas sobre a Nova Lei de Licitações com um especialista virtual disponível 24/7, com conhecimento de toda a jurisprudência.",
    href: "/consultor",
    icon: Scale,
    badge: "Jurídico",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    iconGradient: "from-emerald-500 to-teal-500",
    iconGlow: "shadow-emerald-500/25",
    accentColor: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/30",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(16,185,129,0.12)]",
    features: ["Lei 14.133/2021", "Jurisprudência TCU", "Orientação especializada"],
  },
];

const stats = [
  { icon: Sparkles, label: "Motor de IA", value: "Claude Sonnet 4" },
  { icon: Shield, label: "Base Legal", value: "Lei 14.133/2021" },
  { icon: Zap, label: "Resposta", value: "Tempo real" },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
} as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const;

const statsVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
} as const;

const statItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
} as const;

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-4 py-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-sm text-[#94a3b8] mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sistema operacional
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-[#e2e8f0]">Bem-vindo ao </span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </h1>
        <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mx-auto">
          {APP_TAGLINE} — três módulos especializados para maximizar suas
          chances nas contratações públicas.
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        variants={statsVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={statItem}
              className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/3 border border-white/8"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 shrink-0">
                <Icon className="w-4 h-4 text-[#94a3b8]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#64748b] truncate">{stat.label}</p>
                <p className="text-xs sm:text-sm font-semibold text-[#e2e8f0] truncate">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Module Cards */}
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[10px] font-semibold uppercase tracking-widest text-[#3d4f66] mb-4"
        >
          Módulos disponíveis
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                variants={fadeUp}
                className={`group flex flex-col rounded-2xl bg-white/3 border border-white/8 overflow-hidden transition-all duration-300 ${mod.hoverBorder} ${mod.hoverGlow} hover:-translate-y-1`}
              >
                {/* Gradient top bar */}
                <div
                  className={`h-px w-full bg-gradient-to-r ${mod.iconGradient} opacity-40`}
                />

                <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${mod.iconGradient} shadow-lg ${mod.iconGlow}`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${mod.badgeColor}`}
                    >
                      <span className={`w-1 h-1 rounded-full bg-current animate-pulse`} />
                      {mod.badge}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="space-y-2 flex-1">
                    <h3 className="text-base font-semibold text-[#e2e8f0]">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5">
                    {mod.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-xs text-[#94a3b8]"
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${mod.accentColor.replace("text-", "bg-")}`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={mod.href}
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    Acessar módulo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center justify-between pt-6 pb-2 border-t border-white/5 text-xs text-[#2d3d50]"
      >
        <span>
          {APP_NAME} v{APP_VERSION} — MVP
        </span>
        <span>Powered by Anthropic Claude • Lei 14.133/2021</span>
      </motion.footer>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ChevronDown, MapPin, Zap } from "lucide-react";
import { ARCHIVE_MODE, EVENT, FACTIONS } from "@/data/event";
import XhsLink from "./XhsLink";

export default function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      {/* 静态径向光斑 + 网格地板（无滤镜、无动画，渲染一次） */}
      <div className="cyber-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-1/4 top-0 h-[60vh] w-[80vw] bg-[radial-gradient(ellipse_at_center,rgba(181,23,158,0.22),transparent_62%)]" />
      <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[60vh] w-[80vw] bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.14),transparent_62%)]" />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 font-mono text-[11px] tracking-[0.4em] text-neon/80 md:text-xs"
      >
        {ARCHIVE_MODE
          ? "// ARCHIVED · 活动已于 7.11 举行"
          : "// SYS.BOOT COMPLETE — MIHOYO CREW NETWORK"}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glitch text-center text-[clamp(3.8rem,16vw,9rem)] font-black leading-none tracking-tight"
        data-text="BW 2026"
      >
        <span className="bg-gradient-to-br from-neon via-slate-100 to-cyber bg-clip-text text-transparent">
          BW 2026
        </span>
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-2 text-center text-[clamp(1.6rem,7vw,3.4rem)] font-black tracking-[0.2em] text-slate-100"
      >
        MIHOYO <span className="text-cyber text-glow">剧组</span>
      </motion.h2>

      {/* 核心情报：超大并排 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="mt-10 flex flex-col items-stretch gap-3 md:flex-row md:gap-4"
      >
        <div
          className="neon-frame clip-corner flex items-center justify-center gap-3 border border-alert/60 bg-slate-900/85 px-7 py-4"
          style={{ "--glow": "#ff003c" } as React.CSSProperties}
        >
          <Zap className="shrink-0 text-alert" size={22} />
          <span className="text-xl font-black tracking-widest text-alert text-glow md:text-2xl">
            {EVENT.dDayLabel}
          </span>
        </div>
        <div
          className="neon-frame clip-corner flex items-center justify-center gap-3 border border-neon/60 bg-slate-900/85 px-7 py-4"
          style={{ "--glow": "#00f5d4" } as React.CSSProperties}
        >
          <MapPin className="shrink-0 text-neon" size={22} />
          <span className="text-xl font-black tracking-widest text-neon md:text-2xl">
            {EVENT.venue}
          </span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center font-mono text-xs tracking-[0.25em] text-slate-400 md:text-sm"
      >
        {EVENT.dateRange} · {FACTIONS.map((f) => f.name).join(" × ")}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-5 font-mono text-[11px] tracking-[0.3em] text-slate-500"
      >
        本站设计 · 制作　<span className="text-neon/90">{EVENT.author}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-3"
      >
        <XhsLink hint />
      </motion.div>

      <a
        href={ARCHIVE_MODE ? "#recap" : "#intel"}
        aria-label={ARCHIVE_MODE ? "向下查看数据回顾" : "向下滚动"}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-neon"
      >
        <ChevronDown size={30} className="animate-bounce-down" />
      </a>
    </section>
  );
}

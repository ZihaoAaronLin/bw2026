"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ARCHIVE_MODE, DISCLAIMERS, EVENT, FACTIONS, type Faction } from "@/data/event";
import { needReconfirm } from "@/lib/visit";
import AiChat from "@/components/AiChat";
import BootOverlay from "@/components/BootOverlay";
import FieldIntel from "@/components/FieldIntel";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import IntelBrief from "@/components/IntelBrief";
import { MusicDock, MusicProvider } from "@/components/MusicPlayer";
import PosterGenerator from "@/components/PosterGenerator";
import RadarMap from "@/components/RadarMap";
import SurvivalModal from "@/components/SurvivalModal";
import TerminalUnlock from "@/components/TerminalUnlock";
import WallSay from "@/components/WallSay";
import XhsLink from "@/components/XhsLink";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [faction, setFaction] = useState<Faction | null>(null);
  // 归档模式不再弹生存红线：直接视为已确认
  const [survival, setSurvival] = useState<"pending" | "open" | "done">(
    ARCHIVE_MODE ? "done" : "pending",
  );

  // 仪式感优先：每次进站都从开机画面开始，不恢复上次滚动位置
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // 注水：生存红线确认在 3 次访问 / 15 分钟内则跳过强制门，否则重弹并清空旧勾选。
  // 阵营选择走会话级（sessionStorage）：本次访问内记得（海报↔雷达联动稳），
  // 关标签页即忘，不会跨天还记着上次选的。
  useEffect(() => {
    try {
      if (ARCHIVE_MODE) {
        /* 归档：不弹生存红线 */
      } else if (needReconfirm("bw-survival-done-at")) {
        localStorage.removeItem("bw-survival-checks"); // 强制重勾：清空旧勾选
      } else {
        setSurvival("done");
      }
      const fid = sessionStorage.getItem("bw-faction");
      if (fid) {
        const f = FACTIONS.find((x) => x.id === fid);
        if (f) setFaction(f);
      }
    } catch {
      /* 隐私模式静默降级 */
    }
  }, []);

  // 阵营选择：仅本次会话持久化
  const selectFaction = (f: Faction) => {
    setFaction(f);
    try {
      sessionStorage.setItem("bw-faction", f.id);
    } catch {
      /* 隐私模式静默降级 */
    }
  };

  // 开机前锁滚动
  useEffect(() => {
    document.documentElement.style.overflow = booted ? "" : "hidden";
    if (!booted) window.scrollTo(0, 0);
  }, [booted]);

  // 滚过首屏一半 → 触发生存红线确认（仅一次）
  useEffect(() => {
    if (!booted || survival !== "pending") return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.45) setSurvival("open");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [booted, survival]);

  return (
    <MusicProvider>
      <div className="scanlines" aria-hidden />

      <AnimatePresence>
        {!booted && <BootOverlay onDone={() => setBooted(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {survival === "open" && (
          <SurvivalModal onConfirm={() => setSurvival("done")} />
        )}
      </AnimatePresence>

      <main>
        <Hero />
        <IntelBrief />
        <TerminalUnlock />
        <PosterGenerator faction={faction} onSelect={selectFaction} />
        <RadarMap faction={faction} />
        <FieldIntel />
        <Gallery />
        <WallSay />
      </main>

      <footer className="border-t border-slate-800 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs tracking-[0.3em] text-neon/60">
            BW2026 // MIHOYO CREW · TERMINAL
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tracking-wider text-slate-400">
              本站设计 · 制作 <span className="text-neon/90">{EVENT.author}</span>
            </span>
            <XhsLink />
          </div>
          <ul className="mt-4 space-y-1 text-[11px] leading-5 text-slate-600">
            {DISCLAIMERS.map((d) => (
              <li key={d}>· {d}</li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-slate-700">
            本站为剧组爱好者企划页面，与 BiliBili World 及 miHoYo 官方无关。
          </p>
        </div>
      </footer>

      {booted && (
        <>
          <AiChat />
          <MusicDock />
        </>
      )}
    </MusicProvider>
  );
}

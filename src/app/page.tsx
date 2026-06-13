"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DISCLAIMERS, EVENT, type Faction } from "@/data/event";
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

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [faction, setFaction] = useState<Faction | null>(null);
  const [survival, setSurvival] = useState<"pending" | "open" | "done">("pending");

  // 仪式感优先：每次进站都从开机画面开始，不恢复上次滚动位置
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

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
        <PosterGenerator faction={faction} onSelect={setFaction} />
        <RadarMap faction={faction} />
        <FieldIntel />
        <Gallery />
      </main>

      <footer className="border-t border-slate-800 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs tracking-[0.3em] text-neon/60">
            BW2026 // MIHOYO CREW · TERMINAL
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            主团长：{EVENT.organizers.join(" · ")}　协助：{EVENT.assistant}　{EVENT.credit}
          </p>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Power, VolumeX } from "lucide-react";
import { useMusic } from "./MusicPlayer";

const BOOT_LINES = [
  "> LINK START ...",
  "> 接入米哈游剧组情报网络 ............ OK",
  "> 解码 7.11 行程情报 ................ OK",
  "> 授权等级：访客 / GUEST",
  "> WELCOME TO BW2026 TERMINAL",
];

/** 全屏开机引导：点击即用户手势，同步解锁音频后播放开机序列 */
export default function BootOverlay({ onDone }: { onDone: () => void }) {
  const { start } = useMusic();
  const [lines, setLines] = useState<string[]>([]);
  const [booting, setBooting] = useState(false);
  const doneRef = useRef(false);

  // 开机序列：逐行打出，然后交还主页面
  useEffect(() => {
    if (!booting) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setLines(BOOT_LINES.slice(0, i));
      if (i >= BOOT_LINES.length) {
        clearInterval(timer);
        setTimeout(() => {
          if (!doneRef.current) {
            doneRef.current = true;
            onDone();
          }
        }, 450);
      }
    }, 260);
    return () => clearInterval(timer);
  }, [booting, onDone]);

  const boot = (withSound: boolean) => {
    if (booting) return;
    if (withSound) start(); // 必须与点击同栈，iOS 才放行
    setBooting(true);
  };

  return (
    <motion.div
      className="cyber-grid fixed inset-0 z-[80] flex flex-col items-center justify-center bg-slate-950 px-6"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(181,23,158,0.18),transparent_65%)]" />

      {!booting ? (
        <>
          <p className="mb-3 font-mono text-xs tracking-[0.4em] text-neon/70">
            MIHOYO CREW · TERMINAL
          </p>
          <h1 className="mb-10 text-center text-3xl font-black tracking-widest text-slate-100 md:text-4xl">
            BW<span className="text-cyber">2026</span> 指“北”
          </h1>

          <button
            onClick={() => boot(true)}
            className="neon-frame clip-corner flex items-center gap-3 border border-neon/60 bg-slate-900/80 px-10 py-5 font-mono text-lg tracking-[0.3em] text-neon"
            style={{ "--glow": "#00f5d4" } as React.CSSProperties}
          >
            <Power size={22} className="animate-flicker" />
            SYSTEM&nbsp;BOOT
          </button>
          <p className="mt-3 text-[10px] tracking-widest text-slate-500">
            接入系统 · 含 BGM
          </p>

          <button
            onClick={() => boot(false)}
            className="mt-14 flex items-center gap-1.5 font-mono text-xs tracking-widest text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
          >
            <VolumeX size={13} /> 静音潜入
          </button>
        </>
      ) : (
        <div className="w-full max-w-md font-mono text-sm leading-7 text-neon terminal-text">
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <span className="animate-blink">▍</span>
        </div>
      )}
    </motion.div>
  );
}

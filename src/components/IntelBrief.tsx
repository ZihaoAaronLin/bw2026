"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Flag, MapPin, Mic2, TrainFront } from "lucide-react";
import {
  CREW_STATS,
  EVENT,
  FACTIONS,
  TICKETS,
  TIMELINE,
} from "@/data/event";
import SectionHeader from "./SectionHeader";

function useCountdown(target: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return; // 待定（无目标时间）：不起定时器
    const t = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (left === null) return null; // SSR/首帧占位，避免水合不一致
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return { d, h, m, s, done: left <= 0 };
}

function CountdownCard({
  label,
  target,
  accent,
  expiredLabel,
  tbdLabel,
}: {
  label: string;
  target: string;
  accent: string;
  /** 倒计时归零后展示的文案，避免永远停在 0 */
  expiredLabel: string;
  /** 目标时间未定（target 为空）时展示的文案，如「待官宣」 */
  tbdLabel?: string;
}) {
  const c = useCountdown(target);
  const tbd = !target;
  return (
    <div
      className="neon-frame clip-corner flex-1 border bg-slate-900/85 p-4"
      style={{ "--glow": accent, borderColor: `${accent}66` } as React.CSSProperties}
    >
      <p className="font-mono text-[10px] tracking-[0.3em] text-slate-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-1 font-mono" style={{ color: accent }}>
        {tbd ? (
          <span className="text-2xl font-black md:text-3xl">{tbdLabel ?? "待定"}</span>
        ) : c === null ? (
          <span className="text-2xl font-black">--:--:--</span>
        ) : c.done ? (
          <span className="text-2xl font-black md:text-3xl">{expiredLabel}</span>
        ) : (
          <>
            <span className="text-4xl font-black md:text-5xl">{c.d}</span>
            <span className="mr-2 text-xs">DAYS</span>
            <span className="text-xl font-bold tabular-nums md:text-2xl">
              {String(c.h).padStart(2, "0")}:{String(c.m).padStart(2, "0")}:
              {String(c.s).padStart(2, "0")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
} as const;

export default function IntelBrief() {
  // 进度条以当前报名最多的阵营为满格，报名数更新后不会溢出
  const maxSigned = Math.max(...FACTIONS.map((f) => f.signed));
  return (
    <section id="intel" className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_01" title="核心情报" en="INTEL BRIEF" />

      {/* 双倒计时 */}
      <motion.div {...fadeUp} className="flex flex-col gap-3 md:flex-row">
        <CountdownCard label="开票 // TICKET DROP" target={TICKETS.saleStart} accent="#f4a623" expiredLabel="已开票 · 速抢！" tbdLabel="待官宣" />
        <CountdownCard label="距 7.11 开场 // OPENING DAY" target={EVENT.dDay} accent="#ff003c" expiredLabel="活动进行中！" />
      </motion.div>

      {/* 关键事实 */}
      <motion.div {...fadeUp} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { icon: CalendarDays, k: "活动日期", v: `${EVENT.dateRange}（剧组活动日 7.11）` },
          { icon: MapPin, k: "地点", v: `${EVENT.venue} · ${EVENT.venueAddress}` },
          { icon: Flag, k: "场内集合", v: EVENT.rally },
          { icon: TrainFront, k: "地铁", v: EVENT.metro },
        ].map(({ icon: Icon, k, v }) => (
          <div
            key={k}
            className="clip-corner-sm flex items-start gap-3 border border-slate-700/70 bg-slate-900/80 p-4"
          >
            <Icon size={18} className="mt-0.5 shrink-0 text-neon" />
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">{k}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-100">{v}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* 7.11 时间轴 */}
      <motion.div {...fadeUp} className="mt-10">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-neon/70">
          {"// 7.11 当日流程（预）—— 时间掐死，不等任何人"}
        </p>
        <ol className="relative ml-2 space-y-5 border-l border-neon/30 pl-6">
          {TIMELINE.map((t, i) => (
            <motion.li
              key={t.time}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_8px_#00f5d4]" />
              <p className="font-mono text-lg font-black text-neon">
                {t.time}
                <span className="ml-3 text-base text-slate-100">{t.label}</span>
              </p>
              <p className="text-xs leading-5 text-slate-400">{t.desc}</p>
              <p className="mt-0.5 font-mono text-[10px] leading-4 tracking-wider text-neon/45">
                {t.detail}
              </p>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      {/* 票务 */}
      <motion.div {...fadeUp} className="mt-12">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-gold/80">
          {"// 票务情报 — 单 UID 限购 4 张 · 实名绑定"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {TICKETS.prices.map((p) => (
            <div
              key={p.name}
              className="clip-corner-sm border border-gold/40 bg-slate-900/80 p-3 text-center"
            >
              <p className="text-[11px] text-slate-400">{p.name}</p>
              <p className="mt-1 font-mono text-2xl font-black text-gold">
                ¥{p.price}
              </p>
            </div>
          ))}
        </div>
        {TICKETS.rounds.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {TICKETS.rounds.map((r) => (
              <span
                key={r.name}
                className="border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono text-[11px] text-slate-300"
              >
                {r.name} · {r.time}
              </span>
            ))}
          </div>
        ) : (
          <p className="clip-corner-sm mt-3 border border-gold/40 bg-gold/5 px-3 py-2 text-[12px] leading-5 text-gold/90">
            ⏳ {TICKETS.saleNote}
          </p>
        )}
        <ul className="mt-3 space-y-1 text-[11px] leading-5 text-slate-500">
          {TICKETS.rules.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Mic2 size={12} className="text-cyber" />
          同期：{EVENT.bml}
        </p>
      </motion.div>

      {/* 报名统计 */}
      <motion.div {...fadeUp} className="mt-12">
        <p className="mb-1 font-mono text-xs tracking-[0.3em] text-cyber">
          {`// 报名统计（${CREW_STATS.asOf}）`}
        </p>
        <p className="mb-4 text-xs text-slate-500">
          报名 <span className="font-mono font-black text-slate-200">{CREW_STATS.signedTotal}</span>
          （除重 {CREW_STATS.signedUnique}）· 预计场内{" "}
          <span className="font-mono font-black text-slate-200">{CREW_STATS.expectedTotal}</span>
          （除重 {CREW_STATS.expectedUnique}）
        </p>
        <div className="space-y-3">
          {FACTIONS.map((f) => (
            <div key={f.id}>
              <div className="mb-1 flex justify-between font-mono text-[11px]">
                <span style={{ color: f.color }}>{f.name}</span>
                <span className="text-slate-400">
                  {f.signed} 报名 / 预计 {f.expected} 到场
                </span>
              </div>
              <div className="h-2 overflow-hidden bg-slate-800">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full origin-left"
                  style={{
                    width: `${(f.signed / maxSigned) * 100}%`,
                    background: `linear-gradient(90deg, ${f.colorDim}, ${f.color})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Cpu, GitCommitHorizontal, MessagesSquare } from "lucide-react";
import { ARCHIVE_RECAP, CREW_STATS, EVENT, FACTIONS } from "@/data/event";
import SectionHeader from "./SectionHeader";

/** 柱色：初音青降一档，深色底上通过亮度带与对比度校验（原色 #00f5d4 太亮） */
const BAR = "#00a892";

const fmt = (n: number) => n.toLocaleString("en-US");

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5 },
} as const;

function Tile({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="clip-corner-sm flex-1 border border-slate-700/70 bg-slate-900/80 px-4 py-3.5">
      <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-100 md:text-3xl">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

/** 漏斗步骤之间的箭头：手机竖排向下，宽屏横排向右 */
function Step() {
  return (
    <span aria-hidden className="self-center font-mono text-neon/60">
      <span className="sm:hidden">↓</span>
      <span className="hidden sm:inline">→</span>
    </span>
  );
}

export default function ArchiveRecap() {
  const R = ARCHIVE_RECAP;
  const teams = [...FACTIONS].sort((a, b) => b.signed - a.signed);
  const max = teams[0].signed;

  return (
    <section id="recap" className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader
        code="MODULE_00"
        title="活动已结束 · 数据回顾"
        en="ARCHIVE · DEBRIEF"
        sub={`${R.heldOn.replace(/-/g, ".")} · ${EVENT.venue} · 已举行`}
      />

      {/* 报名 → 预计到场 → 当天到场 */}
      <motion.div {...fadeUp}>
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-neon/70">
          {"// 从报名到到场"}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Tile
            label="报名"
            value={fmt(CREW_STATS.signedTotal)}
            unit="人次"
            sub={`去重 ${fmt(CREW_STATS.signedUnique)}`}
          />
          <Step />
          <Tile
            label="预计到场"
            value={fmt(CREW_STATS.expectedTotal)}
            unit="人"
            sub={`去重 ${fmt(CREW_STATS.expectedUnique)}`}
          />
          <Step />
          <Tile label="当天到场" value={R.attended.replace(/人$/, "").trim()} unit="人" />
        </div>
      </motion.div>

      {/* 四团报名 */}
      <motion.div {...fadeUp} className="mt-10">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-neon/70">
          {"// 四团报名（人次）"}
        </p>
        <ul className="clip-corner-sm space-y-3 border border-slate-700/70 bg-slate-900/80 p-4">
          {teams.map((f, i) => (
            <li
              key={f.id}
              title={`${f.name} · 报名 ${fmt(f.signed)} 人次`}
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 md:grid-cols-[9rem_1fr]"
            >
              <span className="truncate text-xs font-bold text-slate-300">{f.name}</span>
              <span className="flex items-center gap-2">
                <motion.span
                  aria-hidden
                  className="block h-3 rounded-r-[4px]"
                  style={{
                    width: `calc((100% - 3.5rem) * ${f.signed / max})`,
                    background: BAR,
                    transformOrigin: "left",
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                />
                <span className="font-mono text-xs text-slate-200">{fmt(f.signed)}</span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 应援墙 & 入群 */}
      <motion.div {...fadeUp} className="mt-10">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-neon/70">
          <MessagesSquare size={14} /> {"// 应援墙与入群"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Tile label="应援" value={R.wall.cheers} unit="条" />
          <Tile label="有效建议" value={R.wall.suggestions} unit="条" />
          <Tile label="新增入群申请" value={R.joinRequests} sub="站点发布后" />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">注：入群申请{R.joinRequestsNote}。</p>
      </motion.div>

      {/* 开发 */}
      <motion.div {...fadeUp} className="mt-10">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-neon/70">
          <GitCommitHorizontal size={14} /> {"// 开发记录"}
        </p>
        <div className="clip-corner-sm border border-slate-700/70 bg-slate-900/80 p-4">
          <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            {[
              { d: R.dev.repoCreated, t: "建仓" },
              { d: R.dev.domainLive, t: "正式域名上线" },
              { d: R.dev.commitsUntil, t: `累计 ${R.dev.commits} 次提交` },
            ].map((s, i) => (
              <li key={s.d} className="flex items-center gap-2 sm:flex-1">
                <span className="font-mono text-lg font-black text-slate-100">{s.d}</span>
                <span className="text-xs text-slate-300">{s.t}</span>
                {i < 2 && (
                  <span aria-hidden className="ml-auto hidden font-mono text-neon/60 sm:inline">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-400">
            <Cpu size={14} className="mt-0.5 shrink-0 text-neon/70" />
            借助 {R.dev.tools} 独立开发；AI 参谋调用 DeepSeek，花费{R.dev.aiCost}。
          </p>
        </div>
      </motion.div>

      {/* 复盘：作者补充后才显示 */}
      {R.retro.length > 0 && (
        <motion.div {...fadeUp} className="mt-10">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-neon/70">{"// 复盘"}</p>
          <ul className="space-y-3">
            {R.retro.map((r) => (
              <li
                key={r.title}
                className="clip-corner-sm border border-slate-700/70 bg-slate-900/80 p-4"
              >
                <p className="text-sm font-bold text-slate-100">{r.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">{r.body}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { CAPTAIN_NOTE, EVENT } from "@/data/event";
import SectionHeader from "./SectionHeader";

/** 逐段淡入：只动 transform / opacity，低端机友好 */
const reveal = (i: number) =>
  ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.5, delay: Math.min(i, 3) * 0.06 },
  }) as const;

/** 团长的话：归档版收尾，一封写给同行者的信 */
export default function CaptainNote() {
  const { epigraph, paragraphs, closing } = CAPTAIN_NOTE;
  return (
    <section id="captain-note" className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader
        code="MODULE_08"
        title="团长的话"
        en="FINAL TRANSMISSION"
        sub="写给每一位同行的你"
      />

      <div className="clip-corner mx-auto max-w-2xl border border-neon/30 bg-slate-900/80 px-5 py-7 md:px-10 md:py-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon/60">
          {`> INCOMING TRANSMISSION · FROM ${EVENT.author}`}
        </p>

        {/* 题记 */}
        <motion.div {...reveal(0)} className="mt-6 border-l-2 border-cyber/70 pl-4">
          {epigraph.map((l) => (
            <p key={l} className="text-sm leading-7 text-slate-400">
              {l}
            </p>
          ))}
        </motion.div>

        {/* 正文 */}
        <div className="mt-7 space-y-5">
          {paragraphs.map((p, i) => (
            <motion.p
              key={p}
              {...reveal(i)}
              className="text-[15px] leading-8 text-slate-200"
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* 收尾 */}
        <motion.div {...reveal(0)} className="mt-9 space-y-2">
          <p className="text-[15px] font-bold leading-8 text-slate-100">{closing[0]}</p>
          <p className="text-lg font-black leading-8 tracking-wider text-neon">{closing[1]}</p>
        </motion.div>

        {/* 署名不用等宽字体：mono + 字距会把「——」拆成两截 */}
        <p className="mt-8 text-right text-[15px] font-bold text-neon/90">—— {EVENT.author}</p>
      </div>
    </section>
  );
}

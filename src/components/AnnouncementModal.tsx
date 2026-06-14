"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, TriangleAlert } from "lucide-react";
import { ANNOUNCEMENT } from "@/data/event";

/** 群公告强制弹窗：开机后若有未读版本即弹出，读完点「我知道了」关闭 */
export default function AnnouncementModal({ onClose }: { onClose: () => void }) {
  // 弹窗期间锁滚动
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[92] flex items-center justify-center bg-slate-950/88 px-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="clip-corner flex max-h-[82dvh] w-full max-w-md flex-col border-2 border-cyber bg-slate-950"
      >
        {/* 标题栏 */}
        <div className="border-b border-cyber/30 px-5 pb-4 pt-5">
          <p className="font-mono text-[10px] tracking-[0.35em] text-cyber">
            {`// ${ANNOUNCEMENT.tag}`}
          </p>
          <h3 className="mt-1.5 flex items-center gap-2 text-xl font-black tracking-wide text-slate-100">
            <Megaphone size={20} className="text-cyber" />
            {ANNOUNCEMENT.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">{ANNOUNCEMENT.intro}</p>
        </div>

        {/* 正文（可滚动） */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {ANNOUNCEMENT.sections.map((s, i) => (
            <div key={s.h}>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-cyber">
                <span className="font-mono text-[11px] text-cyber/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.h}
              </p>
              <ul className="space-y-1">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="flex gap-2 text-[13px] leading-6 text-slate-300"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyber/70" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 重要提醒 */}
          <div className="border border-alert/50 bg-alert/10 p-3">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-alert">
              <TriangleAlert size={15} /> 重要提醒
            </p>
            <ul className="space-y-1">
              {ANNOUNCEMENT.warnings.map((w) => (
                <li key={w} className="flex gap-2 text-[13px] leading-6 text-slate-200">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-alert" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 关闭 */}
        <button
          onClick={onClose}
          className="clip-corner-sm m-5 mt-3 bg-cyber py-3.5 font-mono text-sm font-bold tracking-[0.3em] text-white transition-opacity hover:opacity-90"
        >
          ✓ 我知道了
        </button>
      </motion.div>
    </motion.div>
  );
}

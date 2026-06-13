"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HandHeart, X } from "lucide-react";
import { TIP } from "@/data/event";

/** 投喂 / 赞赏入口：页脚按钮 → 弹窗显示收款码 */
export default function TipJar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const method = TIP.methods[active];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="clip-corner-sm inline-flex items-center gap-2 border border-neon/50 bg-slate-900/70 px-4 py-2 font-mono text-xs tracking-widest text-neon transition-colors hover:bg-slate-900"
      >
        <HandHeart size={15} /> 投喂团长
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/92 px-5"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="clip-corner w-full max-w-sm border border-neon/40 bg-slate-950 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-neon">
                  <HandHeart size={15} /> 投喂 · TIP JAR
                </span>
                <button
                  aria-label="关闭"
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mb-4 text-xs leading-5 text-slate-400">{TIP.note}</p>

              {/* 方式切换 */}
              <div className="mb-3 flex gap-2">
                {TIP.methods.map((m, i) => (
                  <button
                    key={m.label}
                    onClick={() => setActive(i)}
                    className="flex-1 border px-3 py-1.5 text-xs font-bold transition-colors"
                    style={
                      i === active
                        ? { borderColor: m.color, color: m.color, background: `${m.color}1a` }
                        : { borderColor: "#334155", color: "#94a3b8" }
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* 收款码 */}
              <div className="mx-auto w-full max-w-[260px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={method.qr}
                  alt={`${method.label}收款码`}
                  className="w-full rounded-lg border-2"
                  style={{ borderColor: method.color }}
                />
              </div>

              <p className="mt-4 text-center font-mono text-[11px] tracking-wider text-neon/80">
                {TIP.thanks}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

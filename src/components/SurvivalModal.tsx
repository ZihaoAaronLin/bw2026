"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ShieldAlert, Square, SquareCheckBig } from "lucide-react";
import { SUPPLIES_NOTE, SURVIVAL } from "@/data/event";
import { usePersistentState } from "@/lib/usePersistentState";

/** 生存红线确认：全部勾选前不放行（红 → 绿）；勾选状态持久化，出行前可反复核对 */
export default function SurvivalModal({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = usePersistentState<boolean[]>(
    "bw-survival-checks",
    SURVIVAL.map(() => false),
  );
  // 长度兜底：未来增删红线项时旧数据不至于错位
  const safe = SURVIVAL.map((_, i) => checked[i] ?? false);
  const allChecked = safe.every(Boolean);

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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`clip-corner w-full max-w-md border-2 p-5 transition-colors duration-500 md:p-6 ${
          allChecked
            ? "border-neon bg-[#01231e]"
            : "border-alert bg-[#2a020c]"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <ShieldAlert
            size={28}
            className={allChecked ? "text-neon" : "animate-flicker text-alert"}
          />
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-slate-400">
              SURVIVAL_PROTOCOL // 强制确认
            </p>
            <h3
              className={`text-xl font-black tracking-wider ${
                allChecked ? "text-neon" : "text-alert"
              }`}
            >
              🚨 漫展生存确认
            </h3>
          </div>
        </div>

        <ul className="max-h-[46dvh] space-y-2.5 overflow-y-auto pr-1">
          {SURVIVAL.map((item, i) => (
            <li key={item.text}>
              <button
                className="flex w-full items-start gap-2.5 text-left"
                onClick={() =>
                  setChecked((c) => c.map((v, j) => (j === i ? !v : v)))
                }
              >
                {safe[i] ? (
                  <SquareCheckBig size={18} className="mt-0.5 shrink-0 text-neon" />
                ) : (
                  <Square size={18} className="mt-0.5 shrink-0 text-alert/80" />
                )}
                <span>
                  <span
                    className={`block text-sm font-bold ${
                      safe[i] ? "text-neon" : "text-slate-100"
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="block text-xs leading-5 text-slate-400">
                    {item.why}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 border-l-2 border-slate-600 pl-2.5 text-[11px] leading-4 text-slate-500">
          {SUPPLIES_NOTE}
        </p>

        <button
          disabled={!allChecked}
          onClick={() => {
            try {
              localStorage.setItem("bw-survival-done", "1");
            } catch {
              /* 隐私模式静默降级 */
            }
            onConfirm();
          }}
          className={`clip-corner-sm mt-5 flex w-full items-center justify-center gap-2 py-3.5 font-mono text-sm font-bold tracking-[0.25em] transition-colors duration-300 ${
            allChecked
              ? "bg-neon text-slate-950"
              : "cursor-not-allowed bg-alert/20 text-alert/70"
          }`}
        >
          <Check size={18} />
          {allChecked ? "确认收到 · 解除警报" : `逐条勾选确认（${safe.filter(Boolean).length}/${SURVIVAL.length}）`}
        </button>
      </motion.div>
    </motion.div>
  );
}

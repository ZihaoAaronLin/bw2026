"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookHeart, X } from "lucide-react";
import { EVENT } from "@/data/event";

const XHS = "#ff2442"; // 小红书品牌红

/** 作者小红书链接；hint=true 时附一个一次性引导气泡 */
export default function XhsLink({ hint = false }: { hint?: boolean }) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!hint) return;
    try {
      if (localStorage.getItem("bw-xhs-hinted")) return;
    } catch {
      /* 隐私模式：照常显示 */
    }
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, [hint]);

  const seen = () => {
    setShowHint(false);
    try {
      localStorage.setItem("bw-xhs-hinted", "1");
    } catch {
      /* 静默降级 */
    }
  };

  return (
    <span className="relative inline-flex">
      <a
        href={EVENT.xhs}
        target="_blank"
        rel="noopener noreferrer"
        onClick={seen}
        className="clip-corner-sm inline-flex items-center gap-1.5 border px-4 py-2 font-mono text-xs tracking-widest transition-colors"
        style={{ borderColor: `${XHS}88`, color: XHS, background: `${XHS}14` }}
      >
        <BookHeart size={15} /> 小红书
      </a>

      <AnimatePresence>
        {showHint && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full left-0 z-20 mb-2 w-max max-w-[210px]"
          >
            <span
              className="clip-corner-sm block border bg-slate-900/95 px-3 py-2 text-left text-[12px] leading-4 text-slate-100"
              style={{ borderColor: `${XHS}88` }}
            >
              戳这关注作者，催更新功能 👀
            </span>
            <button
              onClick={seen}
              aria-label="关闭提示"
              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-slate-600 bg-slate-950 text-slate-400"
            >
              <X size={11} />
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

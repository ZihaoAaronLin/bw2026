"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookHeart, X } from "lucide-react";
import { EVENT } from "@/data/event";

const XHS = "#ff2442"; // 小红书品牌红

/** 作者小红书链接；hint=true 时附引导气泡（每次进站都弹，关掉只对本次有效） */
export default function XhsLink({ hint = false }: { hint?: boolean }) {
  const [showHint, setShowHint] = useState(false);

  // 每次加载延迟冒出引导气泡（不持久化「已关闭」，刷新/重进都会再弹）
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, [hint]);

  return (
    <span className="relative inline-flex">
      <a
        href={EVENT.xhs}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowHint(false)}
        className="clip-corner-sm inline-flex items-center gap-1.5 border px-4 py-2 font-mono text-xs tracking-widest transition-colors"
        style={{ borderColor: `${XHS}88`, color: XHS, background: `${XHS}14` }}
      >
        <BookHeart size={15} /> 小红书
      </a>

      <AnimatePresence>
        {showHint && (
          <motion.span
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            // 放在按钮正下方居中，避免遮住上方署名、也跟右下角 bot 气泡错开
            className="absolute left-1/2 top-full z-20 mt-2 w-max max-w-[210px] -translate-x-1/2"
          >
            {/* 指向按钮的小尾巴 */}
            <span
              className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t bg-slate-900"
              style={{ borderColor: `${XHS}88` }}
            />
            <span
              className="clip-corner-sm block border bg-slate-900/95 px-3 py-2 text-left text-[12px] leading-4 text-slate-100"
              style={{ borderColor: `${XHS}88` }}
            >
              👆 关注作者，催更新功能～
            </span>
            <button
              onClick={() => setShowHint(false)}
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

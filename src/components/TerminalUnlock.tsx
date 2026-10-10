"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Lock,
  LockOpen,
  ScrollText,
  Square,
  SquareCheckBig,
  UtensilsCrossed,
} from "lucide-react";
import { ARCHIVE_MODE, DINNER, PROTOCOLS } from "@/data/event";
import SectionHeader from "./SectionHeader";
import { usePersistentState } from "@/lib/usePersistentState";
import { markConfirmed, needReconfirm } from "@/lib/visit";

const DECRYPT_LINES = [
  "> AUTH_REQUEST :: 4/4 PROTOCOLS ACCEPTED",
  "> VERIFYING IDENTITY ............ [████████] 100%",
  "> DECRYPTING INTEL ......",
  "> ACCESS GRANTED ✓ 授权通过",
];

function Accordion({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neon/25 bg-slate-900/70">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-slate-100">
          <Icon size={16} className="text-neon" />
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-neon transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neon/15 px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TerminalUnlock() {
  const [checked, setChecked] = usePersistentState<boolean[]>(
    "bw-terminal-checks",
    PROTOCOLS.map(() => false),
  );
  // 归档模式直接展开（只读），不再要求逐条签署
  const [phase, setPhase] = useState<"locked" | "decrypting" | "open">(
    ARCHIVE_MODE ? "open" : "locked",
  );
  const [lines, setLines] = useState<string[]>([]);
  const safe = PROTOCOLS.map((_, i) => checked[i] ?? false);
  const allChecked = safe.every(Boolean);

  // 注水：上次解锁在 3 次访问 / 15 分钟内则直接展开情报；否则强制重新签署（清空旧勾选）
  useEffect(() => {
    if (ARCHIVE_MODE) return;
    if (needReconfirm("bw-terminal-unlocked-at")) {
      setChecked(PROTOCOLS.map(() => false));
    } else {
      setPhase("open");
    }
    // 只在挂载时判定一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "decrypting") return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLines(DECRYPT_LINES.slice(0, i));
      if (i >= DECRYPT_LINES.length) {
        clearInterval(id);
        setTimeout(() => {
          // 仅在用户真正完成解码时记录（注水恢复不写，避免周期被重置）
          markConfirmed("bw-terminal-unlocked-at");
          setPhase("open");
        }, 500);
      }
    }, 380);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_02" title="终端授权" en="ACCESS PROTOCOL" />

      <div
        className="neon-frame clip-corner border border-neon/40 bg-slate-900/85"
        style={{ "--glow": phase === "open" ? "#00f5d4" : "#b5179e" } as React.CSSProperties}
        data-active={phase === "open"}
      >
        {/* 终端标题栏 */}
        <div className="flex items-center justify-between border-b border-neon/20 px-4 py-2.5 font-mono text-[11px] tracking-[0.25em]">
          <span className="text-neon/80">
            root@bw2026:~$ ./unlock_intel.sh
          </span>
          {phase === "open" ? (
            <LockOpen size={14} className="text-neon" />
          ) : (
            <Lock size={14} className="text-alert" />
          )}
        </div>

        <div className="p-4 md:p-6">
          {phase !== "open" && (
            <>
              <p className="mb-4 font-mono text-xs leading-6 text-slate-400">
                检测到加密情报：聚餐详情。
              </p>
              <div className="mb-4">
                <p className="text-base font-bold tracking-[0.35em] text-slate-100">
                  行动纲领
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.3em] text-slate-500">
                  {""}
                </p>
                <p className="mt-2 font-mono text-xs text-slate-400">
                  签署以下入场协议以解锁 ↓
                </p>
              </div>
              <ul className="space-y-3">
                {PROTOCOLS.map((p, i) => (
                  <li key={p}>
                    <button
                      disabled={phase === "decrypting"}
                      onClick={() =>
                        setChecked((c) => c.map((v, j) => (j === i ? !v : v)))
                      }
                      className="flex w-full items-start gap-2.5 text-left"
                    >
                      {safe[i] ? (
                        <SquareCheckBig size={17} className="mt-0.5 shrink-0 text-neon" />
                      ) : (
                        <Square size={17} className="mt-0.5 shrink-0 text-slate-500" />
                      )}
                      <span
                        className={`text-sm leading-6 ${
                          safe[i] ? "text-neon" : "text-slate-300"
                        }`}
                      >
                        {p}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {phase === "locked" ? (
                <button
                  disabled={!allChecked}
                  onClick={() => setPhase("decrypting")}
                  className={`clip-corner-sm mt-6 w-full py-3.5 font-mono text-sm font-bold tracking-[0.3em] transition-colors ${
                    allChecked
                      ? "bg-cyber text-white hover:bg-cyber/80"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                  }`}
                >
                  {allChecked ? "▶ EXECUTE · 解密情报" : `签署协议（${safe.filter(Boolean).length}/${PROTOCOLS.length}）`}
                </button>
              ) : (
                <div className="mt-6 font-mono text-xs leading-7 text-neon terminal-text">
                  {lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                  <span className="animate-blink">▍</span>
                </div>
              )}
            </>
          )}

          {phase === "open" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="mb-4 flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em] text-neon terminal-text">
                <LockOpen size={16} /> {ARCHIVE_MODE ? "ARCHIVE · 归档只读" : "ACCESS GRANTED · 授权通过"}
              </p>

              {ARCHIVE_MODE && (
                <Accordion icon={ScrollText} title="入场协议 · 活动期需逐条签署">
                  <ul className="space-y-1.5 text-xs leading-5 text-slate-300">
                    {PROTOCOLS.map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </Accordion>
              )}

              <Accordion icon={UtensilsCrossed} title={`聚餐协议 · ${DINNER.time}`} defaultOpen>
                <ul className="space-y-1.5 text-xs leading-5 text-slate-300">
                  {DINNER.rules.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </Accordion>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

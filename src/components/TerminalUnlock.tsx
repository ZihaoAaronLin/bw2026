"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  FileText,
  Lock,
  LockOpen,
  Radio,
  Square,
  SquareCheckBig,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import {
  DINNER,
  DOCS,
  LEADERS,
  NICKNAME_RULE,
  PROTOCOLS,
  QQ_GROUPS,
} from "@/data/event";
import SectionHeader from "./SectionHeader";
import { usePersistentState } from "@/lib/usePersistentState";
import { markConfirmed, needReconfirm } from "@/lib/visit";

const DECRYPT_LINES = [
  "> AUTH_REQUEST :: 4/4 PROTOCOLS ACCEPTED",
  "> VERIFYING IDENTITY ............ [████████] 100%",
  "> DECRYPTING INTEL ......",
  "> ACCESS GRANTED ✓ 授权通过",
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label="复制"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* 旧浏览器忽略 */
        }
      }}
      className={`flex items-center gap-1 font-mono text-[10px] tracking-wider transition-colors ${
        copied ? "text-neon" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <Copy size={12} />
      {copied ? "已复制" : "复制"}
    </button>
  );
}

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
  const [phase, setPhase] = useState<"locked" | "decrypting" | "open">("locked");
  const [lines, setLines] = useState<string[]>([]);
  const safe = PROTOCOLS.map((_, i) => checked[i] ?? false);
  const allChecked = safe.every(Boolean);

  // 注水：上次解锁在 5 次访问内则直接展开情报；否则强制重新签署（清空旧勾选）
  useEffect(() => {
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
                检测到加密情报：行动群号 / 酒店拼房文档 / 指挥链 / 聚餐详情。
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
                <LockOpen size={16} /> ACCESS GRANTED · 授权通过
              </p>

              <Accordion icon={Radio} title="行动频道 · QQ 群（一开后开放）" defaultOpen>
                <ul className="space-y-2.5">
                  {QQ_GROUPS.map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">{g.name}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black tracking-wider text-neon">
                          {g.id}
                        </span>
                        <CopyBtn text={g.id} />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-l-2 border-cyber pl-2.5 text-[11px] leading-5 text-slate-400">
                  {NICKNAME_RULE}
                </p>
              </Accordion>

              <Accordion icon={UserRound} title="指挥链 · 团长直通">
                <ul className="space-y-2.5">
                  {LEADERS.map((l) => (
                    <li key={l.cn} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">
                        {l.role} · <b className="text-slate-100">{l.cn}</b>
                      </span>
                      {l.qq ? (
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-neon">{l.qq}</span>
                          <CopyBtn text={l.qq} />
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-600">QQ 待公布</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion icon={FileText} title="共享文档 · 拼房 / 搭子 / 招募">
                <ul className="space-y-2">
                  {DOCS.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs leading-6 text-slate-300 underline decoration-neon/40 underline-offset-4 hover:text-neon"
                      >
                        ↗ {d.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion icon={UtensilsCrossed} title={`聚餐协议 · ${DINNER.time}`}>
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

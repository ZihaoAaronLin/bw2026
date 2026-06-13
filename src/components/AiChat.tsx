"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, SendHorizonal, Square, X } from "lucide-react";
import { QUICK_QA } from "@/data/event";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const HELLO: Msg = {
  role: "assistant",
  content:
    "信号接通。我是零号参谋，负责 7.11 企划情报问答。\n常见问题点下方快捷指令（不耗算力，秒回）；其他问题直接输入。",
};

/** 客户端软限额：每日条数（服务端还有硬限额兜底） */
const DAILY_LIMIT = 30;
function quotaKey() {
  return `bw-chat-quota-${new Date().toISOString().slice(0, 10)}`;
}
function takeQuota(): boolean {
  try {
    const n = Number(localStorage.getItem(quotaKey()) ?? "0");
    if (n >= DAILY_LIMIT) return false;
    localStorage.setItem(quotaKey(), String(n + 1));
    return true;
  } catch {
    return true;
  }
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

  // 新访客引导气泡：没开过聊天就在 bot 上方冒个提示，延迟 2.5s 出现
  useEffect(() => {
    try {
      if (localStorage.getItem("bw-chat-opened-ever")) return;
    } catch {
      /* 隐私模式：照常显示 */
    }
    const t = setTimeout(() => setShowHint(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const openChat = () => {
    setOpen(true);
    setShowHint(false);
    try {
      localStorage.setItem("bw-chat-opened-ever", "1");
    } catch {
      /* 静默降级 */
    }
  };
  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem("bw-chat-opened-ever", "1");
    } catch {
      /* 静默降级 */
    }
  };

  const askLocal = (q: string, a: string) => {
    if (busy) return;
    setMsgs((m) => [...m, { role: "user", content: q }, { role: "assistant", content: a }]);
  };

  const askRemote = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");

    // 命中快捷问题直接本地回答
    const hit = QUICK_QA.find((x) => x.q === q);
    if (hit) {
      askLocal(hit.q, hit.a);
      return;
    }

    if (!takeQuota()) {
      setMsgs((m) => [
        ...m,
        { role: "user", content: q },
        { role: "assistant", content: "今日算力配额已耗尽（30 条/日）。快捷指令不限量，或明天再来。" },
      ]);
      return;
    }

    const history = [...msgs.filter((m) => m !== HELLO), { role: "user" as const, content: q }];
    setMsgs((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setBusy(true);

    const appendLast = (chunk: string) =>
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: copy[copy.length - 1].content + chunk,
        };
        return copy;
      });
    const setLast = (content: string) =>
      setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content }]);

    // 中断控制：用户点停止、或 40s 兜底超时，均中断本次请求
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 40000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8) }),
        signal: ctrl.signal,
      });

      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = (await res.json()) as { reply?: string; error?: string };
        setLast(data.reply ?? data.error ?? "通讯异常，请稍后重试。");
        return;
      }
      if (!res.ok || !res.body) {
        setLast("通讯异常，请稍后重试。");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendLast(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      const aborted = (e as Error)?.name === "AbortError";
      // 已有部分内容则保留，仅在空回复时给出提示
      setMsgs((m) => {
        const last = m[m.length - 1];
        if (last?.role === "assistant" && last.content) return m;
        return [
          ...m.slice(0, -1),
          {
            role: "assistant",
            content: aborted
              ? "已停止。需要的话可重新提问，或用快捷指令。"
              : "链路中断 — 请检查网络后重试，或使用快捷指令。",
          },
        ];
      });
    } finally {
      clearTimeout(timer);
      abortRef.current = null;
      setBusy(false);
    }
  };

  return (
    <>
      {/* 新访客引导气泡 */}
      <AnimatePresence>
        {showHint && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-[84px] right-4 z-50 max-w-[230px]"
          >
            <button
              onClick={openChat}
              className="clip-corner-sm block w-full border border-neon/50 bg-slate-900/95 px-3.5 py-2.5 text-left text-[13px] leading-5 text-slate-100"
            >
              <span className="font-bold text-neon">新来的？</span>
              点我，第一条「这个网站怎么用」带你逛 👇
            </button>
            <button
              onClick={dismissHint}
              aria-label="关闭提示"
              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-slate-600 bg-slate-950 text-slate-400"
            >
              <X size={11} />
            </button>
            {/* 指向 bot 的小尾巴 */}
            <span className="absolute -bottom-1 right-7 h-3 w-3 rotate-45 border-b border-r border-neon/50 bg-slate-900/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬浮入口 */}
      <button
        aria-label="AI 战术参谋"
        onClick={() => (open ? setOpen(false) : openChat())}
        className="fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyber to-neon text-slate-950 shadow-[0_0_24px_rgba(0,245,212,0.4)]"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-neon" />
        {open ? <X size={24} /> : <Bot size={26} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="clip-corner fixed bottom-20 left-3 right-3 z-50 flex h-[64dvh] flex-col border border-neon/40 bg-slate-950/97 md:left-auto md:right-6 md:h-[540px] md:w-[390px]"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between border-b border-neon/20 px-4 py-2.5">
              <span className="font-mono text-[11px] tracking-[0.25em] text-neon">
                TACTICAL_ADVISOR // 零号参谋
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-neon" />
                ONLINE
              </span>
            </div>

            {/* 消息流 */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] whitespace-pre-wrap border px-3 py-2 text-[13px] leading-6 ${
                    m.role === "user"
                      ? "ml-auto border-cyber/50 bg-cyber/10 text-slate-100"
                      : "border-neon/30 bg-slate-900/80 text-slate-200"
                  }`}
                >
                  {m.content || (
                    <span className="font-mono text-neon/70">
                      解码中<span className="animate-blink">▍</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 快捷指令 */}
            <div className="flex gap-2 overflow-x-auto border-t border-neon/15 px-3 py-2.5 [scrollbar-width:none]">
              {QUICK_QA.map((x) => (
                <button
                  key={x.q}
                  onClick={() => askLocal(x.q, x.a)}
                  className="shrink-0 border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-[11px] text-slate-300 hover:border-neon/50 hover:text-neon"
                >
                  {x.q}
                </button>
              ))}
            </div>

            {/* 输入区 */}
            <form
              className="flex gap-2 border-t border-neon/15 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                askRemote(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入企划相关问题…"
                maxLength={400}
                className="min-w-0 flex-1 border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-neon/60"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="停止生成"
                  className="grid w-11 place-items-center bg-alert text-white"
                >
                  <Square size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="发送"
                  className="grid w-11 place-items-center bg-neon text-slate-950 disabled:opacity-40"
                >
                  <SendHorizonal size={17} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Megaphone, ScrollText, Send, Sparkles, X } from "lucide-react";
import { WALL_SEED } from "@/data/event";
import type { WallMsg } from "@/lib/wall";
import SectionHeader from "./SectionHeader";

/** 同屏最多漂浮的泡泡数——低端机性能闸门，超出排队等候 */
const MAX_BUBBLES = 24;
type Kind = "cheer" | "enquiry";

interface Bubble {
  key: string;
  text: string;
  hue: number;
  lane: number; // 左偏移 %
  dur: number; // 动画时长 s
}

let bubbleSeq = 0;
const randHue = () => Math.floor(Math.random() * 360);

export default function WallSay() {
  const sectionRef = useRef<HTMLElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [configured, setConfigured] = useState(false);
  const [recent, setRecent] = useState<WallMsg[]>([]); // reduced-motion 静态展示用
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("cheer");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // 「查看全部」
  const [showAll, setShowAll] = useState(false);
  const [allList, setAllList] = useState<WallMsg[] | null>(null);
  // 本地模式下自己发过的应援（用于「查看全部」）
  const [localLog, setLocalLog] = useState<WallMsg[]>([]);

  const queue = useRef<{ text: string; hue: number }[]>([]);
  const seen = useRef<Set<string>>(new Set());

  const enqueue = useCallback((t: string, hue: number) => {
    queue.current.push({ text: t, hue });
  }, []);

  const maxLen = kind === "enquiry" ? 200 : 40;

  // 挂载即预灌几条种子，进场不冷清
  useEffect(() => {
    [...WALL_SEED]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .forEach((s) => enqueue(s, randHue()));
  }, [enqueue]);

  // 首次握手：拿 configured + 初始留言
  useEffect(() => {
    let alive = true;
    fetch("/api/wall")
      .then((r) => r.json())
      .then((d: { configured: boolean; messages?: WallMsg[] }) => {
        if (!alive) return;
        setConfigured(d.configured);
        const msgs = d.messages ?? [];
        setRecent(msgs);
        [...msgs].reverse().forEach((m) => {
          if (!seen.current.has(m.id)) {
            seen.current.add(m.id);
            enqueue(m.text, m.hue);
          }
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enqueue]);

  // reduced-motion 探测
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // 进入视口才跑动画/轮询
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 主循环：出队生成泡泡（节流，受 MAX_BUBBLES 闸门）
  useEffect(() => {
    if (reduced || !inView) return;
    const spawn = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= MAX_BUBBLES) return prev;
        const next = queue.current.shift();
        if (!next) return prev;
        bubbleSeq += 1;
        return [
          ...prev,
          {
            key: `b${bubbleSeq}`,
            text: next.text,
            hue: next.hue,
            lane: 3 + Math.random() * 44,
            dur: 12 + Math.random() * 5,
          },
        ];
      });
    }, 900);

    const seed = setInterval(() => {
      if (queue.current.length < 2) {
        enqueue(WALL_SEED[Math.floor(Math.random() * WALL_SEED.length)], randHue());
      }
    }, 1100);

    return () => {
      clearInterval(spawn);
      clearInterval(seed);
    };
  }, [reduced, inView, enqueue]);

  // 轮询新留言（仅共享模式 + 视口内）
  useEffect(() => {
    if (!configured || !inView) return;
    const poll = setInterval(() => {
      fetch("/api/wall")
        .then((r) => r.json())
        .then((d: { messages?: WallMsg[] }) => {
          const msgs = d.messages ?? [];
          setRecent(msgs);
          [...msgs].reverse().forEach((m) => {
            if (!seen.current.has(m.id)) {
              seen.current.add(m.id);
              enqueue(m.text, m.hue);
            }
          });
        })
        .catch(() => {});
    }, 4500);
    return () => clearInterval(poll);
  }, [configured, inView, enqueue]);

  const removeBubble = (key: string) =>
    setBubbles((prev) => prev.filter((b) => b.key !== key));

  const submit = async () => {
    const t = text.replace(/\s+/g, " ").trim();
    if (!t || sending) return;
    if (t.length > maxLen) {
      setNotice(`最多 ${maxLen} 字`);
      return;
    }
    setSending(true);
    setNotice(null);

    if (kind === "cheer") {
      const hue = randHue();
      queue.current.unshift({ text: t, hue }); // 乐观：自己的泡泡立刻飘
      setLocalLog((l) => [{ id: `local-${Date.now()}`, text: t, ts: Date.now(), hue }, ...l]);
    }

    if (configured) {
      try {
        const res = await fetch("/api/wall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t, kind }),
        });
        const d = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: WallMsg;
        };
        if (!res.ok) {
          setNotice(d.error ?? "发送失败，稍后再试");
        } else {
          if (d.message) seen.current.add(d.message.id);
          setNotice(kind === "enquiry" ? "已收到，感谢你的建议 / 补充 🙌" : "已飘上墙 ✨");
        }
      } catch {
        setNotice("网络中断，稍后再试");
      }
    } else {
      setNotice(
        kind === "enquiry"
          ? "已收到 🙌（本地预览模式，接入后端后才会真正提交给团长）"
          : "已飘上墙 ✨（本地预览模式）",
      );
    }
    setText("");
    setSending(false);
  };

  const openAll = async () => {
    setShowAll(true);
    setAllList(null);
    if (configured) {
      try {
        const r = await fetch("/api/wall?n=300");
        const d = (await r.json()) as { messages?: WallMsg[] };
        setAllList(d.messages ?? []);
      } catch {
        setAllList([]);
      }
    } else {
      const seedMsgs: WallMsg[] = WALL_SEED.map((t, i) => ({
        id: `seed-${i}`,
        text: t,
        ts: 0,
        hue: (i * 47) % 360,
      }));
      setAllList([...localLog, ...seedMsgs]);
    }
  };

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader
        code="MODULE_07"
        title="应援墙"
        en="HAVE YOUR SAY"
        sub={configured ? "留言实时飘上墙 · 大家都能看到" : "冒个泡 · 留下你的应援"}
      />

      <div
        className={`relative h-[440px] overflow-hidden border border-neon/25 bg-slate-950/60 ${
          inView ? "" : "wall-paused"
        }`}
      >
        {!reduced &&
          bubbles.map((b) => (
            <span
              key={b.key}
              className="wall-bubble absolute bottom-2 max-w-[66%] whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
              style={{
                left: `${b.lane}%`,
                animationDuration: `${b.dur}s`,
                color: `hsl(${b.hue} 90% 82%)`,
                borderColor: `hsl(${b.hue} 90% 65% / 0.55)`,
                background: `hsl(${b.hue} 60% 16%)`,
                textShadow: `0 0 10px hsl(${b.hue} 90% 60% / 0.5)`,
              }}
              onAnimationEnd={() => removeBubble(b.key)}
            >
              {b.text}
            </span>
          ))}

        {reduced && (
          <div className="flex h-full flex-wrap content-start gap-2 overflow-y-auto p-4">
            {(recent.length ? recent.map((m) => m.text) : [...WALL_SEED]).map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-neon/40 bg-slate-900/70 px-3 py-1 text-xs text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {!reduced && bubbles.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="font-mono text-xs tracking-[0.3em] text-slate-600">
              冒个泡，让你的应援飘起来 ↓
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-950 to-transparent" />

        {/* 查看全部 */}
        <button
          onClick={openAll}
          className="absolute right-2 top-2 z-10 flex items-center gap-1.5 border border-neon/40 bg-slate-950/80 px-2.5 py-1 font-mono text-[11px] tracking-wider text-neon hover:bg-slate-900"
        >
          <ScrollText size={13} /> 全部留言
        </button>
      </div>

      {/* 输入区 */}
      <div className="mt-4">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="clip-corner-sm flex items-center gap-2 bg-neon px-5 py-3 font-mono text-sm font-bold tracking-widest text-slate-950"
          >
            <Megaphone size={17} /> 冒个泡 · 留言 / 反馈
          </button>
        ) : (
          <div className="space-y-2.5">
            {/* 类型切换 */}
            <div className="flex gap-2">
              {(
                [
                  { k: "cheer", icon: Megaphone, label: "应援", hint: "飘上墙，大家可见" },
                  { k: "enquiry", icon: Lightbulb, label: "建议 · 补充", hint: "私发团长，不公开" },
                ] as const
              ).map(({ k, icon: Icon, label }) => (
                <button
                  key={k}
                  onClick={() => {
                    setKind(k);
                    setNotice(null);
                  }}
                  className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition-colors ${
                    kind === k
                      ? "border-neon bg-neon/15 text-neon"
                      : "border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                maxLength={maxLen}
                placeholder={
                  kind === "enquiry"
                    ? "交通经验 / 现场提示 / 任何建议（≤200 字）…"
                    : "写句应援，飘上墙（≤40 字）…"
                }
                className="min-w-0 flex-1 border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-neon/60"
              />
              <button
                onClick={submit}
                disabled={sending || !text.trim()}
                aria-label="发送"
                className="grid w-12 place-items-center bg-neon text-slate-950 disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-neon" />
                {notice ??
                  (kind === "enquiry"
                    ? `${text.length}/200 · 建议与有用信息私发团长`
                    : `${text.length}/40 · 文明应援，禁瓜禁广`)}
              </span>
              <button onClick={() => setOpen(false)} className="hover:text-slate-300">
                收起
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 全部留言弹窗 */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/92 px-4"
            onClick={() => setShowAll(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="clip-corner flex max-h-[78dvh] w-full max-w-md flex-col border border-neon/40 bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-neon/20 px-4 py-3">
                <span className="font-mono text-xs tracking-[0.25em] text-neon">
                  全部应援 {allList ? `· ${allList.length}` : ""}
                </span>
                <button
                  aria-label="关闭"
                  onClick={() => setShowAll(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {allList === null ? (
                  <p className="py-10 text-center font-mono text-xs tracking-widest text-slate-500">
                    读取中…
                  </p>
                ) : allList.length === 0 ? (
                  <p className="py-10 text-center font-mono text-xs tracking-widest text-slate-600">
                    还没有留言，来当第一个吧
                  </p>
                ) : (
                  allList.map((m) => (
                    <div
                      key={m.id}
                      className="border-l-2 px-3 py-1.5 text-sm leading-6 text-slate-200"
                      style={{ borderColor: `hsl(${m.hue} 80% 55%)` }}
                    >
                      {m.text}
                    </div>
                  ))
                )}
              </div>
              {!configured && (
                <p className="border-t border-slate-800 px-4 py-2 text-center font-mono text-[10px] tracking-wider text-slate-600">
                  本地预览模式 · 接入后端后这里显示全员留言
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

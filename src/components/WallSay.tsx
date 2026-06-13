"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircleHeart, Send, Sparkles } from "lucide-react";
import { WALL_SEED } from "@/data/event";
import type { WallMsg } from "@/lib/wall";
import SectionHeader from "./SectionHeader";

/** 同屏最多漂浮的泡泡数——低端机性能闸门，超出排队等候 */
const MAX_BUBBLES = 24;

interface Bubble {
  key: string;
  text: string;
  hue: number;
  lane: number; // 左偏移 %
  dur: number; // 动画时长 s
  seed?: boolean;
}

let bubbleSeq = 0;
const randHue = () => Math.floor(Math.random() * 360);

export default function WallSay() {
  const sectionRef = useRef<HTMLElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [configured, setConfigured] = useState(false);
  const [recent, setRecent] = useState<WallMsg[]>([]); // 静态模式 / 计数用
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const queue = useRef<Omit<Bubble, "key" | "lane" | "dur">[]>([]);
  const seen = useRef<Set<string>>(new Set());

  const enqueue = useCallback((text: string, hue: number, seed = false) => {
    queue.current.push({ text, hue, seed });
  }, []);

  // 挂载即预灌几条种子，进场不冷清
  useEffect(() => {
    const picks = [...WALL_SEED].sort(() => Math.random() - 0.5).slice(0, 6);
    picks.forEach((s) => enqueue(s, randHue(), true));
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
        // 初始留言倒序入队（旧的先飘）
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
            seed: next.seed,
          },
        ];
      });
    }, 900);

    // 队列偏空时补预设应援，保持不冷场
    const seed = setInterval(() => {
      if (queue.current.length < 2) {
        const s = WALL_SEED[Math.floor(Math.random() * WALL_SEED.length)];
        enqueue(s, randHue(), true);
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
    if (t.length > 40) {
      setNotice("最多 40 字哦");
      return;
    }
    setSending(true);
    setNotice(null);
    const hue = randHue();
    // 乐观：自己的泡泡立刻飘（插队到最前）
    queue.current.unshift({ text: t, hue });

    if (configured) {
      try {
        const res = await fetch("/api/wall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t }),
        });
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string };
          setNotice(d.error ?? "发送失败，稍后再试");
        } else {
          const d = (await res.json()) as { message?: WallMsg };
          if (d.message) seen.current.add(d.message.id); // 避免轮询重复飘
          setNotice("已飘上墙 ✨");
        }
      } catch {
        setNotice("网络中断，稍后再试");
      }
    } else {
      setNotice("已飘上墙 ✨（本地预览模式）");
    }
    setText("");
    setSending(false);
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
        {/* 泡泡层 */}
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

        {/* reduced-motion 静态降级：直接列出最近留言 */}
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

        {/* 引导文案（无泡泡时） */}
        {!reduced && bubbles.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="font-mono text-xs tracking-[0.3em] text-slate-600">
              冒个泡，让你的应援飘起来 ↓
            </p>
          </div>
        )}

        {/* 顶部渐隐，泡泡飘到顶自然消失 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-950 to-transparent" />
      </div>

      {/* 输入区 */}
      <div className="mt-4">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="clip-corner-sm flex items-center gap-2 bg-neon px-5 py-3 font-mono text-sm font-bold tracking-widest text-slate-950"
          >
            <MessageCircleHeart size={17} /> 冒个泡 · 留下应援
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                maxLength={40}
                placeholder="写句应援，飘上墙（≤40 字）…"
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
                {notice ?? `${text.length}/40 · 文明应援，禁瓜禁广`}
              </span>
              <button onClick={() => setOpen(false)} className="hover:text-slate-300">
                收起
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

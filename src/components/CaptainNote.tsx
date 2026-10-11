"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { CAPTAIN_NOTE, EVENT } from "@/data/event";

/** 深夜蓝：静态径向渐变，只绘制一次 */
const NIGHT = "radial-gradient(120% 75% at 50% 18%, #18305c 0%, #0f1d3a 55%, #091327 100%)";
/** 书法字体只含中文和标点；信里的西文（如 BW）退回站点的 Geist，避免毛笔字体的怪异字母 */
const BRUSH = "var(--font-brush), var(--font-geist-sans), sans-serif";

/** 打字节奏：普通字快，标点处停一下，读起来像在写 */
function pauseAfter(c: string) {
  if ("。！？".includes(c)) return 320;
  if ("，、：；—".includes(c)) return 150;
  return 34;
}

/**
 * 逐字打出的段落：底层隐形全文占位（换行与最终一致，打字时页面不跳），
 * 上层空 span 由页面的打字引擎逐字写入；读屏软件读 sr-only 的全文。
 */
function Typed({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`relative ${className}`}>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden data-type={text} />
      <span className="sr-only">{text}</span>
    </p>
  );
}

/**
 * 回忆录的一页。翻到这一页时按顺序播放：书法图「写出来」→ 逐字打字 → 署名淡入。
 * 只改文本节点和 class，不触发 React 重渲染；每页只播一次，点一下直接显示全部。
 */
function LetterPage({ paragraphs, index, total }: { paragraphs: number[]; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const first = index === 0;
  const last = index === total - 1;
  const { epigraph, closing, art } = CAPTAIN_NOTE;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-type],[data-art],[data-fade]")];
    const cursor = document.createElement("span");
    cursor.className = "animate-blink";
    cursor.style.cssText =
      "display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-0.12em;background:currentColor";
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      for (const el of steps) {
        if (el.dataset.type !== undefined) el.textContent = el.dataset.type;
        if (el.dataset.art !== undefined) el.classList.add("brush-done");
        if (el.dataset.fade !== undefined) el.style.opacity = "1";
      }
      cursor.remove();
    };

    const run = (i: number) => {
      if (cancelled) return;
      if (i >= steps.length) {
        timer = setTimeout(() => cursor.remove(), 1600);
        return;
      }
      const el = steps[i];
      if (el.dataset.art !== undefined) {
        el.classList.add("brush-go");
        timer = setTimeout(() => run(i + 1), 1100);
        return;
      }
      if (el.dataset.fade !== undefined) {
        el.style.opacity = "1";
        timer = setTimeout(() => run(i + 1), 400);
        return;
      }
      const full = el.dataset.type ?? "";
      const node = document.createTextNode("");
      el.replaceChildren(node, cursor);
      let n = 0;
      const tick = () => {
        if (cancelled) return;
        n += 1;
        node.data = full.slice(0, n);
        if (n >= full.length) {
          timer = setTimeout(() => run(i + 1), 260);
          return;
        }
        timer = setTimeout(tick, pauseAfter(full[n - 1]));
      };
      tick();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => run(0), 250);
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    root.addEventListener("click", finish);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      io.disconnect();
      root.removeEventListener("click", finish);
    };
  }, []);

  return (
    <section
      ref={ref}
      id={first ? "captain-note" : undefined}
      className="story-page relative flex flex-col justify-center px-6 py-16 [@media(max-height:700px)]:py-8"
      style={{ background: NIGHT }}
    >
      <div className="mx-auto w-full max-w-md" style={{ fontFamily: BRUSH, color: "#eef2f7" }}>
        <p className="mb-7 font-mono text-[10px] tracking-[0.3em] text-slate-400">
          {`// 团长的话 · ${index + 1}/${total}`}
        </p>

        {first && (
          <>
            <Image
              data-art=""
              src={art.title.src}
              width={art.title.w}
              height={art.title.h}
              alt={art.title.alt}
              loading="eager"
              className="brush-reveal mb-7 h-auto w-[72%] max-w-[300px]"
            />
            <div className="mb-7 border-l border-white/25 pl-4 text-[18px] leading-8 text-slate-300">
              {epigraph.map((l) => (
                <Typed key={l} text={l} />
              ))}
            </div>
          </>
        )}

        <div className="space-y-5 text-[21px] leading-[1.85]">
          {paragraphs.map((i) => (
            <Typed key={i} text={CAPTAIN_NOTE.paragraphs[i]} />
          ))}
        </div>

        {last && (
          <div className="mt-7">
            <Typed text={closing[0]} className="text-[22px] leading-[1.85]" />
            <Typed text={closing[1]} className="mt-5 text-[21px] leading-[1.85]" />
            <Image
              data-art=""
              src={art.closing.src}
              width={art.closing.w}
              height={art.closing.h}
              alt={art.closing.alt}
              loading="eager"
              className="brush-reveal mt-1 h-auto w-[92%] max-w-[380px]"
            />
            <p
              data-fade=""
              className="mt-6 text-right text-[22px] opacity-0 transition-opacity duration-700"
            >
              —— {EVENT.author}
            </p>
          </div>
        )}
      </div>

      {!last && (
        <ChevronDown
          aria-hidden
          size={26}
          className="animate-bounce-down absolute bottom-5 left-1/2 -translate-x-1/2 text-white/35"
        />
      )}
    </section>
  );
}

/** 团长的话：回忆录第二章，紧跟首屏；按 CAPTAIN_NOTE.pages 分成几页整页翻 */
export default function CaptainNote() {
  const { pages } = CAPTAIN_NOTE;
  return (
    <>
      {pages.map((p, i) => (
        <LetterPage key={i} paragraphs={p} index={i} total={pages.length} />
      ))}
    </>
  );
}

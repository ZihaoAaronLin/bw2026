"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { X } from "lucide-react";
import { FACTIONS, PHOTOS, PHOTO_NOTE, type Photo } from "@/data/event";
import SectionHeader from "./SectionHeader";

function factionName(id?: string) {
  return FACTIONS.find((f) => f.id === id)?.name ?? "";
}

/**
 * 三行错缝照片墙，整面墙一个 drag 面：
 * - 拖拽 = Framer Motion 物理引擎（惯性滑行 + 边缘橡皮筋），transform 合成器渲染
 * - 进入视口自动巡航到尾再返程；抓墙 / 碰滑块即接管，离开视口解除，
 *   每次滑回该区域都会重新自动巡航
 * - 滑块与墙体位置双向同步，跳转走弹簧不瞬移
 */
const ROWS = 3;
/** 行错缝（砖墙缝）：第 2 行半张、第 3 行四分之一张 */
const ROW_PAD = ["", "pl-[96px] md:pl-[124px]", "pl-[44px] md:pl-[58px]"];
const CRUISE_SPEED = 130; // px/s

export default function Gallery() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);
  const cruiseRef = useRef<ReturnType<typeof animate> | null>(null);
  const userTookOver = useRef(false);

  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const inView = useInView(viewportRef, { amount: 0.35 });
  const reduced = useReducedMotion();

  // 照片不足一面墙时循环铺满（同一张可出现多次），保证墙在桌面端
  // 也比视口宽——否则没有可滑动量，巡航和滑块都没戏唱
  const MIN_CARDS = ROWS * 6;
  const wall =
    PHOTOS.length === 0
      ? []
      : Array.from({ length: Math.max(PHOTOS.length, MIN_CARDS) }, (_, i) => ({
          photo: PHOTOS[i % PHOTOS.length],
          key: `${i}-${PHOTOS[i % PHOTOS.length].src}`,
        }));
  const rows = Array.from({ length: ROWS }, (_, r) =>
    wall.filter((_, i) => i % ROWS === r),
  );

  // 测量可拖动距离（窗口变化 / 图片数量变化时自动重算）
  useEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      const v = viewportRef.current;
      if (!t || !v) return;
      setMaxDrag(Math.max(0, t.offsetWidth - v.offsetWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  // 墙体位置 → 滑块/读数（直写 DOM，不触发 React 重渲染）
  useMotionValueEvent(x, "change", (v) => {
    const p = maxDrag > 0 ? Math.min(1, Math.max(0, -v / maxDrag)) : 0;
    if (sliderRef.current) sliderRef.current.value = String(Math.round(p * 1000));
    if (pctRef.current)
      pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
  });

  const stopCruise = () => {
    cruiseRef.current?.stop();
    cruiseRef.current = null;
  };
  const takeOver = () => {
    userTookOver.current = true;
    stopCruise();
  };

  // 进入视口自动巡航（去程到尾 + 返程回头）；离开视口即停并解除接管，
  // 下次滑回来照样自动巡航——不论上次有没有手动操作过
  useEffect(() => {
    if (!inView) {
      stopCruise();
      userTookOver.current = false;
      return;
    }
    if (reduced || userTookOver.current || maxDrag <= 0 || cruiseRef.current) return;
    const dur = Math.min(18, Math.max(6, maxDrag / CRUISE_SPEED));
    cruiseRef.current = animate(x, -maxDrag, {
      duration: dur,
      ease: "easeInOut",
      onComplete: () => {
        cruiseRef.current = animate(x, 0, {
          duration: dur,
          ease: "easeInOut",
          onComplete: () => {
            cruiseRef.current = null;
          },
        });
      },
    });
    return stopCruise;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, maxDrag, reduced]);

  // 滑块 → 墙体：弹簧滑过去，不瞬移
  const scrub = (v: number) => {
    takeOver();
    animate(x, -(v / 1000) * maxDrag, { type: "spring", stiffness: 170, damping: 26 });
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_06" title="影像档案馆" en="PHOTO ARCHIVE" />

      {PHOTOS.length === 0 ? (
        <p className="py-12 text-center font-mono text-sm tracking-[0.3em] text-slate-600">
          NO_DATA · 等待影像注入
        </p>
      ) : (
        <>
          <div ref={viewportRef} className="relative -mx-4 overflow-hidden">
            <motion.div
              ref={trackRef}
              drag="x"
              dragConstraints={{ left: -maxDrag, right: 0 }}
              dragElastic={0.12}
              dragTransition={{ power: 0.32, timeConstant: 340, bounceStiffness: 300, bounceDamping: 32 }}
              onDragStart={takeOver}
              style={{ x, touchAction: "pan-y" }}
              className="w-max cursor-grab space-y-3 px-4 will-change-transform active:cursor-grabbing"
            >
              {rows.map((row, ri) => (
                <div key={ri} className={`flex gap-3 ${ROW_PAD[ri]}`}>
                  {row.map(({ photo: p, key }) => (
                    <motion.button
                      key={key}
                      onTap={() => setLightbox(p)}
                      className="neon-frame group relative h-[104px] w-[164px] shrink-0 overflow-hidden border border-slate-700/60 bg-slate-900 md:h-[136px] md:w-[216px]"
                      style={{ "--glow": "#b5179e" } as React.CSSProperties}
                    >
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        draggable={false}
                        unoptimized={p.src.endsWith(".svg")}
                        className="pointer-events-none object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 164px, 216px"
                      />
                      <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-1.5 pb-1 pt-4 text-left font-mono text-[9px] tracking-wider text-slate-300">
                        {p.factionId ? `${p.year} · ${factionName(p.factionId)}` : p.alt}
                      </span>
                    </motion.button>
                  ))}
                </div>
              ))}
            </motion.div>
            {/* 两侧渐隐 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent" />
          </div>

          {/* 手动检索滑块：与墙体双向同步；墙比视口窄（无可滑动量）时整行隐藏 */}
          {maxDrag > 0 && (
          <div className="mt-4">
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={1000}
              defaultValue={0}
              aria-label="相册检索"
              onPointerDown={takeOver}
              onChange={(e) => scrub(Number(e.target.value))}
              className="w-full cursor-pointer accent-neon"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] tracking-[0.25em] text-slate-600">
              <span>MANUAL_SCRUB // 抓墙拖动或拖我检索</span>
              <span ref={pctRef}>000%</span>
            </div>
          </div>
          )}
        </>
      )}

      <p className="mt-6 border-l-2 border-slate-700 pl-3 text-[11px] leading-5 text-slate-500">
        {PHOTO_NOTE}
      </p>

      {/* 灯箱 */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-slate-950/92 px-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.alt}
                width={lightbox.w}
                height={lightbox.h}
                unoptimized={lightbox.src.endsWith(".svg")}
                className="max-h-[78dvh] w-auto border border-cyber/50"
              />
            </motion.div>
            <p className="mt-3 font-mono text-xs tracking-widest text-slate-400">
              {lightbox.alt} · {lightbox.year}
            </p>
            <button
              aria-label="关闭"
              onClick={() => setLightbox(null)}
              className="mt-3 grid h-10 w-10 place-items-center border border-slate-600 text-slate-300"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

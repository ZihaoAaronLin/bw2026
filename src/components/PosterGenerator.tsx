"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toBlob } from "html-to-image";
import { Download, ImageDown, Loader2, Share2, X } from "lucide-react";
import {
  CHORUS_NOTE,
  EVENT,
  FACTIONS,
  FINALE_SONG,
  TIMELINE,
  type Faction,
} from "@/data/event";
import SectionHeader from "./SectionHeader";

/**
 * 身份卡只用「导出安全」样式：实色/线性渐变、无 backdrop-filter、
 * 无 mix-blend-mode、颜色全部内联 hex —— 屏幕所见即导出所得。
 */
function AgentCard({
  faction,
  cardRef,
}: {
  faction: Faction;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className="mx-auto w-full max-w-[360px] select-none"
      style={{
        background: `linear-gradient(165deg, #0a0118 0%, ${faction.colorDim} 55%, #050d14 100%)`,
        border: `1.5px solid ${faction.color}`,
        boxShadow: `0 0 0 1px #0a0118`,
        color: "#e2e8f0",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        padding: "20px 18px",
      }}
    >
      {/* 头部 */}
      <div
        className="flex items-center justify-between pb-2.5"
        style={{ borderBottom: `1px dashed ${faction.color}88` }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "#94a3b8" }}>
          BW2026 // MIHOYO CREW
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#0a0118",
            background: faction.color,
            padding: "2px 8px",
          }}
        >
          {faction.group} 组
        </span>
      </div>

      {/* 阵营 */}
      <p style={{ marginTop: 16, fontSize: 10, letterSpacing: "0.35em", color: faction.color }}>
        AGENT PASS · 身份卡
      </p>
      <h3 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.15, marginTop: 4, color: "#f8fafc" }}>
        {faction.name}
      </h3>
      <p style={{ fontSize: 11, letterSpacing: "0.18em", color: faction.color, marginTop: 2 }}>
        {faction.en}
      </p>
      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.6,
          color: "#f1f5f9",
          borderLeft: `3px solid ${faction.color}`,
          paddingLeft: 10,
        }}
      >
        “{faction.slogan}”
      </p>

      {/* 时间轴 */}
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#94a3b8" }}>
          OP_TIMELINE · 7.11（预）
        </p>
        <div style={{ marginTop: 6 }}>
          {TIMELINE.map((t) => (
            <div
              key={t.time}
              style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: "24px" }}
            >
              <span style={{ color: faction.color, fontWeight: 800, width: 46 }}>{t.time}</span>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 路线 */}
      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#94a3b8" }}>
          ROUTE · {faction.routeNote}
        </p>
        <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.7, color: faction.color, fontWeight: 700 }}>
          {faction.route.join(" → ")}
        </p>
      </div>

      {/* 关键信息 */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px dashed ${faction.color}88`,
          fontSize: 11,
          lineHeight: 1.9,
          color: "#cbd5e1",
        }}
      >
        <p>
          集合点：<b style={{ color: "#f8fafc" }}>{EVENT.rally}</b>
        </p>
        <p>
          团长直通：<b style={{ color: "#f8fafc" }}>{faction.leader.cn}</b>
          <span style={{ color: faction.color }}> QQ {faction.leader.qq}</span>
        </p>
        <p>
          合唱曲目：《{faction.song}》→ 终曲《{FINALE_SONG}》
        </p>
      </div>

      {/* 底部条码装饰 */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 2, height: 26, alignItems: "flex-end" }}>
          {[12, 26, 8, 20, 26, 6, 16, 26, 10, 22, 14, 26, 8, 18].map((h, i) => (
            <span
              key={i}
              style={{ width: i % 3 === 0 ? 3 : 1.5, height: h, background: i % 4 === 0 ? faction.color : "#64748b" }}
            />
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "#64748b" }}>
            2026.07.11 · {EVENT.venue}
          </p>
          <p style={{ fontSize: 9, letterSpacing: "0.25em", color: faction.color }}>
            SCAN COMPLETE ▮▮▮
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PosterGenerator({
  faction,
  onSelect,
}: {
  faction: Faction | null;
  onSelect: (f: Faction) => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [blobCache, setBlobCache] = useState<Blob | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    const node = cardRef.current;
    if (!node || !faction || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await document.fonts.ready;
      // 防黑边三件套：尺寸取整（小数宽高会让画布多出透明像素列，
      // 存成 PNG 在相册里就是黑边）、清掉 mx-auto 的计算边距（克隆
      // 渲染时会把内容挤偏）、画布底色铺卡片同色兜底
      const rect = node.getBoundingClientRect();
      const w = Math.ceil(rect.width);
      const h = Math.ceil(rect.height);
      const opts = {
        pixelRatio: 3,
        cacheBust: true,
        width: w,
        height: h,
        style: { width: `${w}px`, height: `${h}px`, margin: "0" },
        backgroundColor: "#0a0118",
      };
      await toBlob(node, opts); // 预热：规避 iOS Safari 首次渲染丢字体/图片
      const blob = await toBlob(node, opts);
      if (!blob) throw new Error("render failed");
      setBlobCache(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setErr("渲染失败——请换浏览器重试（推荐 Safari / Chrome 直接打开，不要在 QQ 内置浏览器导出）");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!blobCache || !faction) return;
    const file = new File([blobCache], `BW2026-${faction.name}-行动纲领.png`, {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "BW2026 行动纲领" });
        return;
      } catch {
        /* 用户取消则停留在预览 */
      }
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_03" title="行动纲领"
                     en="CHEAT SHEET GENERATOR" sub="(残酷天使的)" />


      {/* 阵营选择 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {FACTIONS.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            data-active={faction?.id === f.id}
            className="neon-frame clip-corner-sm border bg-slate-900/85 px-3 py-4 text-center transition-colors"
            style={
              {
                "--glow": f.color,
                borderColor: faction?.id === f.id ? f.color : "#33415588",
              } as React.CSSProperties
            }
          >
            <span
              className="block text-sm font-black tracking-wider"
              style={{ color: faction?.id === f.id ? f.color : "#cbd5e1" }}
            >
              {f.name}
            </span>
            <span className="mt-1 block font-mono text-[9px] tracking-[0.2em] text-slate-500">
              {f.group} 组 · {f.en}
            </span>
          </button>
        ))}
      </div>

      {/* 身份卡 */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {faction ? (
            <motion.div
              key={faction.id}
              initial={{ opacity: 0, rotateX: -12, y: 24 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <AgentCard faction={faction} cardRef={cardRef} />

              <div className="mx-auto mt-5 max-w-[360px]">
                <button
                  onClick={generate}
                  disabled={busy}
                  className="clip-corner flex w-full items-center justify-center gap-2.5 py-4 font-mono text-sm font-black tracking-[0.25em] text-slate-950 transition-opacity disabled:opacity-60"
                  style={{ background: faction.color }}
                >
                  {busy ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> RENDERING ...
                    </>
                  ) : (
                    <>
                      <ImageDown size={18} /> 一键导出行动纲领
                    </>
                  )}
                </button>
                {err && <p className="mt-2 text-xs leading-5 text-alert">{err}</p>}
                <p className="mt-2 text-center font-mono text-[10px] tracking-widest text-slate-500">
                  导出后请保存至相册 / 设为锁屏
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center font-mono text-sm tracking-[0.3em] text-slate-500"
            >
              ▲ 选择你的阵营，生成身份卡
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 导出预览（长按保存兜底 + 原生分享） */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-slate-950/92 px-6"
            onClick={() => setPreview(null)}
          >
            <div
              className="max-h-[72dvh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 导出的 PNG 用原生 img 直接预览（blob URL，无需优化器） */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="行动纲领海报"
                className="max-h-[72dvh] w-auto border border-neon/40"
              />
            </div>
            <p className="mt-3 font-mono text-xs tracking-widest text-neon">
              ↑ 长按图片即可保存到相册
            </p>
            <div
              className="mt-4 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {canNativeShare && (
                <button
                  onClick={share}
                  className="clip-corner-sm flex items-center gap-2 bg-neon px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-slate-950"
                >
                  <Share2 size={14} /> 分享 / 存相册
                </button>
              )}
              <a
                href={preview}
                download={`BW2026-${faction?.name ?? "行动"}-指令.png`}
                className="clip-corner-sm flex items-center gap-2 border border-neon/50 px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-neon"
              >
                <Download size={14} /> 下载 PNG
              </a>
              <button
                aria-label="关闭"
                onClick={() => setPreview(null)}
                className="grid h-9 w-9 place-items-center border border-slate-600 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-center font-mono text-[10px] leading-5 tracking-widest text-slate-600">
        {CHORUS_NOTE}
      </p>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { FACTIONS, type Faction } from "@/data/event";
import SectionHeader from "./SectionHeader";

const CX = 200;
const CY = 205;
const R = 142;

/** 四叶草场馆环形示意：3H 在正上方（分流点），顺时针排布 */
const HALLS = [
  { id: "3H", angle: 0, rally: true },
  { id: "4.1H", angle: 45, rally: true },
  { id: "5.1H", angle: 90, rally: false },
  { id: "6.1H", angle: 135, rally: false },
  { id: "7.1H", angle: 180, rally: false },
  { id: "8.1H", angle: 225, rally: false },
  { id: "1.1H", angle: 270, rally: false },
  { id: "2.1H", angle: 315, rally: false },
] as const;

function pos(deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + R * Math.sin(a), y: CY - R * Math.cos(a) };
}

const ROUTE_HALLS: Record<"A" | "B", string[]> = {
  A: ["3H", "4.1H", "5.1H"],
  B: ["4.1H", "3H", "2.1H"],
};

function routePath(group: "A" | "B") {
  const pts = ROUTE_HALLS[group].map((id) => {
    const h = HALLS.find((x) => x.id === id)!;
    return pos(h.angle);
  });
  return (
    `M ${pts[0].x} ${pts[0].y} ` +
    pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${CX} ${CY}`
  );
}

const PATH_A = routePath("A");
const PATH_B = routePath("B");

export default function RadarMap({ faction }: { faction: Faction | null }) {
  const activeGroup = faction?.group ?? null;
  const activeColor = faction?.color ?? "#00f5d4";
  const activeHalls = activeGroup ? ROUTE_HALLS[activeGroup] : [];
  const activePath = activeGroup === "A" ? PATH_A : PATH_B;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_04" title="动态雷达地图" en="TACTICAL RADAR" />

      <div
        className="neon-frame clip-corner border border-neon/30 bg-slate-900/80 p-3 md:p-6"
        style={{ "--glow": "#00f5d4" } as React.CSSProperties}
      >
        <svg
          viewBox="0 0 400 410"
          className="mx-auto block w-full max-w-[480px]"
          role="img"
          aria-label="国家会展中心游场路线示意图"
        >
          {/* 雷达环 */}
          {[70, 110, 150].map((r) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="#1e293b"
              strokeDasharray="3 6"
            />
          ))}
          {/* 十字基准线 */}
          <line x1={CX} y1={CY - 160} x2={CX} y2={CY + 160} stroke="#1e293b" strokeDasharray="2 8" />
          <line x1={CX - 160} y1={CY} x2={CX + 160} y2={CY} stroke="#1e293b" strokeDasharray="2 8" />

          {/* 扫描波束（只做 transform 旋转，合成器友好） */}
          <g
            className="animate-spin-slow"
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            <path
              d={`M ${CX} ${CY} L ${CX} ${CY - 158} A 158 158 0 0 1 ${CX + 79} ${CY - 136.8} Z`}
              fill="#00f5d4"
              opacity={0.07}
            />
            <line x1={CX} y1={CY} x2={CX} y2={CY - 158} stroke="#00f5d4" strokeWidth={1.5} opacity={0.35} />
          </g>

          {/* 两条路线的底图虚线（常显） */}
          <path d={PATH_A} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 6" opacity={0.7} />
          <path d={PATH_B} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 6" opacity={0.7} />

          {/* 选中阵营：高亮路线动画 */}
          {activeGroup && (
            <g key={faction!.id}>
              <motion.path
                d={activePath}
                fill="none"
                stroke={activeColor}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.22}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d={activePath}
                fill="none"
                stroke={activeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* 行进光点 */}
              <circle r={5} fill={activeColor}>
                <animateMotion dur="3.2s" repeatCount="indefinite" path={activePath} />
              </circle>
            </g>
          )}

          {/* 中央会合点 */}
          <circle cx={CX} cy={CY} r={40} fill="#020617" stroke="#00f5d4" strokeWidth={1.5} opacity={0.95} />
          <circle cx={CX} cy={CY} r={40} fill="none" stroke="#00f5d4" opacity={0.5}>
            <animate attributeName="r" values="40;52" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <text x={CX} y={CY - 4} textAnchor="middle" fill="#00f5d4" fontSize={13} fontWeight={900}>
            中央会合
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill="#94a3b8" fontSize={8} letterSpacing={2}>
            FINALE 大合唱
          </text>

          {/* 场馆节点 */}
          {HALLS.map((h) => {
            const p = pos(h.angle);
            const onRoute = activeHalls.includes(h.id);
            const stroke = h.rally ? "#00f5d4" : onRoute ? activeColor : "#334155";
            const fillText = h.rally ? "#00f5d4" : onRoute ? activeColor : "#94a3b8";
            return (
              <g key={h.id}>
                {h.rally && (
                  <circle cx={p.x} cy={p.y} r={8} fill="none" stroke="#00f5d4">
                    <animate attributeName="r" values="10;26" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <rect
                  x={p.x - 31}
                  y={p.y - 17}
                  width={62}
                  height={34}
                  rx={4}
                  fill="#0f172a"
                  stroke={stroke}
                  strokeWidth={onRoute || h.rally ? 2 : 1}
                />
                <text x={p.x} y={p.y + 1} textAnchor="middle" fill={fillText} fontSize={13} fontWeight={800}>
                  {h.id}
                </text>
                <text x={p.x} y={p.y + 12} textAnchor="middle" fill="#475569" fontSize={6.5} letterSpacing={1}>
                  {h.rally ? "RALLY POINT" : "HALL"}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 图例 */}
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {(["A", "B"] as const).map((g) => {
            const members = FACTIONS.filter((f) => f.group === g);
            const isActive = activeGroup === g;
            return (
              <div
                key={g}
                className="clip-corner-sm flex items-center gap-3 border px-3 py-2.5"
                style={{
                  borderColor: isActive ? activeColor : "rgb(51 65 85 / 0.53)",
                  background: isActive ? `${activeColor}14` : "transparent",
                }}
              >
                <span
                  className="font-mono text-lg font-black"
                  style={{ color: isActive ? activeColor : "#64748b" }}
                >
                  {g}
                </span>
                <div className="text-[11px] leading-4">
                  <p className="font-bold text-slate-200">
                    {members.map((f) => f.name).join(" & ")}
                  </p>
                  <p className="text-slate-500">
                    {g === "A" ? "3H → 4.1H → 5.1H → 5.1H/6.1H 过道 → 中央" : "4.1H → 3H → 2.1H → 2.1H/1.1H 过道 → 中央"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-slate-600">
          在 3H / 4.1H 馆分流 · 向中央会合大合唱 · 馆位为四叶草环形示意，非精确比例
        </p>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Backpack,
  Bus,
  Car,
  Flag,
  ThermometerSun,
  TrainFront,
} from "lucide-react";
import { FIELD_INTEL, FIELD_INTEL_NOTE, type FieldIntelIcon } from "@/data/event";
import SectionHeader from "./SectionHeader";

const ICONS: Record<FieldIntelIcon, React.ComponentType<{ size?: number; className?: string }>> = {
  metro: TrainFront,
  taxi: Car,
  bus: Bus,
  tip: Flag,
  supplies: Backpack,
  heat: ThermometerSun,
};

export default function FieldIntel() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20">
      <SectionHeader code="MODULE_05" title="落地情报" en="FIELD INTEL" sub="到场交通 · 现场实用信息" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FIELD_INTEL.map((card, i) => {
          const Icon = ICONS[card.icon];
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="neon-frame clip-corner-sm flex flex-col border border-slate-700/70 bg-slate-900/80 p-4"
              style={{ "--glow": "#00f5d4" } as React.CSSProperties}
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 text-neon" />
                <h3 className="text-sm font-bold tracking-wide text-slate-100">
                  {card.title}
                </h3>
                {card.tag && (
                  <span className="ml-auto bg-neon/15 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-neon">
                    {card.tag}
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {card.lines.map((line) => (
                  <li
                    key={line}
                    className="flex gap-1.5 text-xs leading-5 text-slate-300"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon/60" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-5 border-l-2 border-slate-700 pl-3 text-[11px] leading-5 text-slate-500">
        {FIELD_INTEL_NOTE}
      </p>
    </section>
  );
}

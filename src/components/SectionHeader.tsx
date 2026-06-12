"use client";

import { motion } from "framer-motion";

export default function SectionHeader({
  code,
  title,
  en,
  sub,
}: {
  code: string;
  title: string;
  en: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mb-8 border-l-4 border-neon pl-4"
    >
      <p className="font-mono text-[11px] tracking-[0.35em] text-neon/70">
        {`${code} // ${en}`}
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-wider text-slate-100 md:text-3xl">
        {title}
      </h2>
          {sub && (
        <p className="mt-1 font-mono text-[11px] tracking-[0.3em] text-slate-500">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

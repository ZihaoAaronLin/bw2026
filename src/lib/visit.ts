"use client";

/**
 * 访问计数：每次整页加载 +1，全站共享同一个值。
 * 用模块级缓存保证「一次加载只 +1」，且无论哪个组件的 effect 先跑，
 * 拿到的访问号都一致（避免父子 effect 执行顺序带来的不一致）。
 * 仅可在 effect / 事件回调里调用（依赖 localStorage，非 SSR 安全）。
 */
let cached: number | null = null;

export function currentVisit(): number {
  if (cached !== null) return cached;
  try {
    const v = (Number(localStorage.getItem("bw-visit-count") ?? "0") || 0) + 1;
    localStorage.setItem("bw-visit-count", String(v));
    cached = v;
  } catch {
    cached = 1; // 隐私模式：永远当作第 1 次（即每次都强制重勾，更安全）
  }
  return cached;
}

/** 距上次确认满这么多次访问，就强制重新勾选 */
export const FORCE_EVERY = 5;

/** 上次确认在第几次访问；满 FORCE_EVERY 次则需重勾 */
export function needReconfirm(doneAtKey: string): boolean {
  try {
    const doneAt = Number(localStorage.getItem(doneAtKey) ?? "0") || 0;
    if (!doneAt) return true; // 从没确认过
    return currentVisit() - doneAt >= FORCE_EVERY;
  } catch {
    return true;
  }
}

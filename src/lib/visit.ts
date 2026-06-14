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

/** 满这么多次访问就强制重新勾选 */
export const FORCE_EVERY = 3;
/** 距上次确认超过这么久也强制重新勾选（15 分钟） */
export const FORCE_AFTER_MS = 15 * 60 * 1000;

const timeKey = (atKey: string) => atKey.replace(/-at$/, "-time");

/** 记录「在第几次访问 / 什么时刻」确认的，供 needReconfirm 判断 */
export function markConfirmed(atKey: string): void {
  try {
    localStorage.setItem(atKey, String(currentVisit()));
    localStorage.setItem(timeKey(atKey), String(Date.now()));
  } catch {
    /* 隐私模式静默降级 */
  }
}

/** 需要重新强制勾选吗：满 FORCE_EVERY 次访问、或距上次确认满 FORCE_AFTER_MS，任一即触发 */
export function needReconfirm(atKey: string): boolean {
  try {
    const at = Number(localStorage.getItem(atKey) ?? "0") || 0;
    if (!at) return true; // 从没确认过
    if (currentVisit() - at >= FORCE_EVERY) return true; // 次数到了
    const t = Number(localStorage.getItem(timeKey(atKey)) ?? "0") || 0;
    if (!t || Date.now() - t >= FORCE_AFTER_MS) return true; // 时间到了
    return false;
  } catch {
    return true;
  }
}

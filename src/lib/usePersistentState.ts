"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * localStorage 持久化 state，SSR 安全：
 * 首屏永远用 initial 渲染（避免水合不一致），挂载后再从 localStorage 注水。
 *
 * hydrated 必须是 state 而非 ref：若用 ref，挂载时「写回 effect」会紧接在
 * 「注水 effect」后同步执行，此时 ref 已为 true 但 state 闭包仍是 initial，
 * 会把初始值覆盖回 localStorage。用 state 则首次提交时 hydrated 仍为 false，
 * 跳过写回，待注水后的重渲染再开始持久化。
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 有意为之：挂载后从 localStorage 注水一次（SSR 首屏必须用 initial）
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* 隐私模式 / 禁用存储时静默降级 */
    }
    setHydrated(true);
    // 只在挂载时注水一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return; // 注水前不回写，避免覆盖已存值
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* 同上 */
    }
  }, [key, state, hydrated]);

  return [state, setState, hydrated];
}

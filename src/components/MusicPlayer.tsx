"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Music2, Pause, Play, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { PLAYLIST } from "@/data/event";

/* ============ 音频核心 ============
 * iOS/安卓禁止无手势自动播放：start() 必须在用户点击的同一调用栈里同步触发。
 * BOOT 按钮的 onClick 调 start()，从此整个会话音频解锁。
 */

interface MusicCtx {
  started: boolean;
  playing: boolean;
  muted: boolean;
  trackTitle: string;
  error: string | null;
  start: () => void;
  toggle: () => void;
  next: () => void;
  toggleMute: () => void;
}

const Ctx = createContext<MusicCtx | null>(null);

export function useMusic() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}

/** 开机音效：WebAudio 合成的上行电子蜂鸣，无需任何音频文件 */
function playBootChirp() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
    [220, 440, 660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.2);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    /* 音效失败不影响主流程 */
  }
}

interface Engine {
  audio: HTMLAudioElement;
  idx: number;
  advance: () => void;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<Engine | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trackTitle, setTrackTitle] = useState(PLAYLIST[0]?.title ?? "");
  const [error, setError] = useState<string | null>(null);

  /** 懒初始化：音频元素与切歌逻辑互相引用，都收在一个普通对象里 */
  const ensureEngine = useCallback(() => {
    if (engineRef.current || PLAYLIST.length === 0) return engineRef.current;
    const audio = new Audio(PLAYLIST[0].src);
    audio.loop = PLAYLIST.length === 1;
    audio.preload = "none";
    const engine = {
      audio,
      idx: 0,
      advance() {
        if (PLAYLIST.length < 2) return;
        engine.idx = (engine.idx + 1) % PLAYLIST.length;
        const track = PLAYLIST[engine.idx];
        setTrackTitle(track.title);
        setError(null);
        audio.src = track.src;
        audio.play().catch(() => undefined);
      },
    };
    audio.addEventListener("error", () =>
      setError("BGM 文件缺失 — 把 mp3/m4a 放进 public/audio 并在 src/data/event.ts 的 PLAYLIST 登记"),
    );
    audio.addEventListener("ended", () => engine.advance());
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    engineRef.current = engine;
    return engine;
  }, []);

  const next = useCallback(() => {
    ensureEngine()?.advance();
  }, [ensureEngine]);

  /** 必须在用户手势的同一调用栈里调用 */
  const start = useCallback(() => {
    setStarted(true);
    playBootChirp();
    const a = ensureEngine()?.audio;
    a?.play().catch(() => undefined); // 文件缺失时 error 事件已给出提示
  }, [ensureEngine]);

  const toggle = useCallback(() => {
    const a = ensureEngine()?.audio;
    if (!a) return;
    if (a.paused) a.play().catch(() => undefined);
    else a.pause();
  }, [ensureEngine]);

  const toggleMute = useCallback(() => {
    const a = ensureEngine()?.audio;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }, [ensureEngine]);

  return (
    <Ctx.Provider
      value={{ started, playing, muted, trackTitle, error, start, toggle, next, toggleMute }}
    >
      {children}
    </Ctx.Provider>
  );
}

/* ============ 悬浮迷你播放器（左下角） ============ */

export function MusicDock() {
  const { started, playing, muted, trackTitle, error, toggle, next, toggleMute } = useMusic();
  const [open, setOpen] = useState(false);

  if (!started) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2">
      <button
        aria-label="音乐播放器"
        onClick={() => setOpen((v) => !v)}
        className="neon-frame relative grid h-12 w-12 place-items-center rounded-full border border-neon/50 bg-slate-900/90 text-neon"
        style={{ "--glow": "#00f5d4" } as React.CSSProperties}
      >
        <Music2
          size={20}
          className={playing ? "animate-spin-slow" : "opacity-60"}
        />
      </button>

      {open && (
        <div className="clip-corner-sm w-60 border border-neon/30 bg-slate-900/95 p-3 font-mono text-xs">
          <div className="mb-2 flex items-center justify-between text-neon/70">
            <span>AUDIO_CORE</span>
            <button aria-label="收起" onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>
          {error ? (
            <p className="mb-2 leading-relaxed text-alert/90">{error}</p>
          ) : (
            <div className="mb-2 overflow-hidden text-slate-300">
              <span className="marquee">
                {trackTitle} ♪ {trackTitle} ♪{" "}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 text-neon">
            <button aria-label={playing ? "暂停" : "播放"} onClick={toggle}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            {PLAYLIST.length > 1 && (
              <button aria-label="下一首" onClick={next}>
                <SkipForward size={18} />
              </button>
            )}
            <button aria-label={muted ? "取消静音" : "静音"} onClick={toggleMute}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

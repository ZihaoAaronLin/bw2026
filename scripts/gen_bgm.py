#!/usr/bin/env python3
"""生成内置巡航 BGM：32 秒赛博合成器循环 → public/audio/neon-protocol.m4a
用法：python3 scripts/gen_bgm.py   （需要 numpy 和 macOS 自带 afconvert）
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
BPM = 120
BAR = 60 / BPM * 4  # 2s
BARS = 16
DUR = BAR * BARS  # 32s

t = np.arange(int(SR * DUR)) / SR
mix = np.zeros_like(t)

# 和弦进行 Am - F - C - G（频率：根音 A2/F2/C3/G2 起的三和弦）
CHORDS = [
    [110.00, 130.81, 164.81],  # Am: A2 C3 E3
    [87.31, 110.00, 130.81],   # F:  F2 A2 C3
    [130.81, 164.81, 196.00],  # C:  C3 E3 G3
    [98.00, 123.47, 146.83],   # G:  G2 B2 D3
]

def saw(freq, tt):
    return 2 * ((freq * tt) % 1) - 1

# --- Pad：锯齿三和弦 + 轻微合唱失谐，低通感用幅度压低高频谐波模拟 ---
for bar in range(BARS):
    chord = CHORDS[bar % 4]
    s = slice(int(bar * BAR * SR), int((bar + 1) * BAR * SR))
    tt = t[s] - bar * BAR
    env = np.minimum(tt / 0.4, 1) * np.minimum((BAR - tt) / 0.5, 1)
    for f in chord:
        mix[s] += 0.045 * env * (saw(f, tt) + saw(f * 1.004, tt)) / 2
        mix[s] += 0.03 * env * np.sin(2 * np.pi * f * 2 * tt)

# --- 琶音：16 分音符方波，音量包络快衰减 ---
SIXTEENTH = BAR / 16
for bar in range(BARS):
    chord = CHORDS[bar % 4]
    notes = [chord[0] * 4, chord[1] * 4, chord[2] * 4, chord[1] * 8]
    for i in range(16):
        start = bar * BAR + i * SIXTEENTH
        s = slice(int(start * SR), int((start + SIXTEENTH) * SR))
        tt = t[s] - start
        f = notes[i % 4]
        env = np.exp(-tt * 22)
        mix[s] += 0.05 * env * np.sign(np.sin(2 * np.pi * f * tt))

# --- 底鼓：每拍一次的 50Hz 正弦下扫 ---
for beat in range(int(BARS * 4)):
    start = beat * BAR / 4
    s = slice(int(start * SR), int((start + 0.18) * SR))
    tt = t[s] - start
    freq = 110 * np.exp(-tt * 18) + 45
    mix[s] += 0.5 * np.exp(-tt * 16) * np.sin(2 * np.pi * freq * tt)

# --- 镲：反拍白噪声 ---
rng = np.random.default_rng(42)
for beat in range(int(BARS * 8)):
    if beat % 2 == 0:
        continue
    start = beat * BAR / 8
    n = int(0.05 * SR)
    s = slice(int(start * SR), int(start * SR) + n)
    mix[s] += 0.05 * rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 60)

# 软限幅 + 首尾 30ms 渐变保证循环无爆音
mix = np.tanh(mix * 1.4) * 0.85
fade = int(0.03 * SR)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)

out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(out_dir, exist_ok=True)
wav_path = os.path.join(out_dir, "neon-protocol.wav")
m4a_path = os.path.join(out_dir, "neon-protocol.m4a")

pcm = (mix * 32767).astype(np.int16)
with wave.open(wav_path, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

subprocess.run(
    ["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", wav_path, m4a_path],
    check=True,
)
os.remove(wav_path)
print("OK:", m4a_path, os.path.getsize(m4a_path), "bytes")

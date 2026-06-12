#!/usr/bin/env python3
"""生成影像档案馆的占位图（替换真实照片后可删除）
用法：python3 scripts/gen_placeholders.py
"""
import os

SPECS = [
    ("ph-2025-1", 2025, "#00f5d4", "星穹铁道"),
    ("ph-2025-2", 2025, "#f4a623", "原神"),
    ("ph-2025-3", 2025, "#b5179e", "崩坏三"),
    ("ph-2025-4", 2025, "#c8ff00", "绝区零"),
    ("ph-2026-1", 2026, "#00f5d4", "星穹铁道"),
    ("ph-2026-2", 2026, "#f4a623", "原神"),
    ("ph-2026-3", 2026, "#f4a623", "原神"),
    ("ph-2026-4", 2026, "#b5179e", "崩坏三"),
]

TPL = """<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1066" viewBox="0 0 800 1066">
  <rect width="800" height="1066" fill="#0b1120"/>
  <rect width="800" height="1066" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{color}" stop-opacity="0.25"/>
      <stop offset="0.6" stop-color="#0b1120" stop-opacity="0"/>
      <stop offset="1" stop-color="{color}" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <g stroke="{color}" stroke-opacity="0.35">
    <line x1="0" y1="180" x2="800" y2="180" stroke-width="2"/>
    <line x1="0" y1="900" x2="800" y2="900" stroke-width="2"/>
    <line x1="60" y1="0" x2="60" y2="1066"/>
    <line x1="740" y1="0" x2="740" y2="1066"/>
  </g>
  <rect x="100" y="330" width="600" height="380" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="14 10"/>
  <text x="400" y="500" text-anchor="middle" fill="{color}" font-family="monospace" font-size="44" font-weight="bold" letter-spacing="8">NO SIGNAL</text>
  <text x="400" y="560" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="30">{label} · {year}</text>
  <text x="400" y="620" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="22">等待真实影像注入</text>
  <text x="400" y="960" text-anchor="middle" fill="{color}" fill-opacity="0.6" font-family="monospace" font-size="20" letter-spacing="6">BW2026 // PHOTO ARCHIVE</text>
</svg>
"""

out = os.path.join(os.path.dirname(__file__), "..", "public", "photos")
os.makedirs(out, exist_ok=True)
for name, year, color, label in SPECS:
    with open(os.path.join(out, f"{name}.svg"), "w") as f:
        f.write(TPL.format(color=color, year=year, label=label))
print("OK:", len(SPECS), "placeholders →", out)

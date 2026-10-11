"""
用志莽行书「画」书法标题图：错落排版 + 飞白纹理 + 拉长笔锋，输出白墨透明底 WebP。
用法：python -I calli.py <font.ttf> <spec.json> <out_prefix> [--stage layout|final]
spec: {"canvas":[W,H], "chars":[{"c":"团","size":520,"x":0,"y":0,"rot":-3}],
       "tails":[{"pts":[[x,y],...], "w0":40, "w1":2}], "seed": 7}
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

font_path, spec_path, out_prefix = sys.argv[1], sys.argv[2], sys.argv[3]
stage = sys.argv[5] if len(sys.argv) > 5 and sys.argv[4] == "--stage" else "final"
spec = json.load(open(spec_path, encoding="utf-8"))
W, H = spec["canvas"]
rng = np.random.default_rng(spec.get("seed", 7))


def glyph_layer(ch, size, rot, thin_k):
    """单字：L 模式墨迹；按字号比例收细（大字多收、小字少收，免得小字被吃掉）"""
    font = ImageFont.truetype(font_path, size)
    pad = size // 2
    im = Image.new("L", (size * 2, size * 2), 0)
    ImageDraw.Draw(im).text((pad, pad), ch, font=font, fill=255)
    n = int(round(size * thin_k))
    for _ in range(n):
        im = im.filter(ImageFilter.MinFilter(3))
    if n:
        im = im.filter(ImageFilter.GaussianBlur(1.0)).point(lambda v: 255 if v > 118 else int(v * 1.6))
    if rot:
        im = im.rotate(rot, resample=Image.BICUBIC, expand=False)
    return im, pad


def tail_layer(pts, w0, w1, p=0.8, steps=320):
    """拉长笔锋：沿折线插值的锥形笔画，宽度 w0→w1，末端细尖"""
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    pts = np.array(pts, dtype=float)
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))]
    for t in np.linspace(0, 1, steps):
        s = t * seg[-1]
        k = min(np.searchsorted(seg, s, side="right") - 1, len(pts) - 2)
        u = (s - seg[k]) / max(seg[k + 1] - seg[k], 1e-6)
        x, y = pts[k] + u * (pts[k + 1] - pts[k])
        r = (w0 + (w1 - w0) * t ** p) / 2  # p 越大，粗的部分保持越久，收笔越陡
        d.ellipse([x - r, y - r, x + r, y + r], fill=255)
    return im


ink = Image.new("L", (W, H), 0)
char_layers = []  # 每个字单独一层（含挂在它身上的拉长笔锋），用于逐字淡入
for g in spec["chars"]:
    layer, pad = glyph_layer(g["c"], g["size"], g.get("rot", 0), g.get("thin", spec.get("thin_k", 0)))
    m = Image.new("L", (W, H), 0)
    m.paste(Image.new("L", layer.size, 255), (g["x"] - pad, g["y"] - pad), layer)
    char_layers.append([g["c"], m])
    ink = Image.fromarray(np.maximum(np.array(ink), np.array(m)))
for t in spec.get("tails", []):
    tl = tail_layer(t["pts"], t["w0"], t["w1"], t.get("p", 0.8))
    ink = Image.fromarray(np.maximum(np.array(ink), np.array(tl)))
    for cl in char_layers:  # "of": 这一笔属于哪个字
        if cl[0] == t.get("of"):
            cl[1] = Image.fromarray(np.maximum(np.array(cl[1]), np.array(tl)))

a = np.array(ink).astype(np.float32) / 255.0

if stage == "final":
    # 飞白：沿书写方向拉长的丝状留白，只开在笔画内部（边缘保持利落，不做毛边）
    def streaks(angle, k, cut, seed_shift):
        n = np.random.default_rng(spec.get("seed", 7) + seed_shift).random((H, W)).astype(np.float32)
        c = np.cumsum(np.pad(n, ((0, 0), (k, 0)), mode="edge"), axis=1)
        s = (c[:, k:] - c[:, :-k]) / k  # 横向运动模糊 → 细长纤维
        # 旋转后四角要用均值填，补 0 会把标准差撑大、阈值失效
        s = np.array(Image.fromarray(s).rotate(angle, resample=Image.BICUBIC, fillcolor=float(s.mean())))
        s = (s - s.mean()) / (s.std() + 1e-6)
        return np.clip((s - cut) * 3.0, 0, 1)  # 只留最亮的一小撮，变成干净的留白丝

    interior = np.array(ink.filter(ImageFilter.MinFilter(7))).astype(np.float32) / 255.0
    dry = np.maximum(streaks(-14, 70, 1.9, 1), streaks(74, 70, 2.2, 2))  # 横画 + 竖画两个方向
    a = a * (1 - dry * interior * spec.get("dry", 1.0))

alpha = Image.fromarray((a * 255).astype(np.uint8))
bbox = alpha.getbbox()
pad = 24
box = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0), min(bbox[2] + pad, W), min(bbox[3] + pad, H))
alpha = alpha.crop(box)

# 预览：白底黑墨（看构图）；成品：白墨透明底（放深夜蓝上）
preview = Image.new("RGB", alpha.size, (255, 255, 255))
preview.paste((10, 10, 10), (0, 0), alpha)
preview.save(f"{out_prefix}-preview.png")
night = Image.new("RGB", alpha.size, (15, 29, 58))
night.paste((241, 245, 249), (0, 0), alpha)
night.save(f"{out_prefix}-night.png")
if stage == "final":
    rgba = Image.merge("RGBA", (Image.new("L", alpha.size, 255),) * 3 + (alpha,))
    rgba.save(f"{out_prefix}.webp", "WEBP", quality=88, method=6)

    # 逐字图层：每个字裁到自己的外框，位置相对整幅图（box）记进清单，前端按顺序淡入
    manifest = {"w": box[2] - box[0], "h": box[3] - box[1], "chars": []}
    for i, (c, m) in enumerate(char_layers):
        cb = m.getbbox()
        cb = (max(cb[0] - 6, box[0]), max(cb[1] - 6, box[1]), min(cb[2] + 6, box[2]), min(cb[3] + 6, box[3]))
        cm = m.crop(cb)
        layer = Image.merge("RGBA", (Image.new("L", cm.size, 255),) * 3 + (cm,))
        name = f"{out_prefix.rsplit('/', 1)[-1]}-{i + 1}.webp"
        layer.save(f"{out_prefix.rsplit('/', 1)[0]}/{name}", "WEBP", quality=88, method=6)
        manifest["chars"].append(
            {"c": c, "file": name, "x": cb[0] - box[0], "y": cb[1] - box[1], "w": cm.size[0], "h": cm.size[1]}
        )
    json.dump(manifest, open(f"{out_prefix}.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"{out_prefix}: {alpha.size[0]}x{alpha.size[1]}  bbox_on_canvas={box}")

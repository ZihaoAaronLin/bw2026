# 团长的话：书法图与字体子集

两幅书法图（`public/archive/captain-title.webp`、`captain-closing.webp`）不是 AI 生成的，
是用开源字体**志莽行书**（SIL OFL 1.1）按错落排版、按字号收细笔画、补一笔拉长笔锋渲染出来的
白墨透明底图。正文字体是同一款字体的子集（`src/app/fonts/ZhiMangXing-captain.woff2`）。

## 准备

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli pillow numpy
curl -LO https://raw.githubusercontent.com/google/fonts/main/ofl/zhimangxing/ZhiMangXing-Regular.ttf
```

## 重画书法图

`title.json` / `closing.json` 里是每个字的字号、位置、旋转、收细程度，以及拉长笔锋的折线。

```bash
.venv/bin/python scripts/calligraphy/calli.py ZhiMangXing-Regular.ttf scripts/calligraphy/title.json out/title
# 生成 out/title-preview.png（白底预览）、out/title-night.png（深夜蓝预览）、out/title.webp（整图）
# 以及逐字图层 out/title-1.webp … 和位置清单 out/title.json
```

网站用的是**逐字图层**（翻页时一个字一个字淡入淡出）：把 `out/title-N.webp` 复制成
`public/archive/captain-title-N.webp`，再按 `out/title.json` 里每个字的 x / y / w / h 更新
`src/data/event.ts` 里 `CAPTAIN_NOTE.art.title`。拉长的笔锋用 `"of": "团"` 指定挂在哪个字上。

## 改了团长的话之后重新抽字

团长的话用两款字体，都只抽了用到的字：

- **志莽行书**：题记两句 + 署名（`brush.txt`）
- **霞鹜文楷**：正文与结尾（`kai.txt`），另含英文字母和数字。
  下载：<https://github.com/lxgw/LxgwWenKai/releases> 的 `LXGWWenKai-Regular.ttf`（SIL OFL，
  许可证允许仅用于网页的子集保留原名）

改了 `CAPTAIN_NOTE` 的文字，要按上面的分组把文字分别存好后重新抽字，否则新字会退回其他字体：

```bash
P="，。？！、：；“”‘’—…（）《》 "
.venv/bin/pyftsubset ZhiMangXing-Regular.ttf --text-file=brush.txt --text="$P" \
  --layout-features='*' --no-hinting --desubroutinize --flavor=woff2 \
  --output-file=src/app/fonts/ZhiMangXing-captain.woff2
.venv/bin/pyftsubset LXGWWenKai-Regular.ttf --text-file=kai.txt \
  --text="$P ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" \
  --layout-features='*' --no-hinting --desubroutinize --flavor=woff2 \
  --output-file=src/app/fonts/LXGWWenKai-captain.woff2
```

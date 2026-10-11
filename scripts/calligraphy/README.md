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

字体只含信里用到的汉字和常用标点（不含英文字母，西文会退回 Geist）。改了 `CAPTAIN_NOTE`
的文字，要把全文存成 `letter.txt` 后重新抽字，否则新字会退回系统字体：

```bash
.venv/bin/pyftsubset ZhiMangXing-Regular.ttf --text-file=letter.txt \
  --text="，。？！、：；“”‘’—…（）《》 " --layout-features='*' --no-hinting \
  --desubroutinize --flavor=woff2 --output-file=src/app/fonts/ZhiMangXing-captain.woff2
```

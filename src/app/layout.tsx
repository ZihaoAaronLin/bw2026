import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ARCHIVE_MODE } from "@/data/event";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 团长的话的两款字体，都只抽了用到的字、自托管（不走 Google，国内打不开）。
 * 改了团长的话的文字要重新抽字，否则新字会退回系统字体（步骤见 scripts/calligraphy/README.md）。
 * - 志莽行书（SIL OFL 1.1，fonts/ZhiMangXing-OFL.txt）：题记两句 + 署名，约 7 KB
 * - 霞鹜文楷（SIL OFL 1.1，fonts/LXGWWenKai-OFL.txt，许可证允许网页用途的子集保留原名）：
 *   正文与结尾，含英文字母，约 49 KB
 */
const brush = localFont({
  src: "./fonts/ZhiMangXing-captain.woff2",
  variable: "--font-brush",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});

const kai = localFont({
  src: "./fonts/LXGWWenKai-captain.woff2",
  variable: "--font-kai",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
});

const COPY = ARCHIVE_MODE
  ? {
      title: "BW 2026 Mihoyo 剧组 · 活动回顾",
      description:
        "BiliBili World 2026 米哈游剧组活动回顾：2026.07.11 上海国家会展中心，崩坏三×原神×崩坏：星穹铁道×绝区零四团联合。数据回顾、身份卡生成、游场雷达地图、AI 参谋，赛博朋克风活动站，作者瑾瑜独立开发。",
      ogDescription: "7.11 已举行 · 数据回顾、身份卡、游场雷达地图与 AI 参谋",
    }
  : {
      title: "BW 2026 Mihoyo 剧组 · 指北",
      description:
        "7.11 上海国家会展中心 | 崩坏三×原神×崩坏：星穹铁道×绝区零 — 集合时间、游场路线、聚餐情报、一键生成行动纲领",
      ogDescription: "7.11 上海国家会展中心 | 点击接入系统，获取你的行动纲领",
    };

export const metadata: Metadata = {
  // OG/分享卡片图的绝对 URL 基准 —— 正式域名（已绑定）
  metadataBase: new URL("https://aaronlin.cn"),
  title: COPY.title,
  description: COPY.description,
  openGraph: {
    title: COPY.title,
    description: COPY.ogDescription,
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${brush.variable} ${kai.variable} h-full antialiased${
        ARCHIVE_MODE ? " story-snap" : ""
      }`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  );
}

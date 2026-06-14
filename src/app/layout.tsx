import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // OG/分享卡片图的绝对 URL 基准 —— 正式域名（已绑定）
  metadataBase: new URL("https://aaronlin.cn"),
  title: "BW 2026 Mihoyo 剧组 · 指北",
  description:
    "7.11 上海国家会展中心 | 崩坏三×原神×崩坏：星穹铁道×绝区零 — 集合时间、游场路线、聚餐情报、一键生成行动纲领",
  openGraph: {
    title: "BW 2026 Mihoyo 剧组 · 指北",
    description: "7.11 上海国家会展中心 | 点击接入系统，获取你的行动纲领",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  );
}

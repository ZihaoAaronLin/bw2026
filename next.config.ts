import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 手机连同一 WiFi 真机调试用：允许通过局域网 IP 访问 dev 服务器。
  // 只影响开发模式；若电脑 IP 变了（路由器重新分配），这里要跟着改。
  allowedDevOrigins: ["192.168.5.103", "192.168.31.195"],
  // 照片在裁图时已压到成品尺寸（~50KB / 416×559），无需再过 Vercel
  // 图片优化器——关掉以免耗尽 Hobby 套餐的图片转换额度（爆额会 402 图全裂）。
  images: { unoptimized: true },
};

export default nextConfig;

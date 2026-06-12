import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 手机连同一 WiFi 真机调试用：允许通过局域网 IP 访问 dev 服务器。
  // 只影响开发模式；若电脑 IP 变了（路由器重新分配），这里要跟着改。
  allowedDevOrigins: ["192.168.5.103", "192.168.31.195"],
};

export default nextConfig;

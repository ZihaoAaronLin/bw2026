# BW2026 Mihoyo 剧组 · 指北

赛博朋克风格的漫展企划官网。Next.js 16 + TypeScript + Tailwind v4 + Framer Motion。

## 本地运行

```bash
npm install
npm run dev   # http://localhost:3000
```

## 改内容只需要动一个文件

**`src/data/event.ts`** 是唯一数据源：群号、团长 QQ、时间轴、口号、票价、聚餐规则、
照片清单、歌单、AI 快捷问答全在里面。改完即全站生效（包括 AI 参谋的情报库）。

## 接入 AI（DeepSeek）

1. [platform.deepseek.com](https://platform.deepseek.com) 注册并**充值少量金额**（如 ¥20，
   余额耗尽接口自动停 = 天然止损线）
2. 复制 `.env.example` 为 `.env.local`，填入 `DEEPSEEK_API_KEY`
3. 不配置 key 网站照常运行，AI 返回离线提示，快捷问答全部可用

限流（三层，逐层变硬）：
1. 客户端 30 条/日（localStorage）——清缓存/无痕即可绕过，仅劝退作用。
2. 服务端 8 条/分、40 条/日——**内存版软限流**，Vercel serverless 每实例独立、
   冷启动清零，挡不住分布式刷量，只削单实例峰值。
3. **DeepSeek 预充值余额——这才是真正的硬上限**，充少量即止损，余额耗尽接口自动停。

要严格的跨实例限流，把 `route.ts` 的内存 Map 换成 Upstash Redis（Vercel
Marketplace 一键添加）。本企划生命周期短、有余额兜底，按需选配即可。

## 应援泡泡墙（MODULE_07 · Have your say）

留言像泡泡一样飘在墙上。两种模式自动切换：

- **不配置后端** → 本地氛围版：只飘自己发的 + 预设应援泡泡，刷新即清，零成本零风险。
- **配置后端** → 真·共享版：所有人发的所有人可见（轮询刷新），像 Wooclap。

开共享版的步骤：

1. Vercel 项目 → Storage / Marketplace 添加 **Upstash Redis**（免费档够用），
   连接后 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` 会自动注入环境变量。
2. 可选设 `WALL_ADMIN_SECRET`（随机串）。当天有人发不当内容，团长执行
   `DELETE /api/wall?secret=<你的串>` 即可一键清墙。
3. 重新部署即生效。

内置防护：单条 ≤40 字、敏感词/广告链接过滤（`src/lib/wall.ts` 的 `BLOCK` 可扩充）、
按 IP 限频（15s 冷却 + 每日 30 条，Redis 持久计数）。**匿名公开墙仍有内容风险，
建议当天安排人盯一眼，用清墙密钥兜底。**

## 换 BGM / 加照片

- **BGM**：把 mp3/m4a 放进 `public/audio/`，在 `event.ts` 的 `PLAYLIST` 登记。
  当前内置曲由 `scripts/gen_bgm.py` 合成，可直接替换。
- **照片**：先压缩（建议长边 ≤1600px、WebP），放进 `public/photos/`，
  在 `event.ts` 的 `PHOTOS` 登记（带宽高）。占位 SVG 可删。
- 发布前注意获得出镜 coser 的肖像授权。

## 部署（Vercel + 自定义域名）

1. 推到 GitHub，Vercel 导入仓库，环境变量里填 `DEEPSEEK_API_KEY`
2. **必须绑自定义域名**——`*.vercel.app` 在大陆基本无法访问
3. 上线后找移动/联通/电信的群友各测一次连通性
4. 链接发 QQ 群若弹「非官方网页」提示，群公告注明「复制到浏览器打开」

## 已做的移动端/性能处理

- 音频严格走用户手势解锁（BOOT 按钮），兼容 iOS/安卓自动播放策略
- 海报导出用 html-to-image + 导出安全样式，预热双渲染规避 iOS Safari 丢字体
- 导出图走 Web Share API 存相册，不支持时回退「长按保存」
- 全屏区块用 dvh；霓虹光晕只过渡 opacity；入场动画 whileInView+once
- 支持 prefers-reduced-motion

# BW2026 Mihoyo 剧组 · 指北

赛博朋克风格的漫展企划官网。Next.js 16 + TypeScript + Tailwind v4 + Framer Motion。
活动已于 2026-07-11 在上海国家会展中心举行，站点现为归档版：<https://aaronlin.cn>

## 活动回顾

| 环节 | 数据 |
|---|---|
| 报名 | 2,243 人次（去重 1,500） |
| 预计到场 | 550 人（去重 500） |
| 当天到场 | 约 150–200 人 |
| 四团报名 | 星铁 1,081 · 原神 770 · 绝区零 216 · 崩坏三 176 |
| 应援墙 | 应援 200+ 条，有效建议 20+ 条 |
| 入群申请 | 站点发布后新增 200+（按发布后的申请数算，未扣流失） |

开发：借助 Claude Code 与 Cursor 独立开发，6/11 建仓，6/14 上线正式域名，到 6/17 共
25 次提交；AI 参谋的 DeepSeek 调用花费约 ¥50。

复盘：

- 按大家的建议，调整了集合的时间、地点和方式，以及游场规划。
- 预计 550 人、实到约 150–200 人，人主要是在抢票这一步流失的。

## 归档模式（`ARCHIVE_MODE`）

`src/data/event.ts` 顶部的 `ARCHIVE_MODE = true` 控制归档相关的交互：

- 不弹任何强制弹窗；开机动画自动放完（约 1 秒），点一下即可跳过
- Hero 下方显示「活动已结束 · 数据回顾」；倒计时改为「7.11 已举行」
- 应援墙只读；AI 参谋按「活动已结束」口径回答
- 页脚署名 + GitHub 链接；页面标题 / 描述改为活动回顾

改回 `false` 即恢复活动期的交互。QQ 号、群号、共享文档链接、打赏和抢票公告是直接
删除的，不受这个开关控制。

## 本地运行

```bash
npm install
npm run dev   # http://localhost:3000
```

## 改内容只需要动一个文件

**`src/data/event.ts`** 是唯一数据源：时间轴、口号、票价、聚餐规则、照片清单、歌单、
AI 快捷问答、活动回顾数据全在里面。改完即全站生效（包括 AI 参谋的情报库）。

## 接入 AI（DeepSeek）

1. [platform.deepseek.com](https://platform.deepseek.com) 注册并**充值少量金额**（如 ¥20，
   余额耗尽接口自动停 = 天然止损线）
2. 复制 `.env.example` 为 `.env.local`，填入 `DEEPSEEK_API_KEY`
3. 不配置 key、余额用完或 key 失效时，网站照常运行：AI 参谋显示「已休眠，可以试试下方
   快捷问答」，快捷问答全部可用（上游状态码只写服务端日志）

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

**应援 vs 建议/补充**：墙的输入框分两类——
- **应援**（≤40 字）：公开飘上墙，进「全部留言」列表。
- **建议 · 补充**（≤200 字）：进团长**私有收件箱**（不公开飘），用于收集交通经验、
  现场提示、反馈等有用信息。团长取回：`GET /api/wall?inbox=1&secret=<你的串>`。

内置防护：单条 ≤40 字、敏感词/广告链接过滤（`src/lib/wall.ts` 的 `BLOCK` 可扩充）、
按 IP 限频（15s 冷却 + 每日 30 条，Redis 持久计数）。**匿名公开墙仍有内容风险，
建议当天安排人盯一眼，用清墙密钥兜底。**

**归档后**：墙为只读，已有留言照常展示，任何 POST 统一返回 410「活动已结束，应援墙已
归档」。逐条审核公开留言（密钥建议放请求头，别拼进 URL 留在浏览器历史里）：

```bash
# 列出全部公开留言（含 id、北京时间）
curl -H "x-admin-secret: $WALL_ADMIN_SECRET" https://aaronlin.cn/api/wall/admin
# 删除单条
curl -X DELETE -H "x-admin-secret: $WALL_ADMIN_SECRET" "https://aaronlin.cn/api/wall/admin?id=<留言id>"
```

## 换 BGM / 加照片

- **BGM**：把 mp3/m4a 放进 `public/audio/`，在 `event.ts` 的 `PLAYLIST` 登记。
  当前内置曲由 `scripts/gen_bgm.py` 合成，可直接替换。
- **照片**：先压缩（建议长边 ≤1600px、WebP），放进 `public/photos/`，
  在 `event.ts` 的 `PHOTOS` 登记（带宽高）。
- 发布前注意获得出镜 coser 的肖像授权。

## 部署（Vercel + 自定义域名）

1. 推到 GitHub，Vercel 导入仓库，环境变量里填 `DEEPSEEK_API_KEY`
2. **必须绑自定义域名**——`*.vercel.app` 在大陆基本无法访问
3. 上线后找移动/联通/电信的群友各测一次连通性
4. 在 QQ 内置浏览器打开若弹「非官方网页」提示，引导用户复制链接到系统浏览器打开

## 已做的移动端/性能处理

- 音频严格走用户手势解锁（BOOT 按钮），兼容 iOS/安卓自动播放策略
- 海报导出用 html-to-image + 导出安全样式，预热双渲染规避 iOS Safari 丢字体
- 导出图走 Web Share API 存相册，不支持时回退「长按保存」
- 全屏区块用 dvh；霓虹光晕只过渡 opacity；入场动画 whileInView+once
- 支持 prefers-reduced-motion

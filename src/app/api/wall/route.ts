/**
 * 应援泡泡墙 API
 * - GET    返回 { configured, messages }
 * - POST   提交一条留言（审核 + 限流），返回新留言；归档模式统一拒绝
 * - DELETE 团长清墙：?secret=WALL_ADMIN_SECRET（未配置 secret 则禁用）
 * 逐条审核 / 删除单条见 ./admin/route.ts
 */
import { ARCHIVE_MODE } from "@/data/event";
import {
  clean,
  clearWall,
  listInbox,
  listMessages,
  pushInbox,
  pushMessage,
  rateOk,
  wallConfigured,
  type InboxMsg,
  type WallMsg,
} from "@/lib/wall";

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

export async function GET(req: Request) {
  if (!wallConfigured) return Response.json({ configured: false, messages: [] });
  const url = new URL(req.url);

  // 团长取回收件箱（建议/补充）：?inbox=1&secret=WALL_ADMIN_SECRET
  if (url.searchParams.get("inbox")) {
    const secret = process.env.WALL_ADMIN_SECRET;
    if (!secret || url.searchParams.get("secret") !== secret) {
      return Response.json({ error: "无权限" }, { status: 401 });
    }
    try {
      return Response.json({ inbox: await listInbox(300) });
    } catch {
      return Response.json({ error: "读取失败" }, { status: 502 });
    }
  }

  // 公开应援列表；?n= 控制条数（「查看全部」拉大值）
  const n = Number(url.searchParams.get("n") ?? "60") || 60;
  try {
    const messages = await listMessages(n);
    return Response.json({ configured: true, messages });
  } catch {
    return Response.json({ configured: true, messages: [], error: "读取失败" });
  }
}

export async function POST(req: Request) {
  // 归档：只读，任何提交都统一回这一句
  if (ARCHIVE_MODE) {
    return Response.json({ error: "活动已结束，应援墙已归档" }, { status: 410 });
  }
  if (!wallConfigured) {
    // 未接后端：前端会走本地氛围版，这里直接告知
    return Response.json({ configured: false }, { status: 200 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "格式错误" }, { status: 400 });
  }
  const raw = body as { text?: unknown; kind?: unknown };
  const isEnquiry = raw.kind === "enquiry";

  // 应援 ≤40 字且过滤广告；建议/补充 ≤200 字、进私有收件箱、放宽链接限制
  const text = isEnquiry
    ? clean(raw.text, 200, false)
    : clean(raw.text, 40, true);
  if (!text) {
    return Response.json(
      {
        error: isEnquiry
          ? "内容为空或超 200 字"
          : "内容为空、超 40 字或含违规词（链接/拉群/广告）",
      },
      { status: 422 },
    );
  }

  try {
    if (!(await rateOk(clientIp(req)))) {
      return Response.json({ error: "发送太频繁，歇 15 秒再来～" }, { status: 429 });
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (isEnquiry) {
      const item: InboxMsg = { id, text, ts: Date.now() };
      await pushInbox(item);
      return Response.json({ ok: true, kind: "enquiry" });
    }
    const msg: WallMsg = {
      id,
      text,
      ts: Date.now(),
      hue: Math.floor(Math.random() * 360),
    };
    await pushMessage(msg);
    return Response.json({ ok: true, kind: "cheer", message: msg });
  } catch {
    return Response.json({ error: "服务繁忙，稍后再试" }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  const secret = process.env.WALL_ADMIN_SECRET;
  if (!secret) return Response.json({ error: "未启用" }, { status: 403 });
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== secret) {
    return Response.json({ error: "无权限" }, { status: 401 });
  }
  try {
    await clearWall();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "清空失败" }, { status: 502 });
  }
}

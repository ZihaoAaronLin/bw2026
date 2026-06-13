/**
 * 应援泡泡墙 API
 * - GET    返回 { configured, messages }
 * - POST   提交一条留言（审核 + 限流），返回新留言
 * - DELETE 团长清墙：?secret=WALL_ADMIN_SECRET（未配置 secret 则禁用）
 */
import {
  clean,
  clearWall,
  listMessages,
  pushMessage,
  rateOk,
  wallConfigured,
  type WallMsg,
} from "@/lib/wall";

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

export async function GET() {
  if (!wallConfigured) return Response.json({ configured: false, messages: [] });
  try {
    const messages = await listMessages(60);
    return Response.json({ configured: true, messages });
  } catch {
    return Response.json({ configured: true, messages: [], error: "读取失败" });
  }
}

export async function POST(req: Request) {
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
  const text = clean((body as { text?: unknown }).text);
  if (!text) {
    return Response.json(
      { error: "内容为空、超 40 字或含违规词（链接/拉群/广告）" },
      { status: 422 },
    );
  }
  try {
    if (!(await rateOk(clientIp(req)))) {
      return Response.json({ error: "发送太频繁，歇 15 秒再来～" }, { status: 429 });
    }
    const msg: WallMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      ts: Date.now(),
      hue: Math.floor(Math.random() * 360),
    };
    await pushMessage(msg);
    return Response.json({ ok: true, message: msg });
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

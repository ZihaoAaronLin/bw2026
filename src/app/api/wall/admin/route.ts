/**
 * 应援墙 · 团长后台（逐条审核公开留言）
 * - GET    列出全部公开应援（含 id 与北京时间）
 * - DELETE ?id=<留言 id> 删除单条
 * 鉴权：WALL_ADMIN_SECRET，推荐放请求头 `x-admin-secret`（也接受
 * `Authorization: Bearer <secret>`，以及方便浏览器查看的 `?secret=`）。
 * 未配置 WALL_ADMIN_SECRET 时整个接口禁用。
 */
import { timingSafeEqual } from "node:crypto";
import { deleteMessage, listMessages, wallConfigured } from "@/lib/wall";

function authorized(req: Request): Response | null {
  const secret = process.env.WALL_ADMIN_SECRET;
  if (!secret) return Response.json({ error: "未启用" }, { status: 403 });
  const url = new URL(req.url);
  const given =
    req.headers.get("x-admin-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    url.searchParams.get("secret") ??
    "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "无权限" }, { status: 401 });
  }
  if (!wallConfigured) return Response.json({ error: "未配置存储" }, { status: 503 });
  return null;
}

export async function GET(req: Request) {
  const denied = authorized(req);
  if (denied) return denied;
  try {
    const messages = await listMessages(300);
    return Response.json({
      total: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        text: m.text,
        time: new Date(m.ts).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
      })),
    });
  } catch {
    return Response.json({ error: "读取失败" }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  const denied = authorized(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "缺少 id" }, { status: 400 });
  try {
    const removed = await deleteMessage(id);
    if (!removed) return Response.json({ error: "未找到该留言" }, { status: 404 });
    return Response.json({ ok: true, deleted: { id: removed.id, text: removed.text } });
  } catch {
    return Response.json({ error: "删除失败" }, { status: 502 });
  }
}

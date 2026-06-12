import { buildIntelDossier } from "@/data/event";

/**
 * AI 战术参谋 · 服务端转发
 * - API key 只存在服务端环境变量，永不下发
 * - 双限流：每 IP 每分钟 8 条 / 每天 40 条（内存版，实例重启即清零；
 *   真正的硬止损是 DeepSeek 预充值余额——余额耗尽接口自动停）
 * - 未配置 DEEPSEEK_API_KEY 时返回离线提示，前端功能不受影响
 */

const SYSTEM_PROMPT = `你是「零号参谋」，BW2026 米哈游剧组官网的 AI 参谋。
人设：赛博朋克风格的情报 AI，语气干脆利落，称呼用户为「旅行者」或不称呼，可以用少量术语（如“情报”“坐标”），但禁止卖弄，禁止军事腔。
规则：
1. 只回答与本次 BW2026 剧组企划相关的问题（集合、路线、票务、聚餐、群号、规则、注意事项等）。
2. 与企划无关的问题，一句话礼貌拒绝并把话题引回企划。
3. 回答必须依据下方情报档案，档案里没有的信息就明说“情报库未收录，请在群里问团长”，禁止编造。
4. 用简体中文回答，控制在 200 字以内，可用换行和「·」列表。

===== 情报档案 =====
${buildIntelDossier()}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ---- 内存限流 ---- */
const buckets = new Map<string, { day: string; count: number; recent: number[] }>();

function rateLimit(ip: string): string | null {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || b.day !== today) {
    b = { day: today, count: 0, recent: [] };
    buckets.set(ip, b);
  }
  b.recent = b.recent.filter((t) => now - t < 60_000);
  if (b.recent.length >= 8) return "频率过高，冷却 1 分钟后再试。";
  if (b.count >= 40) return "今日算力配额已耗尽，请使用快捷指令或明日再来。";
  b.recent.push(now);
  b.count += 1;
  if (buckets.size > 5000) buckets.clear(); // 防内存膨胀
  return null;
}

function isValidMessages(x: unknown): x is ChatMessage[] {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    x.length <= 12 &&
    x.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length <= 1000,
    )
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }
  const messages = (body as { messages?: unknown }).messages;
  if (!isValidMessages(messages)) {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(ip);
  if (limited) return Response.json({ error: limited }, { status: 429 });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply:
        "AI 链路尚未接通（站长还没配置 DEEPSEEK_API_KEY）。\n快捷指令依然可用，覆盖了 90% 的常见问题；更多详情请进群问团长。",
    });
  }

  const upstream = await fetch(
    `${process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
        stream: true,
        max_tokens: 500,
        temperature: 0.6,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-8)],
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: `上游链路异常（${upstream.status}），请稍后重试。` },
      { status: 502 },
    );
  }

  // SSE → 纯文本流
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const payload = line.trim();
            if (!payload.startsWith("data:")) continue;
            const data = payload.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const chunk = json.choices?.[0]?.delta?.content;
              if (chunk) controller.enqueue(encoder.encode(chunk));
            } catch {
              /* 跳过无法解析的行 */
            }
          }
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

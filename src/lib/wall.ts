/**
 * 应援泡泡墙 · 服务端存储（Upstash Redis REST，无 SDK，风格同 DeepSeek 转发）
 * 未配置 UPSTASH_REDIS_REST_URL / _TOKEN 时整体降级——API 返回 configured:false，
 * 前端切到「本地氛围版」（只飘自己的 + 预设泡泡），功能不崩。
 */

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const wallConfigured = Boolean(REST_URL && REST_TOKEN);

const KEY = "bw:wall"; // 应援（公开泡泡）
const INBOX = "bw:inbox"; // 建议 / 补充信息（团长私有收件箱，不公开）
const MAX_STORED = 300; // 应援最多留存
const MAX_INBOX = 800; // 收件箱最多留存

export interface WallMsg {
  id: string;
  text: string;
  ts: number;
  hue: number; // 0-360，前端泡泡配色
}

export interface InboxMsg {
  id: string;
  text: string;
  ts: number;
}

async function redis<T = unknown>(cmd: (string | number)[]): Promise<T | null> {
  if (!wallConfigured) return null;
  const res = await fetch(REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

/* ---------- 内容审核 ---------- */
const MAX_LEN = 40;
/** 广告 / 拉群 / 链接等明显违规词；团长可按需扩充 */
const BLOCK = [
  "http", "www.", ".com", ".cn/", "扫码", "加微", "加群", "vx", "v信",
  "代购", "出票", "收票", "出图", "私信我", "点击", "福利群", "返现",
];

/**
 * 清洗 + 校验：返回干净文本，违规/超长返回 null
 * @param maxLen 长度上限（应援 40；建议/补充更长）
 * @param checkBlock 是否过滤广告/链接词（应援公开飘，需过滤；建议进私有收件箱，放宽）
 */
export function clean(text: unknown, maxLen = MAX_LEN, checkBlock = true): string | null {
  if (typeof text !== "string") return null;
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || t.length > maxLen) return null;
  if (checkBlock) {
    const low = t.toLowerCase();
    if (BLOCK.some((w) => low.includes(w))) return null;
  }
  return t;
}

/* ---------- 持久限流（按 IP，Redis 计数，比内存版硬） ---------- */
/** 15s 冷却 + 每日 30 条。返回 true 放行 */
export async function rateOk(ip: string): Promise<boolean> {
  if (!wallConfigured) return true;
  const cd = await redis<string | null>(["SET", `bw:wall:cd:${ip}`, "1", "NX", "EX", 15]);
  if (cd === null) return false; // key 已存在 = 冷却中
  const dayKey = `bw:wall:day:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const n = (await redis<number>(["INCR", dayKey])) ?? 0;
  if (n === 1) await redis(["EXPIRE", dayKey, 86400]);
  return n <= 30;
}

/* ---------- 应援（公开泡泡）读写 ---------- */
export async function pushMessage(m: WallMsg): Promise<void> {
  await redis(["LPUSH", KEY, JSON.stringify(m)]);
  await redis(["LTRIM", KEY, 0, MAX_STORED - 1]);
}

export async function listMessages(n = 60): Promise<WallMsg[]> {
  const cap = Math.min(Math.max(1, n), MAX_STORED);
  const raw = await redis<string[]>(["LRANGE", KEY, 0, cap - 1]);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      try {
        return JSON.parse(s) as WallMsg;
      } catch {
        return null;
      }
    })
    .filter((m): m is WallMsg => !!m);
}

/* ---------- 收件箱（建议/补充，团长私有）读写 ---------- */
export async function pushInbox(m: InboxMsg): Promise<void> {
  await redis(["LPUSH", INBOX, JSON.stringify(m)]);
  await redis(["LTRIM", INBOX, 0, MAX_INBOX - 1]);
}

export async function listInbox(n = 200): Promise<InboxMsg[]> {
  const cap = Math.min(Math.max(1, n), MAX_INBOX);
  const raw = await redis<string[]>(["LRANGE", INBOX, 0, cap - 1]);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      try {
        return JSON.parse(s) as InboxMsg;
      } catch {
        return null;
      }
    })
    .filter((m): m is InboxMsg => !!m);
}

export async function clearWall(): Promise<void> {
  await redis(["DEL", KEY]);
}

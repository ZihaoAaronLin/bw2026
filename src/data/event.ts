/**
 * ============ 唯一数据源 ============
 * 全站所有真实情报都在这个文件里，改这里即可全站生效。
 * 数据来源：《2026 BiliBili World Mihoyo 剧组计划书》
 */

export const EVENT = {
  name: "BiliBili World 2026",
  crew: "Mihoyo 剧组",
  dateRange: "2026.07.10 — 07.12",
  /** 剧组活动日（7.11） */
  dDay: "2026-07-11T14:00:00+08:00",
  dDayLabel: "7.11 Shanghai",
  venue: "上海国家会展中心",
  venueAddress: "崧泽大道 333 号",
  metro: "地铁「国家会展中心站」4 / 5 / 6 号口",
  /** 场内预计集合地点（暂定） */
  rally: "3H 与 4.1H（暂定）",
  bml: "BiliBili Macro Link 音乐会 · 上海虹馆三楼 · 7.11–7.12",
  organizers: ["瑾瑜"],
  credit: "网站所有者：瑾瑜",
} as const;

export const TICKETS = {
  /** 开票时间 */
  saleStart: "2026-06-21T12:00:00+08:00",
  rounds: [
    { name: "一开 · 大会员", time: "6.21 12:00" },
    { name: "一开 · 会员", time: "6.21 18:00" },
    { name: "二开 · 会员", time: "6.28 18:00" },
  ],
  prices: [
    { name: "游园票", price: 128 },
    { name: "IP 典藏票", price: 328 },
    { name: "VIP 票", price: 558 },
  ],
  rules: [
    "单日单 UID 限购 4 张，每张实名绑定",
    "14 周岁以下不可购票、不可入场",
    "14–18 周岁需回传《未成年人入场安全承诺书》",
    "超时未填写/未过服装审核按退票处理，收 20% 手续费",
  ],
} as const;

export type FactionId = "hi3" | "genshin" | "hsr" | "zzz";

export interface Faction {
  id: FactionId;
  name: string;
  en: string;
  slogan: string;
  song: string;
  group: "A" | "B";
  /** 游场路线（按行进顺序） */
  route: string[];
  routeNote: string;
  leader: { cn: string; qq: string };
  /** 主题色（hex，导出海报安全） */
  color: string;
  colorDim: string;
  signed: number;
  expected: number;
}

export const FACTIONS: Faction[] = [
  {
    id: "hi3",
    name: "崩坏三",
    en: "HONKAI IMPACT 3RD",
    slogan: "为世界上所有的美好而战！",
    song: "妖精小姐的魔法邀约",
    group: "A",
    route: ["3H 集合分流", "4.1H", "5.1H", "6.1H / 7.1H 过道", "中央会合"],
    routeNote: "A 组 · 与星穹铁道同行",
    color: "#b5179e",
    colorDim: "#3d0a36",
    signed: 176,
    expected: 50,
  },
  {
    id: "genshin",
    name: "原神",
    en: "GENSHIN IMPACT",
    slogan: "向着星辰与深渊，想锤天理每一天！",
    song: "提瓦特民谣",
    group: "B",
    route: ["3H 集合分流", "2.1H", "1.1H", "8.1H 过道", "中央会合"],
    routeNote: "B 组 · 与绝区零同行",
    color: "#f4a623",
    colorDim: "#3d2a06",
    signed: 770,
    expected: 200,
  },
  {
    id: "hsr",
    name: "崩坏：星穹铁道",
    en: "HONKAI: STAR RAIL",
    slogan: "愿此行，终抵群星！",
    song: "不眠之夜",
    group: "A",
    route: ["3H 集合分流", "4.1H", "5.1H", "6.1H / 7.1H 过道", "中央会合"],
    routeNote: "A 组 · 与崩坏三同行",
    color: "#00f5d4",
    colorDim: "#013d35",
    signed: 1081,
    expected: 250,
  },
  {
    id: "zzz",
    name: "绝区零",
    en: "ZENLESS ZONE ZERO",
    slogan: "新艾利都永不落幕！",
    song: "原色",
    group: "B",
    route: ["3H 集合分流", "2.1H", "1.1H", "8.1H 过道", "中央会合"],
    routeNote: "B 组 · 与原神同行",
    color: "#c8ff00",
    colorDim: "#2e3d01",
    signed: 216,
    expected: 50,
  },
];

export const CREW_STATS = {
  asOf: "2026-05-30",
  signedTotal: 2243,
  signedUnique: 1500,
  expectedTotal: 550,
  expectedUnique: 500,
} as const;

/** 7.11 当日流程（预，以当日群内通知为准） */
export const TIMELINE = [
  { time: "14:00", label: "集合", desc: "3H 与 4.1H 集合点报到，时间掐死不等人" },
  { time: "15:00", label: "整活", desc: "大型合影 / 签名画布 / 合唱彩排" },
  { time: "16:00", label: "游场", desc: "A / B 两组分流游场，中央会合大合唱" },
  { time: "18:00", label: "聚餐", desc: "场外聚餐，AA 制现场结算" },
] as const;

export const FINALE_SONG = "日不落";
export const CHORUS_NOTE =
  "各 IP 歌曲截取部分衔接串烧，最后以《日不落》收尾";

/** 指挥链 */
export const LEADERS = [
  { role: "星穹铁道团", cn: "瑾瑜", qq: "" },
] as const;

/** 行动频道（一开后开放） */
export const QQ_GROUPS = [
] as const;

export const NICKNAME_RULE = "进群请改昵称：cn+游戏+角色";

export const DOCS = [
] as const;

/** 入场协议（终端授权勾选项） */
export const PROTOCOLS = [
  "我于 2026.07.10 前年满 14 周岁（14–18 周岁已交《未成年人入场安全承诺书》）",
  "拒绝角色混合乱搭，顶 A 假发穿 B 衣服不可以（保护厨子），正常私设 OK",
  "聚餐 AA 制：现场吃现场 A，绝不逃票；KTV 预约定金制，跑单不退",
  "三观正确无任何歧视，禁辱华涉政，绝不惹事——一切活动禁止瓜人出现",
] as const;

/** 生存红线（必须确认） */
export const SURVIVAL = [
  { text: "必带含糖零食 / 饮料", why: "团长今年 1 月低血糖在场馆里昏过去了，血的教训" },
  { text: "必穿平底鞋 + 备一次性拖鞋", why: "8 馆全开，跑完极其费脚，高跟鞋慎重" },
  { text: "必带伞", why: "每年 BW 都下雨，不下雨也能遮阳" },
  { text: "带含盐含糖的水", why: "7 月魔都，天气很热" },
  { text: "透明肩带 / 防走光贴", why: "舞台和合影环节防意外" },
  { text: "莫熬夜！！！", why: "当日 14:00 集合时间掐死，不等任何人" },
] as const;

export const SUPPLIES_NOTE =
  "团长处备有免费应急物资：无料小礼品、医用品、透明肩带、防走光贴、一次性拖鞋、一字夹、创可贴、藿香正气水。需要请直接联系，均不收费。";

export const DINNER = {
  time: "18:00 开始",
  rules: [
    "聚餐限制角色：可能禁止其他厂家 IP 角色，便装可忽视限制，具体以团长通知为准",
    "聚餐限 14 周岁及以上，KTV 限 18 周岁及以上",
    "AA 制：每桌自行点餐自行结款，现场吃现场 A，切勿逃票（不光彩）",
    "有聚餐蛋糕（崩坏三蛋糕，聚餐才有）",
    "KTV 预约定金制（全款预订，跑单不可退）",
    "高考生达到一定门槛，享团长聚餐优惠（不可重考）",
  ],
} as const;

export const DISCLAIMERS = [
  "本企划为非强制性，参与几项或不参与均由你们决定",
  "一切活动均为待定状态，实际情况根据当日变更",
  "遇紧急事情请联系团长，大事会及时联系安保人员",
  "群内禁广，一切交易请自主明辨，团长及群主均不负责",
  "一切解释权归本方所有，公平公正公开，欢迎监督",
] as const;

/** 摄影声明 */
export const PHOTO_NOTE =
  "活动全程预计录像/直播，双主摄+多副摄+流动摄影。跟随剧组默认同意拍摄肖像权。";

/* ============ 照片档案（把真实照片放进 public/photos 并在此登记） ============ */
export interface Photo {
  src: string;
  alt: string;
  year: number;
  factionId?: FactionId;
  w: number;
  h: number;
}

export const PHOTOS: Photo[] = [
  { src: "/photos/crew-01.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-02.jpg", alt: "CN瑾瑜", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-03.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-04.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-05.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-06.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-07.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-08.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
  { src: "/photos/crew-09.jpg", alt: "剧组返图", year: 2025, w: 416, h: 559 },
];

/* ============ BGM 歌单（把 mp3/m4a 放进 public/audio 并在此登记） ============ */
export interface Track {
  title: string;
  src: string;
}

export const PLAYLIST: Track[] = [
  { title: "NEON PROTOCOL — 内置巡航 BGM", src: "/audio/neon-protocol.m4a" },
];

/* ============ AI 战术参谋 ============ */

/** 本地秒答（不消耗 API），key 同时作为快捷按钮文案 */
export const QUICK_QA: { q: string; a: string }[] = [
  {
    q: "几点在哪集合？",
    a: `7 月 11 日 14:00 集合，地点暂定 ${EVENT.rally}。\n时间轴（预）：14:00 集合 → 15:00 整活 → 16:00 游场 → 18:00 聚餐。\n注意：时间掐死，不会等待个别人员！`,
  },
  {
    q: "怎么进群？",
    a: `QQ 群于一开（6.21）之后开放：\n${NICKNAME_RULE}`,
  },
  {
    q: "票价和开票时间？",
    a: "游园票 128 / IP典藏票 328 / VIP 558。\n一开：6.21 大会员 12:00、会员 18:00；二开：6.28 18:00。\n单 UID 限购 4 张，实名绑定；14 岁以下不可入场，14-18 岁需回传承诺书。",
  },
  {
    q: "聚餐有什么规矩？",
    a: `聚餐 ${DINNER.time}。\n` + DINNER.rules.slice(0, 4).map((r) => "· " + r).join("\n"),
  },
  {
    q: "必带物品清单",
    a: SURVIVAL.map((s) => `· ${s.text}（${s.why}）`).join("\n") + "\n\n" + SUPPLIES_NOTE,
  },
  {
    q: "我的阵营走哪条路线？",
    a: "在 3H 馆分流：\n· A 组（崩坏三 & 星穹铁道）→ 4.1H、5.1H，经 6.1H/7.1H 过道向中央会合\n· B 组（原神 & 绝区零）→ 2.1H、1.1H，经 8.1H 过道向中央会合\n详见下方「动态雷达地图」，选择你的阵营即可点亮路线。",
  },
];

/** 喂给 LLM 的完整情报（server 端 system prompt 用） */
export function buildIntelDossier(): string {
  return [
    `# ${EVENT.name} ${EVENT.crew} 完整情报`,
    `活动：${EVENT.name}，${EVENT.dateRange}，地点 ${EVENT.venue}（${EVENT.venueAddress}），${EVENT.metro}。`,
    `7 月 11 日，场内集合地点 ${EVENT.rally}。同期 ${EVENT.bml}。`,
    `团长：${EVENT.organizers.join("、")}；协助：${EVENT.assistant}。`,
    `票务：${TICKETS.prices.map((p) => `${p.name}${p.price}元`).join("/")}。开票：${TICKETS.rounds.map((r) => `${r.name} ${r.time}`).join("；")}。规则：${TICKETS.rules.join("；")}。`,
    `时间轴（预）：${TIMELINE.map((t) => `${t.time} ${t.label}（${t.desc}）`).join("；")}。`,
    `阵营：${FACTIONS.map((f) => `${f.name}[${f.group}组]，口号「${f.slogan}」，合唱曲《${f.song}》，团长 ${f.leader.cn}（QQ ${f.leader.qq}）`).join("；")}。`,
    `游场：3H 分流，A组（崩三&星铁）往 4.1H/5.1H 经 6.1H、7.1H 过道会合；B组（原神&绝区零）往 2.1H/1.1H 经 8.1H 过道会合。合唱串烧最后以《${FINALE_SONG}》收尾。`,
    `QQ群（一开后开放）：${QQ_GROUPS.map((g) => `${g.name} ${g.id}`).join("；")}。${NICKNAME_RULE}。`,
    `聚餐：${DINNER.time}；${DINNER.rules.join("；")}。`,
    `入场协议：${PROTOCOLS.join("；")}。`,
    `生存注意：${SURVIVAL.map((s) => `${s.text}（${s.why}）`).join("；")}。${SUPPLIES_NOTE}`,
    `摄影：${PHOTO_NOTE}`,
    `人数（${CREW_STATS.asOf}）：报名 ${CREW_STATS.signedTotal}（除重 ${CREW_STATS.signedUnique}），预计场内 ${CREW_STATS.expectedTotal}（除重 ${CREW_STATS.expectedUnique}）。各团：${FACTIONS.map((f) => `${f.name} ${f.signed}`).join("、")}。`,
    `免责：${DISCLAIMERS.join("；")}。`,
    `后续：群聊长期开放不解散，将打造跨漫展 IP coser 团，不限江浙沪。`,
  ].join("\n");
}

/**
 * ============ 唯一数据源 ============
 * 全站所有真实情报都在这个文件里，改这里即可全站生效。
 * 数据来源：《2026 BiliBili World Mihoyo 剧组计划书》
 */

/**
 * ============ 归档模式开关 ============
 * 活动已于 2026-07-11 结束，站点转为「活动归档 / 作品展示」。
 * true：不弹强制弹窗、开机动画自动放完可跳过、倒计时显示「已举行」、应援墙只读、
 *       显示数据回顾、AI 参谋用「活动已结束」口径、页脚/标题换成回顾版。
 * 改回 false 即恢复活动期的交互行为。注意：已删除的隐私数据（QQ 号 / 群号 /
 * 共享文档链接）、打赏和抢票公告是真删除，不受此开关控制，改回也不会出现。
 */
export const ARCHIVE_MODE: boolean = true;

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
  /** 网站作者（圈名/CN），用于扉页 & Hero 署名 */
  author: "瑾瑜",
  /** 作者小红书主页 */
  xhs: "https://xhslink.com/m/335MGK1W6b4",
} as const;

/* ============ 群公告（强制弹窗）============ */
/**
 * 更新公告：改 version（+1）即会重新强制弹给所有人（看过旧版本的也会再弹）。
 * sections = 标题 + 要点列表；warnings = 高亮的重要提醒。
 */
export const ANNOUNCEMENT = {
  version: 2,
  tag: "群公告 · 更新",
  title: "BW 核心抢票策略",
  intro: "6.20 开票：大会员 12:00、一开 18:00。团长划重点，照着冲！",
  sections: [
    { h: "设备组合", items: ["平板分屏支付是王道", "手机安卓优先", "电脑多开作为补充"] },
    { h: "网络为王", items: ["5G ＞ 高速 Wi-Fi ＞ 4G", "抢票前务必测速"] },
    {
      h: "心态稳住",
      items: [
        "卡住了就狂点「再试一次」，别退出！",
        "开抢后 10–15 分钟是回流票高峰，多刷还有机会",
      ],
    },
    {
      h: "多账号多终端",
      items: ["单账号每秒只能通过一次", "多个 B 站账号同时操作能显著提升成功率"],
    },
    {
      h: "多证件多账号（目前最有效）",
      items: [
        "护照和身份证在系统内被视作不同身份",
        "A 账号绑身份证、B 账号绑护照同时抢，理论成功率翻倍",
      ],
    },
    {
      h: "盯紧回流票",
      items: [
        "开票后 1 小时内，每隔 10–12 分钟有一波未支付订单释放的回流票",
        "这个时间段是捡漏好机会",
      ],
    },
    {
      h: "其他辅助技巧",
      items: [
        "单账号多终端：略增过随机拦截概率，提升有限",
        "连点器：能小幅提速，但有被系统误判风险，需熟练",
        "冷门票种：没强偏好就选典藏票，竞争小很多",
      ],
    },
  ],
  warnings: [
    "入场严格「人票证合一」：现场直接刷本人身份证 / 护照原件入场，不能转借",
    "多证件抢到的多余门票，记得自己及时退掉",
  ],
} as const;

/* ============ 投喂 / 赞赏 ============ */
/**
 * closed=true 时点「投喂」只显示 closedMsg，不显示收款码（避免显得在圈钱）。
 * 想重新开启：把 closed 改为 false，并把真实收款码放进 public/tip/ 替换占位图。
 */
export const TIP = {
  closed: false,
  closedMsg:
    "本月的服务器费用（或咖啡配额）已达标！感谢各位金主的支持，打赏通道暂且关闭。\n\n大家赚钱都不容易，先把钱留着给自己加个鸡腿吧。如果你觉得我的内容对你有帮助，不妨把这份心意捐给红十字会，或者在应援墙留下一句鼓励即可。",
  note: "网站是用爱发电的副产品，喜欢的话可以投喂一杯快乐水～ 全凭自愿，不投也照样能用全部功能！",
  thanks: "谢谢你的投喂，魔都现场见！",
  methods: [
    { label: "微信", color: "#07c160", qr: "/tip/wechat.svg" },
    { label: "支付宝", color: "#1677ff", qr: "/tip/alipay.svg" },
  ],
} as const;

export const TICKETS = {
  /**
   * 开票时间（官方已公布）：大会员先购 6.20 12:00、一开 6.20 18:00；二开时间待官宣。
   * ⚠️ 注意 6.21 是 BML（BiliBili Macro Link 音乐会）的开票时间，不是 BW，别混。
   * saleStart 指向最早开抢时刻（大会员 6.20 12:00），驱动核心情报倒计时。
   * 二开官宣后，往 rounds 里再追加一条即可；留空 saleStart "" + rounds [] 则前台显示「待定」。
   */
  saleStart: "2026-06-20T12:00:00+08:00" as string,
  saleNote: "BW 二开时间官方尚未公布，盯紧 B 站会员购。",
  rounds: [
    { name: "大会员先购", time: "6.20 12:00" },
    { name: "一开", time: "6.20 18:00" },
  ] as { name: string; time: string }[],
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
    route: ["3H 集合分流", "4.1H", "5.1H", "5.1H / 6.1H 过道", "中央会合"],
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
    route: ["4.1H 集合分流", "3H", "2.1H", "2.1H / 1.1H 过道", "中央会合"],
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
    route: ["3H 集合分流", "4.1H", "5.1H", "5.1H / 6.1H 过道", "中央会合"],
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
    route: ["4.1H 集合分流", "3H", "2.1H", "2.1H / 1.1H 过道", "中央会合"],
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

/**
 * 7.11 当日流程（预，以当日群内通知为准）
 * 展示用「简化版」：按整点分 4 段，每段 detail 小字精确对齐 PDF 计划书流程图。
 * 简化版只负责好看好记，精确时间以 detail / TIMELINE_DETAIL 为准。
 */
export const TIMELINE = [
  { time: "14:00", label: "集合 · 整活", desc: "3H 与 4.1H 报到，时间掐死不等人", detail: "14:00 集合 · 整活" },
  { time: "15:00", label: "小合照 · 游场", desc: "各单团小合照后分流游场", detail: "15:00 四单团小合照 · 15:30 大型游场" },
  { time: "16:00", label: "大合照 · 合唱", desc: "四团齐聚，中央 IP 串烧大合唱", detail: "16:00 总剧组大合照 · 16:30 中央大合唱（《日不落》收尾）" },
  { time: "17:40", label: "聚餐 · KTV", desc: "AA 制聚餐，夜场 KTV", detail: "17:40 聚餐 · 20:00 KTV（限 18+）" },
] as const;

/**
 * PDF 计划书原始流程（7 档，精确到分钟）——喂给 AI 参谋和快捷问答，保证回答精确。
 * 与上面 TIMELINE 描述同一套流程，改任一处都要同步另一处。
 */
export const TIMELINE_DETAIL = [
  { time: "14:00", label: "集合 · 整活" },
  { time: "15:00", label: "四单团小合照" },
  { time: "15:30", label: "大型游场" },
  { time: "16:00", label: "总剧组大合照" },
  { time: "16:30", label: "中央大合唱" },
  { time: "17:40", label: "聚餐" },
  { time: "20:00", label: "KTV（限 18+）" },
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
  time: "17:40 开始",
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

/* ============ 落地情报 · 当天到场 & 现场实用信息 ============ */
/**
 * 交通数据源自计划书「关于交通（2025 年）」，往年经验总结，以现场指引为准。
 * 这是一个「攒经验」的模块——后续有新的现场实用信息，直接往这个数组加条目即可。
 */
export type FieldIntelIcon = "metro" | "taxi" | "bus" | "supplies" | "heat" | "tip";

export const FIELD_INTEL: {
  icon: FieldIntelIcon;
  title: string;
  tag?: string;
  lines: string[];
}[] = [
  {
    icon: "metro",
    title: "地铁到场",
    tag: "最稳",
    lines: [
      "「国家会展中心站」4 / 5 / 6 号口直达场馆",
      "高峰人潮汹涌，预留排队时间——14:00 集合掐死不等人",
    ],
  },
  {
    icon: "taxi",
    title: "打车 / 网约车下客点",
    lines: [
      "目的地填「诸光路 · 国家会展中心西门」",
      "出租车走诸光路西入口经 20 号门，到北厅外专用车道边下客",
      "空载出租经 18 号门进场蓄车；散场极堵，优先地铁",
    ],
  },
];

export const FIELD_INTEL_NOTE =
  "交通为往年（2025）经验总结，场馆指引与当日群通知为准。有新现场情报欢迎补充给团长。";

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

/* ============ Have your say · 应援泡泡墙 ============ */
/** 预设应援泡泡：墙上留言少时混飘，保证氛围不冷场（共享/本地两种模式都用） */
export const WALL_SEED = [
  "7.11 魔都见！",
  "崩三十周年快乐 🎂",
  "原批集合啦",
  "愿此行，终抵群星",
  "新艾利都永不落幕",
  "为世界上所有的美好而战",
  "等了一整年终于等到",
  "大合照一定要拍到我",
  "记得带糖！别低血糖",
  "今年求别下雨🙏",
  "诸光路 20 号门见",
  "8 馆全开 冲就完事了",
] as const;

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
    q: "📖 这个网站怎么用？",
    a: "欢迎接入！开机后会先弹「群公告」（抢票/活动重点，看完点「我知道了」）。然后从上往下逛：\n· 核心情报：开票/开场倒计时、集合时间地点、票价、当日流程\n· 终端授权：勾选入场协议，解锁 QQ 群号 / 拼房文档 / 团长联系方式\n· 行动纲领：选你的阵营，一键生成专属身份卡，可导出当锁屏\n· 雷达地图：看你阵营的游场路线\n· 落地情报：到场地铁口 / 打车下客点\n· 影像档案馆：往年返图横向相册\n· 应援墙：发条应援飘上墙；想给团长提建议或补交通经验，切到「建议·补充」（私发团长，不公开）\n· 页脚可投喂团长、关注作者小红书\n· 有任何问题，随时回来问我～",
  },
  {
    q: "几点在哪集合？",
    a: `7 月 11 日 14:00 集合，地点暂定 ${EVENT.rally}。\n当日流程（预）：${TIMELINE_DETAIL.map((t) => `${t.time} ${t.label}`).join(" → ")}。\n注意：时间掐死，不会等待个别人员！`,
  },
  {
    q: "怎么去会展中心？",
    a: "地铁最稳：「国家会展中心站」4/5/6 号口直达场馆。\n打车/网约车目的地填「诸光路·国家会展中心西门」，出租车走诸光路西入口经 20 号门到北厅外下客。\n散场极堵，强烈建议地铁优先。",
  },
  {
    q: "怎么进群？",
    a: `QQ 群于一开（6.20 18:00）之后开放：\n${NICKNAME_RULE}`,
  },
  {
    q: "票价和开票时间？",
    a: "游园票 128 / IP典藏票 328 / VIP 558（价格以官方为准）。\n开票：大会员先购 6.20 12:00、一开 6.20 18:00；二开时间待官宣（注意 6.21 是 BML 音乐会的，不是 BW）。\n单 UID 限购 4 张，实名绑定；14 岁以下不可入场，14-18 岁需回传承诺书。",
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
    a: "A 组在 3H 馆、B 组在 4.1H 馆分流：\n· A 组（崩坏三 & 星穹铁道）3H → 4.1H → 5.1H，经 5.1H/6.1H 过道向中央会合\n· B 组（原神 & 绝区零）4.1H → 3H → 2.1H，经 2.1H/1.1H 过道向中央会合\n详见下方「动态雷达地图」，选择你的阵营即可点亮路线。",
  },
];

/** 喂给 LLM 的完整情报（server 端 system prompt 用） */
export function buildIntelDossier(): string {
  return [
    `# ${EVENT.name} ${EVENT.crew} 完整情报`,
    `活动：${EVENT.name}，${EVENT.dateRange}，地点 ${EVENT.venue}（${EVENT.venueAddress}），${EVENT.metro}。`,
    `7 月 11 日，场内集合地点 ${EVENT.rally}。同期 ${EVENT.bml}。`,
    `团长：${EVENT.organizers.join("、")}；协助：${EVENT.assistant}。`,
    `票务：${TICKETS.prices.map((p) => `${p.name}${p.price}元`).join("/")}（价格以官方为准）。开票：${TICKETS.rounds.length ? TICKETS.rounds.map((r) => `${r.name} ${r.time}`).join("；") : "BW 一开/二开时间官方尚未公布，待官宣；注意 6.21 是 BML 音乐会的开票时间，不是 BW，不要把两者混淆"}。规则：${TICKETS.rules.join("；")}。`,
    `当日流程（预，精确）：${TIMELINE_DETAIL.map((t) => `${t.time} ${t.label}`).join("；")}。`,
    `阵营：${FACTIONS.map((f) => `${f.name}[${f.group}组]，口号「${f.slogan}」，合唱曲《${f.song}》，团长 ${f.leader.cn}（QQ ${f.leader.qq}）`).join("；")}。`,
    `游场：A组在3H馆、B组在4.1H馆分流。A组（崩三&星铁）3H→4.1H→5.1H，经5.1H/6.1H过道向中央会合；B组（原神&绝区零）4.1H→3H→2.1H，经2.1H/1.1H过道向中央会合。合唱串烧最后以《${FINALE_SONG}》收尾。`,
    `QQ群（一开后开放）：${QQ_GROUPS.map((g) => `${g.name} ${g.id}`).join("；")}。${NICKNAME_RULE}。`,
    `聚餐：${DINNER.time}；${DINNER.rules.join("；")}。`,
    `入场协议：${PROTOCOLS.join("；")}。`,
    `生存注意：${SURVIVAL.map((s) => `${s.text}（${s.why}）`).join("；")}。${SUPPLIES_NOTE}`,
    `摄影：${PHOTO_NOTE}`,
    `到场交通（2025 往年经验）：${FIELD_INTEL.map((c) => `${c.title}——${c.lines.join("，")}`).join("；")}。`,
    `人数（${CREW_STATS.asOf}）：报名 ${CREW_STATS.signedTotal}（除重 ${CREW_STATS.signedUnique}），预计场内 ${CREW_STATS.expectedTotal}（除重 ${CREW_STATS.expectedUnique}）。各团：${FACTIONS.map((f) => `${f.name} ${f.signed}`).join("、")}。`,
    `免责：${DISCLAIMERS.join("；")}。`,
    `后续：群聊长期开放不解散，将打造跨漫展 IP coser 团，不限江浙沪。`,
  ].join("\n");
}

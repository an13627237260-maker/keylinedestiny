export interface ZodiacSignInfo {
  id: string;
  name: string;
  element: "火" | "土" | "风" | "水";
  modality: "基本" | "固定" | "变动";
  ruler: string;
  personalityKeywords: string[];
  loveStyle: string;
  careerStyle: string;
  start: { month: number; day: number };
  end: { month: number; day: number };
}

export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  {
    id: "aries",
    name: "白羊座",
    element: "火",
    modality: "基本",
    ruler: "火星",
    personalityKeywords: ["主动", "直接", "热情"],
    loveStyle: "喜欢主动表达，重视行动与真诚",
    careerStyle: "适合快节奏、需要开创力的场景",
    start: { month: 3, day: 21 },
    end: { month: 4, day: 19 },
  },
  {
    id: "taurus",
    name: "金牛座",
    element: "土",
    modality: "固定",
    ruler: "金星",
    personalityKeywords: ["稳定", "务实", "感官"],
    loveStyle: "重视安全感与长期陪伴",
    careerStyle: "擅长持续积累与资源管理",
    start: { month: 4, day: 20 },
    end: { month: 5, day: 20 },
  },
  {
    id: "gemini",
    name: "双子座",
    element: "风",
    modality: "变动",
    ruler: "水星",
    personalityKeywords: ["灵活", "好奇", "沟通"],
    loveStyle: "需要精神交流与新鲜感",
    careerStyle: "适合信息、沟通、多元任务",
    start: { month: 5, day: 21 },
    end: { month: 6, day: 21 },
  },
  {
    id: "cancer",
    name: "巨蟹座",
    element: "水",
    modality: "基本",
    ruler: "月亮",
    personalityKeywords: ["敏感", "保护", "情感"],
    loveStyle: "重视情感连结与归属感",
    careerStyle: "适合照顾、服务、团队支持类工作",
    start: { month: 6, day: 22 },
    end: { month: 7, day: 22 },
  },
  {
    id: "leo",
    name: "狮子座",
    element: "火",
    modality: "固定",
    ruler: "太阳",
    personalityKeywords: ["自信", "表达", "领导"],
    loveStyle: "需要被看见与认可",
    careerStyle: "适合展示、创意、管理角色",
    start: { month: 7, day: 23 },
    end: { month: 8, day: 22 },
  },
  {
    id: "virgo",
    name: "处女座",
    element: "土",
    modality: "变动",
    ruler: "水星",
    personalityKeywords: ["细致", "分析", "完善"],
    loveStyle: "通过细节与行动表达关心",
    careerStyle: "擅长优化流程与质量控制",
    start: { month: 8, day: 23 },
    end: { month: 9, day: 22 },
  },
  {
    id: "libra",
    name: "天秤座",
    element: "风",
    modality: "基本",
    ruler: "金星",
    personalityKeywords: ["平衡", "审美", "合作"],
    loveStyle: "重视和谐与对等关系",
    careerStyle: "适合协调、设计、公关类工作",
    start: { month: 9, day: 23 },
    end: { month: 10, day: 23 },
  },
  {
    id: "scorpio",
    name: "天蝎座",
    element: "水",
    modality: "固定",
    ruler: "冥王星",
    personalityKeywords: ["深度", "专注", "转化"],
    loveStyle: "情感强烈，重视信任",
    careerStyle: "适合研究、策略、深度项目",
    start: { month: 10, day: 24 },
    end: { month: 11, day: 22 },
  },
  {
    id: "sagittarius",
    name: "射手座",
    element: "火",
    modality: "变动",
    ruler: "木星",
    personalityKeywords: ["自由", "探索", "乐观"],
    loveStyle: "需要空间与共同成长",
    careerStyle: "适合教育、旅行、拓展类工作",
    start: { month: 11, day: 23 },
    end: { month: 12, day: 21 },
  },
  {
    id: "capricorn",
    name: "摩羯座",
    element: "土",
    modality: "基本",
    ruler: "土星",
    personalityKeywords: ["责任", "结构", "目标"],
    loveStyle: "重视承诺与长期规划",
    careerStyle: "擅长规划、执行与攀登目标",
    start: { month: 12, day: 22 },
    end: { month: 1, day: 19 },
  },
  {
    id: "aquarius",
    name: "水瓶座",
    element: "风",
    modality: "固定",
    ruler: "天王星",
    personalityKeywords: ["独立", "创新", "理想"],
    loveStyle: "重视思想契合与独特连接",
    careerStyle: "适合科技、社会创新、独立项目",
    start: { month: 1, day: 20 },
    end: { month: 2, day: 18 },
  },
  {
    id: "pisces",
    name: "双鱼座",
    element: "水",
    modality: "变动",
    ruler: "海王星",
    personalityKeywords: ["直觉", "共情", "想象"],
    loveStyle: "浪漫敏感，重视灵魂共鸣",
    careerStyle: "适合艺术、疗愈、创意表达",
    start: { month: 2, day: 19 },
    end: { month: 3, day: 20 },
  },
];

function isInRange(
  month: number,
  day: number,
  start: { month: number; day: number },
  end: { month: number; day: number },
): boolean {
  const md = month * 100 + day;
  const s = start.month * 100 + start.day;
  const e = end.month * 100 + end.day;
  if (s <= e) return md >= s && md <= e;
  return md >= s || md <= e;
}

export function getZodiacSign(birthDate: string): ZodiacSignInfo {
  const [, m, d] = birthDate.split("-").map(Number);
  for (const sign of ZODIAC_SIGNS) {
    if (isInRange(m, d, sign.start, sign.end)) return sign;
  }
  return ZODIAC_SIGNS[0];
}

export function getZodiacById(id: string): ZodiacSignInfo | undefined {
  return ZODIAC_SIGNS.find((s) => s.id === id);
}

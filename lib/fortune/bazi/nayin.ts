import type { CalculationStep } from "../shared/types";
import type { Pillar } from "./ganzhi";
import type { FourPillars } from "./pillars";

export const NAYIN_TABLE: string[] = [
  "海中金", "海中金", "炉中火", "炉中火", "大林木", "大林木",
  "路旁土", "路旁土", "剑锋金", "剑锋金", "山头火", "山头火",
  "涧下水", "涧下水", "城头土", "城头土", "白蜡金", "白蜡金",
  "杨柳木", "杨柳木", "泉中水", "泉中水", "屋上土", "屋上土",
  "霹雳火", "霹雳火", "松柏木", "松柏木", "长流水", "长流水",
  "砂中金", "砂中金", "山下火", "山下火", "平地木", "平地木",
  "壁上土", "壁上土", "金箔金", "金箔金", "覆灯火", "覆灯火",
  "天河水", "天河水", "大驿土", "大驿土", "钗钏金", "钗钏金",
  "桑柘木", "桑柘木", "大溪水", "大溪水", "沙中土", "沙中土",
  "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海水",
];

const NAYIN_HINTS: Record<string, string> = {
  海中金: "深藏内敛，宜厚积薄发",
  炉中火: "精炼转化，宜专注打磨",
  大林木: "格局开阔，宜长期生长",
  路旁土: "承载过渡，宜务实稳健",
  剑锋金: "锋芒锐利，宜决断执行",
  山头火: "高远明亮，宜表达引领",
  涧下水: "细流汇聚，宜持续积累",
  城头土: "守城固本，宜稳定建设",
  白蜡金: "柔韧精炼，宜技艺专精",
  杨柳木: "随风而动，宜灵活适应",
  泉中水: "源头活水，宜启蒙创新",
  屋上土: "覆盖保护，宜守成管理",
  霹雳火: "突发变动，宜快速应变",
  松柏木: "耐寒坚韧，宜长期坚持",
  长流水: "绵延不绝，宜持续输出",
  砂中金: "细沙含金，宜挖掘潜能",
  山下火: "内敛温热，宜幕后支持",
  平地木: "广阔平展，宜基础建设",
  壁上土: "装饰防护，宜完善细节",
  金箔金: "轻薄华丽，宜形象表达",
  覆灯火: "文墨照明，宜学习研究",
  天河水: "高远流动，宜宏观视野",
  大驿土: "交通往来，宜连接资源",
  钗钏金: "精致饰品，宜审美经营",
  桑柘木: "滋养蚕桑，宜付出回馈",
  大溪水: "奔流向前，宜开拓进取",
  沙中土: "混杂积淀，宜筛选整合",
  天上火: "高远炽烈，宜理想追求",
  石榴木: "结实多子，宜成果繁衍",
  大海水: "浩瀚包容，宜胸怀格局",
};

export function getNayin(pillar: Pillar): string {
  return NAYIN_TABLE[pillar.index] ?? "未知";
}

export function analyzeNayin(pillars: FourPillars): {
  nayin: Record<string, { name: string; hint: string }>;
  step: CalculationStep;
} {
  const keys = ["year", "month", "day", "hour"] as const;
  const nayin = {} as Record<string, { name: string; hint: string }>;
  for (const k of keys) {
    const name = getNayin(pillars[k]);
    nayin[k] = { name, hint: NAYIN_HINTS[name] ?? "" };
  }
  return {
    nayin,
    step: {
      step: "nayin",
      title: "纳音五行",
      input: {},
      method: "六十甲子纳音表",
      result: nayin as unknown as Record<string, unknown>,
      notes: ["纳音为辅助参考维度"],
    },
  };
}

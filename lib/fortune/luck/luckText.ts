import type { LuckCategory, LuckScore } from "./types";
import { LUCK_CATEGORY_COLORS, LUCK_CATEGORY_LABELS } from "./types";

export function scoreToLevel(score: number): string {
  if (score >= 90) return "极佳";
  if (score >= 80) return "很好";
  if (score >= 70) return "平稳偏好";
  if (score >= 60) return "普通";
  if (score >= 50) return "需要调整";
  return "谨慎";
}

const FORBIDDEN_WORDS = ["一定", "必然", "注定", "包发财", "必脱单", "脱单", "复合", "正缘", "必定遇到", "会发财", "投资必赚", "彩票中奖"];

export function containsForbiddenText(text: string): boolean {
  return FORBIDDEN_WORDS.some((w) => text.includes(w));
}

interface TextInput {
  category: Exclude<LuckCategory, "overall">;
  score: number;
  level: string;
  keywords: string[];
  evidence: string[];
  focusArea?: string;
}

const SUMMARY_TEMPLATES: Record<
  Exclude<LuckCategory, "overall">,
  Record<string, string>
> = {
  love: {
    high: "近期在感情方面的流动感较好，适合主动表达，也适合把之前没有说清楚的话慢慢讲开。单身的人更容易在人际互动中被注意到，但不建议急着推进关系；已有关系的人适合多给对方一些肯定和回应。",
    mid: "感情状态整体平稳，适合慢慢沟通、倾听彼此需求。表达时尽量温和具体，避免带着情绪做判断，小误会也适合趁这段时间说清楚。",
    low: "这段时间情绪可能更敏感，关系里容易出现小摩擦。适合先照顾好自己的节奏，再谈深层次的承诺或变化，沟通时留一点余地会更顺。",
  },
  wealth: {
    high: "这段时间财务状态整体平稳偏顺，适合整理预算、检查支出和做长期规划。你会更容易意识到哪些钱值得花，哪些消费只是临时冲动。",
    mid: "财务方面适合稳健规划，不宜做高风险决定。涉及较大金额时，建议多比较几次，不要只凭一时感觉决定。",
    low: "这段时间花钱欲望可能偏强，适合先理清必要支出和可选消费。大额决定宜放缓，把账目和计划整理清楚再行动。",
  },
  career: {
    high: "事业方面适合稳步推进，你更适合把手头任务整理清楚，先解决具体问题，再谈大的变化。与同事或上级沟通时，表达要直接但不要太硬。",
    mid: "工作节奏宜稳不宜急，适合汇报进展、整理计划和补齐细节。遇到分歧时，先听清楚对方诉求，再提出自己的方案。",
    low: "职场压力感可能偏重，不宜和规则硬碰硬。适合把任务拆解、分清优先级，沟通方式尽量务实，避免情绪化表态。",
  },
  study: {
    high: "学习状态比前段时间更容易集中，适合整理笔记、复盘错题和建立知识框架。输出式学习会更有效，比如讲给别人听或自己写总结。",
    mid: "学习方面适合系统复习，不要只追求速度，反而要把基础重新过一遍。每天固定一小段时间专注输入，效果会比突击更好。",
    low: "注意力可能容易分散，不宜一次塞太多内容。适合缩短单次学习时长、增加休息，用清单把任务拆小会更容易坚持。",
  },
  social: {
    high: "人际互动整体平稳，适合主动联系朋友或修复小误会。你会更容易被别人看见，但说话时要注意节奏，不要因为表达太直接让对方有压力。",
    mid: "社交方面适合保持平常心，主动联系不必太刻意。倾听比说服更重要，遇到不同意见时留一点余地，关系会更轻松。",
    low: "人际上可能出现一点紧绷感，不宜急着争输赢。适合放慢语速、减少评判，小误会用简单直接的方式澄清即可。",
  },
};

const ADVICE_POOL: Record<Exclude<LuckCategory, "overall">, string[][]> = {
  love: [
    ["适合把话说清楚", "多给对方一点回应", "表达时先倾听再开口", "避免带着情绪做决定"],
    ["适合安排轻松的相处时间", "用具体行动代替猜测", "关注彼此的节奏差异", "小矛盾宜早沟通"],
    ["先照顾好自己的情绪", "不宜急着下结论", "给关系一点缓冲空间", "沟通时语气尽量柔和"],
  ],
  wealth: [
    ["适合整理预算", "检查固定支出", "做长期财务规划", "记录一周花销"],
    ["大额消费多比较几次", "区分必要与冲动消费", "稳健优先", "不宜跟风投资"],
    ["暂缓高风险决定", "先理清账目", "控制非必要开支", "把计划写下来再执行"],
  ],
  career: [
    ["适合推进手头任务", "整理工作优先级", "主动同步进展", "汇报时先给结论"],
    ["适合补齐细节", "沟通保持务实", "不宜强行突破", "把计划拆成可执行步骤"],
    ["避免和规则硬碰硬", "先减压再决策", "任务拆解后逐步完成", "注意沟通分寸"],
  ],
  study: [
    ["适合系统复习", "整理笔记框架", "输出式学习", "复盘错题"],
    ["固定每日学习时段", "基础再过一遍", "用清单追踪进度", "短时段专注更高效"],
    ["缩短单次学习时长", "减少干扰源", "任务拆小", "休息后再继续"],
  ],
  social: [
    ["适合主动联系", "倾听对方想法", "缓和小误会", "表达留余地"],
    ["保持平常心", "不宜争输赢", "多用肯定语气", "聚会宜轻松"],
    ["放慢沟通节奏", "减少评判", "简单澄清误会", "给自己独处时间"],
  ],
};

function tier(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 60) return "mid";
  return "low";
}

function humanizeEvidence(evidence: string[]): string {
  if (!evidence.length) return "";
  const top = evidence.slice(0, 2).join("；");
  return `从命理结构看，${top.replace(/十神/g, "角色能量").replace(/流年/g, "当年节奏").replace(/流日/g, "当日节奏").replace(/流月/g, "当月节奏")}。`;
}

export function buildLuckScoreText(input: TextInput): Pick<
  LuckScore,
  "summary" | "advice" | "keywords"
> {
  const t = tier(input.score);
  let summary = SUMMARY_TEMPLATES[input.category][t];
  const ev = humanizeEvidence(input.evidence);
  if (ev) summary = `${summary}${ev}`;

  while (summary.length < 150) {
    summary += " 保持平常心，把趋势当作生活参考，用行动验证会比空想更有收获。";
  }
  if (summary.length > 250) {
    summary = summary.slice(0, 248) + "…";
  }

  const adviceIdx = t === "high" ? 0 : t === "mid" ? 1 : 2;
  let advice = [...ADVICE_POOL[input.category][adviceIdx]];
  if (input.focusArea === input.category) {
    advice.unshift(`你当前关注${LUCK_CATEGORY_LABELS[input.category]}，可优先落实以上建议`);
  }
  advice = advice.slice(0, 4);

  const keywords =
    input.keywords.length > 0
      ? input.keywords
      : t === "high"
        ? ["流动顺畅", "适合行动"]
        : t === "mid"
          ? ["稳中求进", "保持节奏"]
          : ["放慢脚步", "调整状态"];

  for (const text of [summary, ...advice]) {
    if (containsForbiddenText(text)) {
      throw new Error(`文案包含禁用词: ${text}`);
    }
  }

  return { summary, advice, keywords };
}

export function buildLuckScore(
  category: Exclude<LuckCategory, "overall">,
  score: number,
  evidence: string[],
  focusArea?: string,
): LuckScore {
  const level = scoreToLevel(score);
  const text = buildLuckScoreText({
    category,
    score,
    level,
    keywords: [],
    evidence,
    focusArea,
  });

  return {
    category,
    label: LUCK_CATEGORY_LABELS[category],
    score,
    level,
    color: LUCK_CATEGORY_COLORS[category],
    evidence,
    ...text,
  };
}

export function buildHighlightsAndCautions(
  scores: LuckScore[],
): { highlights: string[]; cautions: string[] } {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const highlights = [
    `${best.label}方向相对突出（${best.score}分），${best.keywords[0] ?? "可优先把握"}`,
    sorted[1] && sorted[1].score >= 70
      ? `${sorted[1].label}也较平稳，适合同步推进`
      : "其他方向宜循序渐进",
  ].filter(Boolean) as string[];

  const cautions = [
    worst.score < 65
      ? `${worst.label}方面宜多留意（${worst.score}分），${worst.advice[0] ?? "放慢节奏"}`
      : "整体无显著短板，保持现有节奏即可",
  ];

  return { highlights, cautions };
}

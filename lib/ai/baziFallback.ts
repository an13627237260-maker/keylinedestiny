import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import { labelFocusArea, labelLuckDirection, labelStrength } from "@/lib/fortune/shared/labels";
import { STEM_ELEMENT } from "@/lib/fortune/bazi/constants";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { AiReport } from "./schemas";

type Algo = BaziAlgorithmResult;

function countHan(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function elementTrait(el: string): string {
  const map: Record<string, string> = {
    木: "生发、成长、规划与适应力",
    火: "表达、热情、行动与可见度",
    土: "稳定、承载、耐心与落地能力",
    金: "规则、判断、收敛与执行力",
    水: "思考、沟通、灵活与信息整合",
  };
  return map[el] ?? "平衡与调和";
}

function tenGodExplain(god: string): string {
  const map: Record<string, string> = {
    比肩: "重视自我立场，习惯靠自身力量推进事务",
    劫财: "竞争意识较强，在合作中需要明确边界",
    食神: "表达与创造欲较明显，适合把想法具体化",
    伤官: "思维活跃，对规则有挑战倾向，创新力强",
    偏财: "机会嗅觉灵敏，善于捕捉外部资源",
    正财: "重视稳定积累，对收支与节奏较敏感",
    七杀: "压力感与目标感并存，遇挑战时反而更能集中",
    正官: "责任感强，重视秩序、标准与外部评价",
    偏印: "直觉与独立思考突出，学习方式偏探索型",
    正印: "吸收力与依赖支持系统的能力较强",
  };
  return map[god] ?? "在命局中承担辅助性格色彩";
}

function focusSection(algo: Algo, focusArea: string): string {
  const area = labelFocusArea(focusArea);
  const dm = algo.dayMasterStrength.dayMaster;
  const dmEl = algo.dayMasterStrength.dayMasterElement;
  const dominant = algo.tenGods.dominantTendency.slice(0, 2).join("、");

  if (focusArea === "study") {
    return `【${area}重点】日主${dm}（${dmEl}）配合命局中偏明显的${dominant || "印星与食伤"}，学习优势在于：当科目需要${elementTrait(dmEl)}时，更容易进入状态。潜在阻碍来自五行${algo.fiveElements.weakestElement}偏弱，可能在需要长期枯燥重复、或高度${elementTrait(algo.fiveElements.weakestElement)}的训练上出现倦怠。适合采用“短周期复盘 + 专题突破”的方式，把大目标拆成可验证的小节点；考试前建议提前两周固定刷题时段，用错题本追踪薄弱点，而不是临时突击。`;
  }
  if (focusArea === "career") {
    return `【${area}重点】命局气势以${algo.fiveElements.strongestElement}为主导，事业上更适合在需要${elementTrait(algo.fiveElements.strongestElement)}的场景发挥。十神中${dominant || "官杀与财星"}较活跃，意味着你对责任、成果或资源流转较敏感。建议在岗位选择上优先考虑能形成可见产出的角色，并建立阶段性里程碑，避免同时铺开过多战线。`;
  }
  if (focusArea === "love") {
    return `【${area}重点】日支为夫妻宫，当前为${algo.pillars.day.branch}，与十神${algo.tenGods.pillarStemGods.month || "—"}等形成互动。感情表达上可能呈现${tenGodExplain(algo.tenGods.dominantTendency[0] || "比肩")}。建议在关系中提前沟通节奏与边界，把“期待”写成具体行为，而不是默认对方会读懂。`;
  }
  if (focusArea === "wealth") {
    return `【${area}重点】财星十神在命局中的活跃度，可通过天干${Object.values(algo.tenGods.pillarStemGods).join("、")}观察。${algo.fiveElements.strongestElement}旺时，财务风格可能偏向${elementTrait(algo.fiveElements.strongestElement)}。建议建立月度收支台账，把“可动用资金”和“长期投资”分账户管理，避免情绪化消费。`;
  }
  if (focusArea === "health") {
    return `【${area}重点】五行${algo.fiveElements.weakestElement}相对偏弱，日常可把作息、饮食与运动当作“节律管理”而非医疗诊断。日主${labelStrength(algo.dayMasterStrength.strengthLevel)}时，精力分配建议采用“高专注时段处理难事，低专注时段处理整理类事务”。`;
  }
  return `【${area}重点】结合四柱${Object.values(algo.pillarStrings).join(" ")}与五行${algo.fiveElements.strongestElement}偏旺的结构，整体气质呈现${elementTrait(algo.fiveElements.strongestElement)}。十神倾向${dominant || "多元"}，生活中宜先识别自己的默认反应模式，再在关键节点做小幅调整。`;
}

function branchRelationsText(algo: Algo): string {
  const br = algo.branchRelations;
  const parts: string[] = [];
  if (br.combinations.length) {
    parts.push(
      `六合：${br.combinations.map((c) => `${c.branches.join("")}（${c.pillars.join("·")}）`).join("；")}`,
    );
  }
  if (br.meetings.length) {
    parts.push(
      `合局：${br.meetings.map((m) => m.description).join("；")}`,
    );
  }
  if (br.clashes.length) {
    parts.push(
      `六冲：${br.clashes.map((c) => `${c.branches.join("")}（${c.pillars.join("·")}）`).join("；")}`,
    );
  }
  if (br.harms.length) {
    parts.push(
      `六害：${br.harms.map((h) => h.branches.join("")).join("、")}`,
    );
  }
  if (br.punishments.length) {
    parts.push(
      `刑：${br.punishments.map((p) => p.description).join("；")}`,
    );
  }
  if (!parts.length) {
    return "当前命局四柱地支之间未见特别突出的冲、合、刑、害组合，整体结构相对平稳。这意味着人生节奏更多由自身选择与环境机会共同塑造，而非被强烈的命局冲突反复牵引。";
  }
  return `${parts.join("。")}。这些关系提示你在人际与事件推进中，可能出现“既吸引又拉扯”或“合作中需反复磨合”的体验，宜以沟通与节奏管理来化解，不必过度解读为凶险信号。`;
}

function yearlyText(algo: Algo): string {
  if (!algo.yearlyLuck) {
    return "本次未指定目标流年。若需查看某年趋势，可在测算表单中填写“流年”年份后重新提交。";
  }
  const y = algo.yearlyLuck;
  return `目标流年${y.targetYear}，流年干支为${y.yearPillar}，相对日主的十神为${y.yearStemTenGod}。流年五行对原局可能带来补充或加重效应，宜把该年当作“主题年”来观察：${y.focusAreaHints[Object.keys(y.focusAreaHints)[0]] ?? "关注节奏与边界"}。以上仅为趋势参考，不代表某事必然发生。`;
}

function luckCycleText(algo: Algo): string {
  const lc = algo.luckCycle;
  if (!lc.cycles.length) {
    return "大运未计算（可能因性别未填写）。填写性别后可查看起运年龄与八步大运。";
  }
  const first = lc.cycles[0];
  const pillarStr = `${first.pillar.stem}${first.pillar.branch}`;
  const el = STEM_ELEMENT[first.pillar.stem];
  return `大运${labelLuckDirection(lc.direction)}，约${lc.startAge}岁起运（近似）。第一步大运为${pillarStr}（天干五行${el}），十神${first.stemTenGod}。当前阶段容易在“${tenGodExplain(first.stemTenGod)}”的主题下展开，宜结合大运五行与流年一起观察，不要单独放大某一步的影响。`;
}

function buildAdvice(algo: Algo, focusArea: string): string[] {
  const dm = algo.dayMasterStrength.dayMaster;
  const strong = algo.fiveElements.strongestElement;
  const weak = algo.fiveElements.weakestElement;
  const area = labelFocusArea(focusArea);
  return [
    `每周固定两次复盘：记录一件与${area}相关的进展、一条阻碍、一个下周可执行动作。`,
    `利用${strong}偏旺的优势，把最重要任务安排在精力高峰时段完成，避免被琐事挤占。`,
    `针对${weak}偏弱，用“微习惯”补足：例如每日10分钟整理、阅读或体能活动，坚持21天观察变化。`,
    `十神${algo.tenGods.dominantTendency[0] || "比肩"}明显时，遇到分歧先写下双方目标，再讨论方案，减少情绪对抗。`,
    `涉及节气边界或真太阳时修正的，重要节点（升学、转岗、签约）建议保留备选日期，不要把所有希望压在单一时辰。`,
    `把日主${dm}的${labelStrength(algo.dayMasterStrength.strengthLevel)}特点转化为策略：${algo.dayMasterStrength.strengthLevel === "weak" ? "先争取支持与环境，再攻坚" : algo.dayMasterStrength.strengthLevel === "strong" ? "先定边界再扩张，防止过度消耗" : "维持节律，遇变先稳住基本盘"}。`,
  ];
}

export function buildFallbackBaziReport(
  algorithmResult: Record<string, unknown>,
  focusArea: string,
): AiReport {
  const algo = algorithmResult as unknown as Algo;
  const pillars = algo.pillarStrings;
  const five = algo.fiveElements;
  const dm = algo.dayMasterStrength;
  const tg = algo.tenGods;
  const monthBranch = algo.pillars.month.branch;

  const sorted = Object.entries(five.percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([el, pct]) => `${el}${pct}%`)
    .join(" > ");

  const stemGods = Object.entries(tg.pillarStemGods)
    .map(([k, g]) => `${k === "day" ? "日" : k === "year" ? "年" : k === "month" ? "月" : "时"}干${g}`)
    .join("、");

  const hiddenGods = tg.hiddenStemGods
    .slice(0, 6)
    .map((h) => `${h.branch}藏${h.stem}(${h.god})`)
    .join("、");

  const summary = `命盘四柱：年${pillars.year}、月${pillars.month}、日${pillars.day}、时${pillars.hour}。日主${dm.dayMaster}（${dm.dayMasterElement}），月令${monthBranch}，命局气势以${five.strongestElement}为主导、${five.weakestElement}相对偏弱，整体呈现${elementTrait(five.strongestElement)}的色彩。`;

  const personality = `日主${dm.dayMaster}判为${labelStrength(dm.strengthLevel)}。支持因素：${dm.supportFactors.slice(0, 3).join("；") || "月令与天干有一定帮扶"}。消耗因素：${dm.weakeningFactors.slice(0, 3).join("；") || "克泄耗力量需留意"}。行为上可能表现为：在熟悉领域更果断，在资源不足时更谨慎；遇到压力时，${dm.strengthLevel === "weak" ? "倾向寻求协助与缓冲" : dm.strengthLevel === "strong" ? "倾向正面硬扛但需注意过劳" : "能进退有度，重在保持节奏"}。`;

  const study = focusArea === "study" ? focusSection(algo, "study") : undefined;
  const career =
    focusArea === "career" || focusArea === "overall"
      ? focusSection(algo, "career")
      : undefined;
  const love = focusArea === "love" ? focusSection(algo, "love") : undefined;
  const wealth = focusArea === "wealth" ? focusSection(algo, "wealth") : undefined;
  const health = focusArea === "health" ? focusSection(algo, "health") : undefined;

  return {
    summary,
    key_points: [
      `五行排序：${sorted}；平衡度约${five.balanceScore}分`,
      `天干十神：${stemGods}`,
      `藏干十神：${hiddenGods || "见四柱详表"}`,
      `主要十神倾向：${tg.dominantTendency.join("、")} — ${tg.dominantTendency.map(tenGodExplain).join("；")}`,
      branchRelationsText(algo),
      luckCycleText(algo),
      yearlyText(algo),
    ],
    personality,
    study,
    career,
    love,
    wealth,
    health,
    timing: yearlyText(algo),
    advice: buildAdvice(algo, focusArea),
    warnings: algo.luckCycle.warnings?.length
      ? algo.luckCycle.warnings
      : ["本地模板报告基于 algorithm_result 生成，供 OpenAI 不可用时的完整替代"],
    disclaimer: DISCLAIMER,
  };
}

export function formatBaziFallbackText(
  algorithmResult: Record<string, unknown>,
  focusArea: string,
): string {
  const report = buildFallbackBaziReport(algorithmResult, focusArea);
  const algo = algorithmResult as unknown as Algo;
  const five = algo.fiveElements;
  const dm = algo.dayMasterStrength;

  const sections = [
    "一、命盘概览",
    report.summary,
    `一句话总结：这是一张以${five.strongestElement}为气势、日主${dm.dayMaster}${labelStrength(dm.strengthLevel)}的命局，关注方向为${labelFocusArea(focusArea)}。`,

    "二、五行分析",
    `五行强弱排序：${Object.entries(five.percentages)
      .sort((a, b) => b[1] - a[1])
      .map(([el, pct]) => `${el} ${pct}%`)
      .join("、")}。`,
    `最旺五行${five.strongestElement}：${elementTrait(five.strongestElement)}，在性格与处事风格上更容易体现主导性。`,
    `最弱五行${five.weakestElement}：相关能力不是“缺失”，而是需要刻意练习与外部支持来补足，不宜简单理解为“缺什么就要补什么”。`,
    `平衡度评分${five.balanceScore}，${five.balanceScore >= 70 ? "整体分布较均衡" : five.balanceScore >= 50 ? "有一定偏向但可调和" : "偏向明显，宜有意识做节律管理"}。`,

    "三、日主强弱",
    report.personality ?? "",

    "四、十神分析",
    ...report.key_points.filter((p) => p.includes("十神") || p.includes("藏干")),

    "五、地支关系",
    report.key_points.find((p) => p.includes("六合") || p.includes("未见") || p.includes("合局") || p.includes("六冲")) ?? branchRelationsText(algo),

    `六、${labelFocusArea(focusArea)}重点`,
    focusSection(algo, focusArea),

    "七、流年简析",
    report.timing ?? yearlyText(algo),

    "八、大运简析",
    luckCycleText(algo),

    "九、实用建议",
    ...report.advice.map((a, i) => `${i + 1}. ${a}`),

    "十、声明",
    report.disclaimer,
  ];

  const text = sections.filter(Boolean).join("\n\n");
  if (countHan(text) < 800) {
    const pad = `补充说明：本报告依据传统命理规则与当前 algorithm_result 逐段生成。你的关注方向是${labelFocusArea(focusArea)}，建议把命理当作自我观察的镜子：在${five.strongestElement}旺的环境下，主动选择能发挥${elementTrait(five.strongestElement)}的任务；在${five.weakestElement}偏弱处，用稳定的小习惯建立支撑。流年、大运部分仅描述趋势，不代表具体事件必然发生。`;
    return `${text}\n\n${pad}`;
  }
  return text;
}

export function formatAiReportAsText(report: AiReport): string {
  const sections = [
    report.summary,
    ...report.key_points.map((p) => `• ${p}`),
    report.personality && `【性格】${report.personality}`,
    report.study && `【学业】${report.study}`,
    report.love && `【感情】${report.love}`,
    report.career && `【事业】${report.career}`,
    report.wealth && `【财运】${report.wealth}`,
    report.health && `【健康】${report.health}`,
    report.timing && `【流年】${report.timing}`,
    report.advice.length > 0 && `【建议】\n${report.advice.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
    report.warnings.length > 0 && `【提醒】${report.warnings.join("；")}`,
    report.disclaimer,
  ].filter(Boolean);
  return sections.join("\n\n");
}

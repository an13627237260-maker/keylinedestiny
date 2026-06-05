import type { BaziAlgorithmResult } from "../bazi";
import { generateAllLuckOverviews } from "../luck";
import {
  inferEvidencePolarity,
  stableEvidenceId,
  type EvidenceItem,
  type EvidenceSource,
} from "../rules/evidence";
import { labelFocusArea, labelStrength } from "../shared/labels";
import type { FortuneReport, ReportSection, RuleResult } from "../shared/reportTypes";
import type { BaziInput } from "../shared/validation";
import { buildReport, joinParagraphs } from "./templateEngine";

function fmtPillars(algo: BaziAlgorithmResult): string {
  const p = algo.pillarStrings;
  return `年柱${p.year}、月柱${p.month}、日柱${p.day}、时柱${p.hour}`;
}

function ev(
  source: EvidenceSource,
  category: EvidenceItem["category"],
  title: string,
  detail: string,
  weight = 2,
  extra?: Partial<EvidenceItem>,
): EvidenceItem {
  return {
    id: stableEvidenceId(`report-${source}`, `${title}:${detail}`),
    source,
    category,
    weight,
    polarity: inferEvidencePolarity(detail),
    title,
    detail,
    ...extra,
  };
}

function evidenceDetails(evidence: EvidenceItem[], limit = 5): string {
  return evidence
    .slice(0, limit)
    .map((item) => item.detail)
    .join("；");
}

function makeSection(input: {
  title: string;
  conclusion: string;
  evidence: EvidenceItem[];
  impact: string;
  advice: string;
}): ReportSection | null {
  if (!input.evidence.length) return null;
  return {
    title: input.title,
    content: joinParagraphs([
      `结论：${input.conclusion}`,
      `依据：${evidenceDetails(input.evidence)}。`,
      `影响：${input.impact}`,
      `建议：${input.advice}`,
    ]),
    evidence: input.evidence,
  };
}

function ruleEvidence(
  rules: RuleResult[],
  categories: string[],
  limit = 6,
): EvidenceItem[] {
  return rules
    .filter((r) => categories.includes(r.category))
    .flatMap((r) => r.evidence)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

function relationEvidence(algo: BaziAlgorithmResult): EvidenceItem[] {
  const br = algo.branchRelations;
  const sr = algo.stemRelations;
  const items: EvidenceItem[] = [];
  for (const r of br.combinations) {
    items.push(ev("branch_relation", "overall", "地支合", r.description, 2.1));
  }
  for (const r of br.meetings) {
    items.push(ev("branch_relation", "overall", "三合三会", r.description, 2.1));
  }
  for (const r of br.clashes) {
    items.push(ev("branch_relation", "overall", "地支冲", r.description, 2.2));
  }
  for (const r of br.harms) {
    items.push(ev("branch_relation", "overall", "六害", r.description, 1.8));
  }
  for (const r of br.punishments) {
    items.push(ev("branch_relation", "overall", "刑", r.description, 1.8));
  }
  for (const r of sr.combinations) {
    items.push(ev("stem_relation", "overall", "天干合", `${r.stems.join("")}合${r.result ?? ""}`, 2));
  }
  for (const r of sr.clashes) {
    items.push(ev("stem_relation", "overall", "天干冲", `${r.stems.join("冲")}`, 2));
  }
  if (!items.length) {
    items.push(ev("branch_relation", "overall", "关系数量", "命局未见显著天干冲合或地支合冲刑害", 1.4));
  }
  return items;
}

function sectionOverview(algo: BaziAlgorithmResult): ReportSection | null {
  const f = algo.fiveElements;
  const dm = algo.dayMasterStrength;
  const evidence = [
    ev("natal_pillar", "overall", "四柱", fmtPillars(algo), 3, {
      relatedPillars: Object.values(algo.pillarStrings),
    }),
    ev("day_master_strength", "overall", "日主", `日主${dm.dayMaster}，五行为${dm.dayMasterElement}`, 2.4),
    ev("natal_pillar", "overall", "月令", `月令为${algo.pillars.month.branch}，月柱${algo.pillarStrings.month}`, 2.2),
    ev("five_elements", "overall", "五行主气", `最旺${f.strongestElement}、最弱${f.weakestElement}，平衡度${f.balanceScore}`, 2.2),
  ];
  return makeSection({
    title: "命盘概览",
    conclusion: `此盘以${dm.dayMaster}日主为核心，四柱结构为${fmtPillars(algo)}。`,
    evidence,
    impact: `月令${algo.pillars.month.branch}与五行主气会影响日主承压、表达和取用倾向，需结合后续五行、十神和大运流年一起观察。`,
    advice: "先把四柱、日主、月令作为主轴，再阅读分项结论；单一标签不宜单独下结论。",
  });
}

function sectionFiveElements(algo: BaziAlgorithmResult): ReportSection | null {
  const f = algo.fiveElements;
  const ranking = (Object.keys(f.percentages) as Array<keyof typeof f.percentages>)
    .sort((a, b) => f.percentages[b] - f.percentages[a])
    .map((element) => `${element}${f.percentages[element].toFixed(1)}%`)
    .join("、");
  const evidence = [
    ev("five_elements", "overall", "五行排序", `五行占比排序：${ranking}`, 2.8),
    ev("five_elements", "overall", "旺弱", `最旺${f.strongestElement}，最弱${f.weakestElement}`, 2.4, {
      relatedElements: [f.strongestElement, f.weakestElement],
    }),
    ev("five_elements", "overall", "平衡度", `平衡度${f.balanceScore}`, 2),
    ev("five_elements", "overall", "季节权重", f.notes.join("；"), 1.8),
  ];
  return makeSection({
    title: "五行结构",
    conclusion: `五行呈现${f.strongestElement}较突出、${f.weakestElement}相对不足的结构。`,
    evidence,
    impact: `${f.strongestElement}的处事风格更容易被看见，${f.weakestElement}相关主题宜用习惯和环境慢慢补足。`,
    advice: "五行补偏重在作息、学习、空间和行动节奏，不宜简单理解为缺什么就补什么。",
  });
}

function sectionDayMaster(algo: BaziAlgorithmResult): ReportSection | null {
  const dm = algo.dayMasterStrength;
  const support = dm.supportFactors.join("；") || "支持因素不突出";
  const weaken = dm.weakeningFactors.join("；") || "克泄耗因素不突出";
  const evidence = [
    ev("day_master_strength", "personality", "强弱评分", `日主${dm.dayMaster}，强弱${labelStrength(dm.strengthLevel)}，得分${dm.strengthScore}`, 2.8),
    ev("day_master_strength", "personality", "得令得地得助", `支持因素：${support}`, 2.2),
    ev("day_master_strength", "personality", "克泄耗", `消耗因素：${weaken}`, 2.2),
    ev("day_master_strength", "personality", "推导", dm.reasoning.join("；") || "按月令、天干、地支根气综合评分", 2),
  ];
  return makeSection({
    title: "日主强弱",
    conclusion: `日主为${dm.dayMaster}，整体倾向为${labelStrength(dm.strengthLevel)}。`,
    evidence,
    impact: dm.strengthLevel === "strong"
      ? "主动性和主见较明显，遇到规则或合作时更需要留出协商空间。"
      : dm.strengthLevel === "weak"
        ? "对环境和压力较敏感，宜先积累资源与支持，再承担较大任务。"
        : "适应力较均衡，适合根据阶段运势选择推进或蓄势。",
    advice: "把日主强弱作为取用和行动节奏的参考，结合大运流年再决定优先级。",
  });
}

function sectionTenGods(algo: BaziAlgorithmResult): ReportSection | null {
  const tg = algo.tenGods;
  const counts = Object.entries(tg.counts)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([god, value]) => `${god}${value.toFixed(1)}`)
    .join("、");
  const hidden = tg.hiddenStemGods
    .slice(0, 8)
    .map((x) => `${x.branch}藏${x.stem}为${x.god}`)
    .join("、");
  const evidence = [
    ev("ten_gods", "overall", "天干十神", Object.entries(tg.pillarStemGods).map(([k, v]) => `${k}柱${v}`).join("；"), 2.5),
    ev("ten_gods", "overall", "藏干十神", hidden || "藏干十神计入加权统计", 2),
    ev("ten_gods", "overall", "十神计数", counts || "十神分布较均衡", 2.5),
    ev("ten_gods", "overall", "主导十神", `主导十神：${tg.dominantTendency.join("、")}`, 2.2, {
      relatedTenGods: tg.dominantTendency,
    }),
  ];
  return makeSection({
    title: "十神结构",
    conclusion: `${tg.dominantTendency.join("、") || "多元十神"}是当前命局里更醒目的十神倾向。`,
    evidence,
    impact: "十神会影响表达方式、资源处理、规则感、学习吸收与合作方式，但需要结合日主强弱判断承载方式。",
    advice: "优先观察主导十神在现实中的表现，再用规则建议做行为调整。",
  });
}

function sectionRelations(algo: BaziAlgorithmResult): ReportSection | null {
  const evidence = relationEvidence(algo);
  const hasClash = evidence.some((item) => item.detail.includes("冲") || item.detail.includes("刑") || item.detail.includes("害"));
  return makeSection({
    title: "合冲刑害",
    conclusion: hasClash ? "命局关系中存在需要放慢处理的互动信号。" : "命局天干地支关系整体较平稳。",
    evidence,
    impact: hasClash
      ? "冲刑害更像节奏提示，容易对应变动、摩擦或需要多确认的场景。"
      : "关系结构较平稳时，更适合用长期习惯和环境选择来观察变化。",
    advice: hasClash
      ? "遇到合作、亲密关系或重要决定时，先确认事实和边界，再推进下一步。"
      : "保持稳定节奏，后续重点看大运流年是否触发新的关系信号。",
  });
}

function sectionStars(algo: BaziAlgorithmResult): ReportSection | null {
  const found = algo.symbolicStars.filter((s) => s.found);
  const evidence = found.length
    ? found.map((s) =>
        ev("symbolic_star", "overall", s.name, `${s.name}命中位置${s.positions.join("、")}；${s.meaning}`, 1.8),
      )
    : [ev("symbolic_star", "overall", "神煞数量", "未见显著神煞命中", 1.2)];
  return makeSection({
    title: "神煞辅助",
    conclusion: found.length ? "神煞可作为辅助标签，不能替代四柱五行十神。" : "本盘神煞辅助信号不突出。",
    evidence,
    impact: found.length
      ? "命中的神煞提示某些气质或场景倾向，权重低于四柱、五行、十神与大运流年。"
      : "神煞不突出时，解读应回到命局主结构。",
    advice: "只把神煞作为旁证使用，优先参考前面的命局主轴。",
  });
}

function sectionPatterns(algo: BaziAlgorithmResult): ReportSection | null {
  const patterns = algo.patternTendencies ?? [];
  const evidence = patterns.flatMap((p) => [
    ev("pattern", "overall", p.patternName, `${p.patternName}，信心${p.confidence}%`, 2),
    ...p.evidence.slice(0, 2).map((detail) => ev("pattern", "overall", p.patternName, detail, 1.8)),
  ]);
  return makeSection({
    title: "格局倾向",
    conclusion: patterns.length ? `较明显的是${patterns[0].patternName}。` : "当前未形成突出的格局倾向。",
    evidence: evidence.length ? evidence : [ev("pattern", "overall", "格局数量", "未形成突出的格局倾向", 1.2)],
    impact: "格局倾向用于描述结构重点，仍需日主强弱、喜用和运势触发共同验证。",
    advice: "把格局作为观察框架，不把单个格局标签当成最终结论。",
  });
}

function sectionUsefulGods(algo: BaziAlgorithmResult): ReportSection | null {
  const ug = algo.usefulGods;
  const evidence = [
    ev("useful_god", "advice", "喜用元素", `喜用倾向：${ug.usefulElementTendency.join("、") || "随运势动态调整"}`, 2.5, {
      relatedElements: ug.usefulElementTendency,
    }),
    ev("useful_god", "advice", "忌神压力", `忌神倾向：${ug.avoidElementTendency.join("、") || "无显著单项"}`, 2.1, {
      relatedElements: ug.avoidElementTendency,
    }),
    ...ug.reasoning.map((detail) => ev("useful_god", "advice", "推导", detail, 2)),
  ];
  return makeSection({
    title: "喜用倾向",
    conclusion: `喜用更偏向${ug.usefulElementTendency.join("、") || "动态取用"}，需避开${ug.avoidElementTendency.join("、") || "过度偏颇"}。`,
    evidence,
    impact: "喜用倾向会影响建议方向，也会在大运、流年、流月出现对应五行时改变体感节奏。",
    advice: `${ug.caution}；可通过环境、作息、学习方向和行动节奏温和调节。`,
  });
}

function sectionLuckCycle(algo: BaziAlgorithmResult): ReportSection | null {
  const lc = algo.luckCycle;
  const current = lc.cycles.find((c) => {
    const target = algo.yearlyLuck?.targetYear ?? new Date().getFullYear();
    return target >= c.startYear && target <= c.endYear;
  });
  const evidence = [
    ev("luck_cycle", "timing", "起运方向", `大运${lc.direction === "forward" ? "顺排" : lc.direction === "backward" ? "逆排" : "未计算"}，起运约${lc.startAge.toFixed(1)}岁`, 2.4),
    ev("luck_cycle", "timing", "起运年龄", `起运日期约${lc.startDateApprox || "未计算"}`, 2),
    current
      ? ev("luck_cycle", "timing", "当前大运", `当前大运${current.pillar.stem}${current.pillar.branch}，十神${current.stemTenGod}，${current.startYear}-${current.endYear}年`, 2.8)
      : ev("luck_cycle", "timing", "当前大运", "未能定位当前大运，通常因性别未知或大运数据不足", 1.4),
  ];
  return makeSection({
    title: "大运趋势",
    conclusion: current ? `当前重点观察${current.pillar.stem}${current.pillar.branch}大运。` : "当前不展开具体大运判断。",
    evidence,
    impact: current
      ? "大运提供十年尺度背景，会与流年、流月共同影响阶段主题。"
      : "缺少可定位大运时，近期趋势更依赖流年、流月和流日。", 
    advice: current ? "把年度计划放在当前大运背景下校准，避免只看单日波动。" : "补充性别后再查看大运顺逆与当前大运。",
  });
}

function sectionYearly(algo: BaziAlgorithmResult): ReportSection | null {
  const y = algo.yearlyLuck;
  const evidence = y
    ? [
        ev("year_transit", "timing", "目标流年", `${y.targetYear}年流年${y.yearPillar}，流年十神${y.yearStemTenGod}`, 2.8),
        ...y.relationWithLuckCycle.map((detail) => ev("year_transit", "timing", "流年大运关系", detail, 2.2)),
        ...y.branchRelationsWithNatal.clashes.slice(0, 2).map((r) => ev("branch_relation", "timing", "流年冲", r.description, 2)),
      ]
    : [ev("year_transit", "timing", "目标流年", "未填写目标年份，本节不展开具体流年判断", 1.2)];
  return makeSection({
    title: "流年趋势",
    conclusion: y ? `${y.targetYear}年以${y.yearPillar}流年作为年度观察主轴。` : "未指定目标年份。",
    evidence,
    impact: y
      ? "流年十神与原局、大运的互动会改变一年内不同主题的轻重缓急。"
      : "缺少目标年份时，不输出年度分项趋势。",
    advice: y ? "结合十二流月安排年度节奏，趋势较强处先小步验证。" : "填写目标年份后再查看流年干支、十神与大运互动。",
  });
}

function sectionLuckOverview(algo: BaziAlgorithmResult, focusArea: string): ReportSection | null {
  const all = generateAllLuckOverviews(algo, focusArea);
  const evidence = [
    ...all.day.scores.flatMap((s) => s.evidence.slice(0, 1)),
    ...all.week.scores.flatMap((s) => s.evidence.slice(0, 1)),
    ...all.month.scores.flatMap((s) => s.evidence.slice(0, 1)),
    ...all.year.scores.flatMap((s) => s.evidence.slice(0, 1)),
  ].slice(0, 10);
  const best = [...all.day.scores].sort((a, b) => b.score - a.score)[0];
  return makeSection({
    title: "近期运势概览",
    conclusion: `日${all.day.overallScore}分、周${all.week.overallScore}分、月${all.month.overallScore}分、年${all.year.overallScore}分；今日相对突出方向为${best.label}。`,
    evidence,
    impact: `日运看流日${all.day.transitSummary.dayPillar}，月运看流月${all.month.transitSummary.monthPillar}，年运看流年${all.year.transitSummary.yearPillar}，不同周期权重不同。`,
    advice: `${best.label}方向可优先落实：${best.advice[0] ?? "稳步推进"}；分数只作趋势参考，仍以现实反馈校准。`,
  });
}

function sectionSpecificAdvice(
  algo: BaziAlgorithmResult,
  rules: RuleResult[],
  focusArea: string,
): ReportSection | null {
  const category =
    focusArea === "overall"
      ? "personality"
      : focusArea === "health"
        ? "health"
        : focusArea;
  const focusRules = rules
    .filter((r) => r.category === category || r.category === "advice")
    .filter((r) => r.evidence.length)
    .slice(0, 6);
  const evidence = focusRules.flatMap((r) => r.evidence.slice(0, 2));
  const top = focusRules[0];
  return makeSection({
    title: "具体建议",
    conclusion: top
      ? `${labelFocusArea(focusArea)}方向优先参考「${top.tags[0] ?? top.ruleId}」这类证据。`
      : `${labelFocusArea(focusArea)}方向暂未命中特别强的规则。`,
    evidence: evidence.length
      ? evidence
      : [
          ev("five_elements", "advice", "五行参考", `最弱五行为${algo.fiveElements.weakestElement}`, 1.4),
        ],
    impact: "建议来自已命中的规则证据，只描述倾向和可执行动作，不输出现实事件断语。",
    advice: focusRules.length
      ? focusRules.map((r) => `${r.message}（依据：${r.evidence[0]?.detail}）`).join(" ")
      : `围绕${algo.fiveElements.weakestElement}相关习惯做温和补足，并观察执行反馈。`,
  });
}

function buildAdvice(rules: RuleResult[], algo: BaziAlgorithmResult): string[] {
  const adviceRules = rules
    .filter((r) => r.category === "advice" && r.evidence.length)
    .slice(0, 8)
    .map((r) => `${r.message}（依据：${r.evidence[0].detail}）`);

  const otherRules = rules
    .filter((r) => r.category !== "advice" && r.evidence.length)
    .slice(0, 8)
    .map((r) => `${r.message}（依据：${r.evidence[0].detail}）`);

  const structural = [
    `根据五行结构，可温和补足${algo.fiveElements.weakestElement}相关作息与环境习惯（依据：最弱五行${algo.fiveElements.weakestElement}）。`,
    `根据日主强弱，行动节奏宜匹配${labelStrength(algo.dayMasterStrength.strengthLevel)}的承载方式（依据：日主得分${algo.dayMasterStrength.strengthScore}）。`,
  ];

  return [...adviceRules, ...otherRules, ...structural].slice(0, 12);
}

export function generateBaziReport(
  algo: BaziAlgorithmResult,
  ruleResults: RuleResult[],
  input: Pick<BaziInput, "focusArea" | "name" | "targetYear">,
): FortuneReport {
  const focusArea = input.focusArea ?? "overall";
  const namePart = input.name ? `${input.name}的` : "";
  const summaryEvidence = [
    ev("natal_pillar", "overall", "四柱", fmtPillars(algo), 3),
    ev("day_master_strength", "overall", "日主", `日主${algo.dayMasterStrength.dayMaster}，${labelStrength(algo.dayMasterStrength.strengthLevel)}`, 2.5),
    ev("five_elements", "overall", "五行", `最旺${algo.fiveElements.strongestElement}、最弱${algo.fiveElements.weakestElement}`, 2.2),
    ...ruleEvidence(ruleResults, ["personality", "advice"], 2),
  ];
  const summary = joinParagraphs([
    `${namePart}命盘以${algo.dayMasterStrength.dayMaster}日主为核心，${fmtPillars(algo)}。`,
    `五行最旺${algo.fiveElements.strongestElement}、最弱${algo.fiveElements.weakestElement}，日主${labelStrength(algo.dayMasterStrength.strengthLevel)}。`,
    `本报告依据本地 algorithm_result、rule_results 与 evidence 生成，侧重${labelFocusArea(focusArea)}，只写趋势、倾向与建议。`,
    `摘要依据：${evidenceDetails(summaryEvidence, 4)}。`,
  ]);

  const sections = [
    sectionOverview(algo),
    sectionFiveElements(algo),
    sectionDayMaster(algo),
    sectionTenGods(algo),
    sectionRelations(algo),
    sectionStars(algo),
    sectionPatterns(algo),
    sectionUsefulGods(algo),
    sectionLuckCycle(algo),
    sectionYearly(algo),
    sectionLuckOverview(algo, focusArea),
    sectionSpecificAdvice(algo, ruleResults, focusArea),
  ].filter((section): section is ReportSection => !!section);

  return buildReport(
    "传统命理报告",
    summary,
    sections,
    buildAdvice(ruleResults, algo),
  );
}

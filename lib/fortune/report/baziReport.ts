import type { BaziAlgorithmResult } from "../bazi";
import { labelFocusArea, labelStrength } from "../shared/labels";
import type { FortuneReport, RuleResult } from "../shared/reportTypes";
import type { BaziInput } from "../shared/validation";
import {
  buildReport,
  joinParagraphs,
  reportTotalChars,
  rulesToBullets,
} from "./templateEngine";

function fmtPillars(algo: BaziAlgorithmResult): string {
  const p = algo.pillarStrings;
  return `年柱 ${p.year}，月柱 ${p.month}，日柱 ${p.day}，时柱 ${p.hour}`;
}

function sectionFiveElements(algo: BaziAlgorithmResult, rules: RuleResult[]): string {
  const f = algo.fiveElements;
  const ranking = (Object.keys(f.percentages) as Array<keyof typeof f.percentages>)
    .sort((a, b) => f.percentages[b] - f.percentages[a])
    .map((e, i) => `${i + 1}. ${e}（${f.percentages[e].toFixed(1)}%）`)
    .join("；");
  const ruleText = rulesToBullets(rules, "personality", 4).join("\n");
  return joinParagraphs([
    `五行加权排序：${ranking}。`,
    `最旺五行为${f.strongestElement}，最弱为${f.weakestElement}，平衡度约 ${f.balanceScore.toFixed(0)} 分。`,
    f.notes.join(""),
    `从性格气质看，${f.strongestElement}偏旺往往带来明显的处事风格印记，而${f.weakestElement}相对偏弱时，相关能力宜通过习惯与训练补足，而非简单「缺什么补什么」。`,
    ruleText,
  ]);
}

function sectionDayMaster(algo: BaziAlgorithmResult): string {
  const dm = algo.dayMasterStrength;
  return joinParagraphs([
    `日主为${dm.dayMaster}（${dm.dayMasterElement}），强弱等级：${labelStrength(dm.strengthLevel)}，综合得分约 ${dm.strengthScore.toFixed(0)}。`,
    `得令、得地、得助与受克、泄气、耗身等因素综合后，${dm.reasoning}`,
    dm.supportFactors.length
      ? `支持因素：${dm.supportFactors.join("；")}。`
      : "",
    dm.weakeningFactors.length
      ? `消耗因素：${dm.weakeningFactors.join("；")}。`
      : "",
    `行为模式上，${labelStrength(dm.strengthLevel)}的日主往往表现为${dm.strengthLevel === "strong" ? "主见强、主动开拓，但需学会协作与妥协" : dm.strengthLevel === "weak" ? "敏感细腻、善于借力，但需避免过度承担" : "适应力强、能屈能伸，发展节奏宜结合大运"}。`,
  ]);
}

function sectionTenGods(algo: BaziAlgorithmResult, rules: RuleResult[]): string {
  const tg = algo.tenGods;
  const counts = Object.entries(tg.counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v.toFixed(1)}`)
    .join("、");
  return joinParagraphs([
    `天干十神：${Object.entries(tg.pillarStemGods).map(([k, v]) => `${k}柱 ${v}`).join("；")}。`,
    `主要十神：${tg.dominantTendency.join("、") || "分布较平均"}。`,
    `十神计数：${counts || "—"}。`,
    rulesToBullets(rules, "personality", 3).join("\n"),
    rulesToBullets(rules, "career", 2).join("\n"),
    rulesToBullets(rules, "wealth", 2).join("\n"),
  ]);
}

function sectionRelations(algo: BaziAlgorithmResult): string {
  const br = algo.branchRelations;
  const sr = algo.stemRelations;
  const parts: string[] = [];
  if (br.combinations.length) parts.push(`地支合：${br.combinations.map((c) => c.description).join("；")}`);
  if (br.meetings.length) parts.push(`三合三会：${br.meetings.map((c) => c.description).join("；")}`);
  if (br.clashes.length) parts.push(`地支冲：${br.clashes.map((c) => c.description).join("；")}`);
  if (br.harms.length) parts.push(`六害：${br.harms.map((c) => c.description).join("；")}`);
  if (br.punishments.length) parts.push(`刑：${br.punishments.map((c) => c.description).join("；")}`);
  if (sr.combinations.length) {
    parts.push(
      `天干合：${sr.combinations.map((c) => `${c.stems.join("")}合${c.result ?? ""}`).join("；")}`,
    );
  }
  if (sr.clashes.length) {
    parts.push(
      `天干冲：${sr.clashes.map((c) => c.stems.join("冲")).join("；")}`,
    );
  }
  if (!parts.length) parts.push("命局天干地支结构相对平稳，未见显著合冲刑害，整体节奏较易自我调节。");
  parts.push("以上关系仅描述倾向，不制造恐慌，亦不代表必然发生某事。");
  return joinParagraphs(parts);
}

function sectionStars(algo: BaziAlgorithmResult): string {
  const found = algo.symbolicStars.filter((s) => s.found);
  if (!found.length) return "神煞方面未见显著命中，仅以四柱五行十神为主轴解读即可。";
  return joinParagraphs(
    found.map(
      (s) =>
        `${s.name}（${s.positions.join("、")}）：${s.meaning}。${s.caution}`,
    ),
  );
}

function sectionPatterns(algo: BaziAlgorithmResult): string {
  const pts = algo.patternTendencies ?? [];
  const ug = algo.usefulGods;
  const parts: string[] = [];
  if (pts.length) {
    parts.push(
      pts
        .map(
          (p) =>
            `${p.patternName}（信心 ${p.confidence}%）：${p.evidence.join("；")}。${p.cautions[0] ?? ""}`,
        )
        .join("\n"),
    );
  }
  if (ug) {
    parts.push(
      `喜用倾向：宜倾向 ${ug.usefulElementTendency.join("、")} 相关能量；宜避免过重 ${ug.avoidElementTendency.join("、")}。${ug.reasoning.join("")} ${ug.caution}`,
    );
  }
  return joinParagraphs(parts);
}

function sectionFocus(
  algo: BaziAlgorithmResult,
  rules: RuleResult[],
  focusArea: string,
): string {
  const cat =
    focusArea === "overall"
      ? "personality"
      : focusArea === "health"
        ? "health"
        : focusArea;
  const bullets = rulesToBullets(rules, cat, 8);
  if (focusArea === "study") {
    return joinParagraphs([
      "【学业专项】",
      "学习优势：" + (bullets[0] ?? "宜结合十神结构选择学习方法。"),
      "学习阻碍：" + (bullets[1] ?? "注意分散注意力与完美主义。"),
      "适合方法：" + (bullets[2] ?? "输出式学习与框架化笔记并重。"),
      "考试策略：考前冲刺宜抓主干知识点，避免临时抱佛脚式海量刷题。",
      "长期积累：证书与作品库同步建设，让学习成果可展示、可验证。",
      ...bullets.slice(3),
    ]);
  }
  return joinParagraphs([
    `【${labelFocusArea(focusArea)}专项】`,
    ...bullets,
  ]);
}

function sectionLuck(algo: BaziAlgorithmResult): string {
  const lc = algo.luckCycle;
  const parts = [
    `大运${lc.direction === "forward" ? "顺排" : lc.direction === "backward" ? "逆排" : "未计算"}，起运约 ${lc.startAge.toFixed(1)} 岁。`,
  ];
  if (lc.cycles.length) {
    const current = lc.cycles.find(
      (c) =>
        algo.yearlyLuck &&
        c.startYear <= algo.yearlyLuck.targetYear &&
        c.endYear >= algo.yearlyLuck.targetYear,
    );
    if (current) {
      parts.push(
        `当前大运 ${current.pillar.stem}${current.pillar.branch}（${current.stemTenGod}），${current.interpretationTags?.join("；") ?? ""}`,
      );
    }
    parts.push(
      "后续大运简析：" +
        lc.cycles
          .slice(0, 5)
          .map(
            (c) =>
              `第${c.index}步 ${c.pillar.stem}${c.pillar.branch}（${c.startAge}-${c.endAge}岁）`,
          )
          .join("；"),
    );
  }
  return joinParagraphs(parts);
}

function sectionYearly(algo: BaziAlgorithmResult): string {
  const y = algo.yearlyLuck;
  if (!y) return "未指定流年年份。填写目标年份后可查看流年干支与趋势标签。";
  return joinParagraphs([
    `${y.targetYear}年流年 ${y.yearPillar}，天干十神 ${y.yearStemTenGod}。`,
    y.focusAreaHints
      ? Object.values(y.focusAreaHints).join(" ")
      : "",
    y.relationWithLuckCycle.join(" "),
  ]);
}

function sectionMonthly(algo: BaziAlgorithmResult): string {
  const m = algo.monthlyLuck;
  if (!m?.length) return "";
  return joinParagraphs(m.map((x) => x.hint));
}

function buildAdvice(algo: BaziAlgorithmResult, rules: RuleResult[]): string[] {
  const fromRules = rulesToBullets(rules, "advice", 8);
  const extra = [
    `根据五行平衡，宜关注${algo.fiveElements.weakestElement}相关生活习惯的温和补足。`,
    `十神以${algo.tenGods.dominantTendency[0] ?? "多元"}为主时，做事风格宜与之协调，避免逆流硬扛。`,
    "重大决策前可参考大运流年节奏，但不必迷信单一标签。",
    "保持学习与实践并重，命理是参考而非枷锁。",
  ];
  return [...fromRules, ...extra].slice(0, 12);
}

export function generateBaziReport(
  algo: BaziAlgorithmResult,
  ruleResults: RuleResult[],
  input: Pick<BaziInput, "focusArea" | "name" | "targetYear">,
): FortuneReport {
  const focusArea = input.focusArea ?? "overall";
  const namePart = input.name ? `${input.name}的` : "";
  const summary = joinParagraphs([
    `${namePart}命盘日主${algo.dayMasterStrength.dayMaster}，四柱 ${fmtPillars(algo)}。`,
    `五行最旺${algo.fiveElements.strongestElement}、最弱${algo.fiveElements.weakestElement}，日主${labelStrength(algo.dayMasterStrength.strengthLevel)}。`,
    `本报告由传统规则引擎与本地模板生成，侧重${labelFocusArea(focusArea)}，仅供娱乐与传统文化参考。`,
  ]);

  const sections = [
    {
      title: "命盘概览",
      content: joinParagraphs([
        fmtPillars(algo),
        `日主：${algo.dayMasterStrength.dayMaster}（${algo.dayMasterStrength.dayMasterElement}）`,
        `月令：${algo.pillars.month.branch}月`,
        `五行气势：${algo.fiveElements.strongestElement}偏旺，${algo.fiveElements.weakestElement}偏弱`,
        summary,
      ]),
    },
    {
      title: "五行格局",
      content: sectionFiveElements(algo, ruleResults),
    },
    {
      title: "日主强弱",
      content: sectionDayMaster(algo),
    },
    {
      title: "十神结构",
      content: sectionTenGods(algo, ruleResults),
    },
    {
      title: "天干地支关系",
      content: sectionRelations(algo),
    },
    {
      title: "神煞辅助",
      content: sectionStars(algo),
    },
    {
      title: "格局与喜用倾向",
      content: sectionPatterns(algo),
    },
    {
      title: `${labelFocusArea(focusArea)}专项`,
      content: sectionFocus(algo, ruleResults, focusArea),
    },
    {
      title: "大运简析",
      content: sectionLuck(algo),
    },
    {
      title: "流年简析",
      content: sectionYearly(algo),
    },
    {
      title: "未来十二个月趋势",
      content: sectionMonthly(algo) || "流月数据将随目标年份一并计算展示。",
    },
  ];

  let report = buildReport(
    "传统命理报告",
    summary,
    sections,
    buildAdvice(algo, ruleResults),
  );

  if (reportTotalChars(report) < 1200) {
    const pad = joinParagraphs([
      "命理之学重在穷理尽性，而非断人祸福。本盘各柱相互作用，形成独特的人生节奏：有时主动开拓，有时守成蓄势。",
      "阅读报告时宜结合自身经历辨识共鸣点，把建议当作生活实验的假设，而非必须应验的预言。",
      "五行、十神、神煞、格局等多维信息交织，提醒我们：人的成长从来不是单因子决定，而是环境、选择、努力与机缘共同塑造。",
      "愿你在传统文化智慧中获得启发，在现实中走出属于自己的稳健路径。",
    ]);
    report.sections.push({ title: "结语", content: pad });
  }

  return report;
}

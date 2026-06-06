import type { EvidenceItem } from "../rules/evidence";
import { inferEvidencePolarity, stableEvidenceId } from "../rules/evidence";
import type { BranchRelationsAnalysis } from "./branchRelations";
import type { DayMasterStrengthAnalysis } from "./dayMasterStrength";
import type { FiveElementsAnalysis } from "./fiveElements";
import type { FourPillars } from "./pillars";
import type { LuckCycleEntry } from "./luckCycle";
import type { TenGodsAnalysis } from "./tenGods";
import type { YearlyLuckAnalysis } from "./yearlyLuck";

export interface DomainAnalysis {
  conclusion: string;
  factors: string[];
  evidence: EvidenceItem[];
  advice: string;
  caution: string;
}

export interface CareerAnalysis extends DomainAnalysis {}
export interface WealthAnalysis extends DomainAnalysis {}
export interface FamilyAnalysis extends DomainAnalysis {}

export interface DomainAnalyses {
  career: CareerAnalysis;
  wealth: WealthAnalysis;
  family: FamilyAnalysis;
}

function ev(
  id: string,
  category: EvidenceItem["category"],
  title: string,
  detail: string,
  weight = 2,
): EvidenceItem {
  return {
    id: stableEvidenceId(`domain-${id}`, `${title}:${detail}`),
    source: "domain_analysis",
    category,
    weight,
    polarity: inferEvidencePolarity(detail),
    title,
    detail,
  };
}

function countGods(tenGods: TenGodsAnalysis, names: string[]): number {
  return names.reduce((sum, name) => sum + (tenGods.counts[name as keyof TenGodsAnalysis["counts"]] ?? 0), 0);
}

function relationTouches(
  relations: BranchRelationsAnalysis,
  pillars: Array<"year" | "month" | "day" | "hour">,
): string[] {
  return [
    ...relations.clashes,
    ...relations.harms,
    ...relations.breaks,
    ...relations.punishments,
    ...relations.combinations,
    ...relations.meetings,
  ]
    .filter((r) => r.pillars.some((p) => pillars.includes(p as "year" | "month" | "day" | "hour")))
    .map((r) => r.description);
}

export function analyzeDomainAnalyses(params: {
  pillars: FourPillars;
  tenGods: TenGodsAnalysis;
  dayMasterStrength: DayMasterStrengthAnalysis;
  fiveElements: FiveElementsAnalysis;
  branchRelations: BranchRelationsAnalysis;
  currentLuck?: LuckCycleEntry;
  annualLuck?: YearlyLuckAnalysis;
}): DomainAnalyses {
  const {
    tenGods,
    dayMasterStrength,
    fiveElements,
    branchRelations,
    currentLuck,
    annualLuck,
  } = params;
  const officer = countGods(tenGods, ["正官", "七杀"]);
  const seal = countGods(tenGods, ["正印", "偏印"]);
  const output = countGods(tenGods, ["食神", "伤官"]);
  const wealth = countGods(tenGods, ["正财", "偏财"]);
  const peer = countGods(tenGods, ["比肩", "劫财"]);
  const visibleWealth = Object.values(tenGods.pillarStemGods).some((god) =>
    god === "正财" || god === "偏财",
  );
  const rootedWealth = tenGods.hiddenStemGods.some((god) =>
    god.god === "正财" || god.god === "偏财",
  );
  const familyRelations = relationTouches(branchRelations, ["year", "month"]);
  const careerEvidence = [
    ev(
      "career-ten-gods",
      "career",
      "事业十神",
      `官杀${officer.toFixed(1)}、印星${seal.toFixed(1)}、食伤${output.toFixed(1)}、财星${wealth.toFixed(1)}，共同描述事业规则、资源、表达与任务承载。`,
      2.8,
    ),
    ev(
      "career-strength",
      "career",
      "日主承载",
      `日主${dayMasterStrength.dayMaster}强弱为${dayMasterStrength.strengthLevel}，事业推进需匹配承载度。`,
      2.4,
    ),
  ];
  if (currentLuck) {
    careerEvidence.push(
      ev(
        "career-luck",
        "career",
        "大运背景",
        `当前大运十神${currentLuck.stemTenGod}影响十年尺度事业节奏。`,
        2,
      ),
    );
  }
  if (annualLuck) {
    careerEvidence.push(
      ev(
        "career-year",
        "career",
        "流年背景",
        `${annualLuck.targetYear}年流年十神${annualLuck.yearStemTenGod}影响年度事业节奏。`,
        2,
      ),
    );
  }

  const wealthEvidence = [
    ev(
      "wealth-star",
      "wealth",
      "财星结构",
      `财星计数${wealth.toFixed(1)}，天干${visibleWealth ? "有财星透出" : "未见财星明显透出"}，地支${rootedWealth ? "有财星根气" : "财星根气不明显"}。`,
      2.8,
    ),
    ev(
      "wealth-strength",
      "wealth",
      "担财能力",
      `日主强弱为${dayMasterStrength.strengthLevel}；财星需要结合承载度与比劫竞争观察。`,
      2.4,
    ),
    ev(
      "wealth-peer",
      "wealth",
      "比劫影响",
      `比劫计数${peer.toFixed(1)}，可提示资源分配、合伙与竞争的压力或助力。`,
      2,
    ),
  ];

  const familyEvidence = [
    ev(
      "family-pillars",
      "family",
      "年柱月柱",
      `家庭责任主要参考年柱、月柱、印星与地支对年/月支的引动；印星计数${seal.toFixed(1)}。`,
      2.6,
    ),
    ev(
      "family-relations",
      "family",
      "家庭宫位关系",
      familyRelations.length
        ? `年/月支相关关系：${familyRelations.slice(0, 4).join("；")}`
        : "年/月支未见明显冲刑害破关系。",
      2.4,
    ),
    ev(
      "family-elements",
      "family",
      "五行环境",
      `五行最旺${fiveElements.strongestElement}、最弱${fiveElements.weakestElement}，家庭互动宜看环境与资源是否失衡。`,
      1.8,
    ),
  ];
  if (annualLuck?.branchRelationsWithNatal) {
    const yearlyFamily = relationTouches(annualLuck.branchRelationsWithNatal, ["year", "month"]);
    if (yearlyFamily.length) {
      familyEvidence.push(
        ev(
          "family-year",
          "family",
          "流年引动家庭宫",
          `${annualLuck.targetYear}年流年引动年/月支：${yearlyFamily.slice(0, 3).join("；")}`,
          2,
        ),
      );
    }
  }

  return {
    career: {
      conclusion:
        officer + seal >= output
          ? "事业方向更适合在规则、资质、专业体系中稳步推进。"
          : "事业方向更偏表达、输出、作品和解决具体问题。",
      factors: [
        `官杀${officer.toFixed(1)}`,
        `印星${seal.toFixed(1)}`,
        `食伤${output.toFixed(1)}`,
        `财星${wealth.toFixed(1)}`,
      ],
      evidence: careerEvidence,
      advice: "事业建议以规则、资源、表达和承载度为依据，先做可验证的小步推进。",
      caution: "事业分析为命局结构倾向，不等同于现实职业定论。",
    },
    wealth: {
      conclusion:
        wealth > 0
          ? "财运模式以财星是否透出、有根及日主是否能担财为核心。"
          : "财星不突出时，更宜先看能力积累与资源流动方式。",
      factors: [
        visibleWealth ? "财星透出" : "财星未明显透出",
        rootedWealth ? "财星有根" : "财星根气不明显",
        `比劫${peer.toFixed(1)}`,
        `日主${dayMasterStrength.strengthLevel}`,
      ],
      evidence: wealthEvidence,
      advice: "财务上宜先稳住预算、能力和合作边界，再看流年流月是否引动财星。",
      caution: "财运分析只描述资源处理倾向，不作收益承诺。",
    },
    family: {
      conclusion: familyRelations.length
        ? "家庭责任与家庭关系存在被关系结构牵动的倾向。"
        : "家庭责任主题以年柱、月柱与印星资源为主，冲动信号不突出。",
      factors: [`印星${seal.toFixed(1)}`, ...familyRelations.slice(0, 3)],
      evidence: familyEvidence,
      advice: "家庭议题宜多确认角色、边界与实际责任，避免把情绪压力直接带入沟通。",
      caution: "家庭分析只作责任与关系节奏参考，不作现实事件断语。",
    },
  };
}

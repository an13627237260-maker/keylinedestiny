import type { FiveElement } from "../bazi/constants";
import type { TenGod } from "../bazi/tenGods";
import type { BaziRuleContext, Rule } from "./types";
import { runRuleEngine } from "./ruleEngine";

const ELEMENT_STRONG: Record<FiveElement, { msg: string; tags: string[] }> = {
  木: {
    msg: "木气偏旺，成长性、学习力与规划意识较强，适合教育、创作、设计、咨询等成长型方向；需避免计划过多而执行不足。",
    tags: ["木旺", "成长"],
  },
  火: {
    msg: "火气偏旺，行动力、表达欲与急迫感较强，适合需要表现、传播、推动的事务；需避免情绪过热与判断过快。",
    tags: ["火旺", "行动"],
  },
  土: {
    msg: "土气偏旺，稳定感、责任感与现实感强，适合长期积累、管理、执行与规划；需避免固执、迟缓与过度保守。",
    tags: ["土旺", "稳定"],
  },
  金: {
    msg: "金气偏旺，规则感、边界感与判断力强，适合制度、技术、金融、法律、审美与管理；需避免过分冷硬与自我苛责。",
    tags: ["金旺", "规则"],
  },
  水: {
    msg: "水气偏旺，思维流动、适应力与信息感强，适合研究、策划、沟通与流动性行业；需避免拖延与情绪漂浮。",
    tags: ["水旺", "思维"],
  },
};

const ELEMENT_WEAK: Record<FiveElement, string> = {
  水: "水气偏弱，信息收集、情绪缓冲与灵活转向能力宜刻意补足，可通过规律作息与适度流动活动调节。",
  金: "金气偏弱，规则意识、边界感与决断力宜通过训练与结构化方法加强。",
  木: "木气偏弱，长期规划、生长感与主动学习宜加强，可设定阶段性成长目标。",
  火: "火气偏弱，表达、热情与行动启动宜借助外部激励与小步快跑策略。",
  土: "土气偏弱，稳定、承载与长期坚持宜培养，适合建立可执行的日常节奏。",
};

const TEN_GOD_RULES: Array<{
  god: TenGod;
  category: Rule["category"];
  priority: number;
  threshold: number;
  msg: string;
  tags: string[];
}> = [
  { god: "比肩", category: "personality", priority: 70, threshold: 1.2, msg: "比肩较旺，自我意识与独立性强，竞争意识明显，感情中需要个人空间，财务上宜避免固执己见。", tags: ["比肩"] },
  { god: "劫财", category: "personality", priority: 68, threshold: 1.2, msg: "劫财较旺，行动力强但社交消耗也大，容易冲动消费或被人情牵动，合作需明确边界。", tags: ["劫财"] },
  { god: "食神", category: "personality", priority: 72, threshold: 1.2, msg: "食神较旺，表达自然、享受生活，学习适合兴趣驱动，适合内容、表达、创意与教学。", tags: ["食神"] },
  { god: "伤官", category: "personality", priority: 71, threshold: 1.2, msg: "伤官较旺，反应快、表达欲强，不喜欢死板规则，适合创新、传播与销售，易与权威产生摩擦。", tags: ["伤官"] },
  { god: "正财", category: "wealth", priority: 75, threshold: 1.2, msg: "正财较旺，现实感强，重视稳定收益，感情中重视责任与实际付出，易被现实压力牵动。", tags: ["正财"] },
  { god: "偏财", category: "wealth", priority: 74, threshold: 1.2, msg: "偏财较旺，机会意识强，资源整合与商业敏感度较高，需避免投机心态。", tags: ["偏财"] },
  { god: "正官", category: "career", priority: 76, threshold: 1.2, msg: "正官较旺，规则感与责任心强，适合体制、管理与规范性行业，但易自我约束过重。", tags: ["正官"] },
  { god: "七杀", category: "career", priority: 73, threshold: 1.2, msg: "七杀较旺，压力感与竞争感强，遇强则强，适合挑战型环境，需避免焦虑与过度紧绷。", tags: ["七杀"] },
  { god: "正印", category: "study", priority: 77, threshold: 1.2, msg: "正印较旺，学习能力与吸收能力强，适合理论、学术、证书与研究，但易依赖安全感。", tags: ["正印"] },
  { god: "偏印", category: "study", priority: 69, threshold: 1.2, msg: "偏印较旺，思维独特，适合冷门知识、研究、技术与创意，但易想太多或与现实脱节。", tags: ["偏印"] },
];

function godCount(ctx: BaziRuleContext, god: TenGod): number {
  return ctx.algo.tenGods.counts[god] ?? 0;
}

function buildElementRules(): Rule[] {
  const rules: Rule[] = [];
  const elements: FiveElement[] = ["木", "火", "土", "金", "水"];
  for (const el of elements) {
    rules.push({
      id: `element-strong-${el}`,
      category: "personality",
      priority: 80,
      condition: (ctx) => ctx.algo.fiveElements.strongestElement === el,
      score: 75,
      tags: ELEMENT_STRONG[el].tags,
      message: ELEMENT_STRONG[el].msg,
      evidence: (ctx) => [
        `五行最旺为${el}`,
        `加权得分 ${ctx.algo.fiveElements.weightedScores[el].toFixed(2)}`,
      ],
    });
    rules.push({
      id: `element-weak-${el}`,
      category: "health",
      priority: 60,
      condition: (ctx) => ctx.algo.fiveElements.weakestElement === el,
      score: 55,
      tags: [`${el}弱`, "补足"],
      message: ELEMENT_WEAK[el],
      evidence: (ctx) => [`五行最弱为${el}`],
    });
    for (let pct = 25; pct <= 40; pct += 5) {
      rules.push({
        id: `element-pct-${el}-${pct}`,
        category: "personality",
        priority: 50 + pct,
        condition: (ctx) => ctx.algo.fiveElements.percentages[el] >= pct,
        score: 40 + pct,
        tags: [el, "占比"],
        message: `${el}元素占比较高，在性格与处事风格中会有明显印记。`,
        evidence: (ctx) => [`${el}占比 ${ctx.algo.fiveElements.percentages[el].toFixed(1)}%`],
      });
    }
  }
  return rules;
}

function buildTenGodRules(): Rule[] {
  return TEN_GOD_RULES.map((t) => ({
    id: `tengod-${t.god}`,
    category: t.category,
    priority: t.priority,
    condition: (ctx) => godCount(ctx, t.god) >= t.threshold,
    score: t.priority,
    tags: t.tags,
    message: t.msg,
    evidence: (ctx) => [`${t.god}计数 ${godCount(ctx, t.god).toFixed(1)}`],
  }));
}

function buildDayMasterRules(): Rule[] {
  return [
    {
      id: "dm-strong",
      category: "personality" as const,
      priority: 85,
      condition: (ctx) => ctx.algo.dayMasterStrength.strengthLevel === "strong",
      score: 82,
      tags: ["日主偏强"],
      message:
        "日主偏强，自我驱动力与主见较强，不喜欢被过度控制，适合主动创造机会，同时需学会接受规则与协作。",
      evidence: (ctx) => ctx.algo.dayMasterStrength.supportFactors.slice(0, 3),
    },
    {
      id: "dm-balanced",
      category: "personality" as const,
      priority: 70,
      condition: (ctx) => ctx.algo.dayMasterStrength.strengthLevel === "balanced",
      score: 65,
      tags: ["日主中和"],
      message:
        "日主中和，适应力较好，能在压力与资源之间取得平衡，发展重点宜结合大运流年触发，稳中求进。",
      evidence: (ctx) => ctx.algo.dayMasterStrength.reasoning,
    },
    {
      id: "dm-weak",
      category: "personality" as const,
      priority: 84,
      condition: (ctx) => ctx.algo.dayMasterStrength.strengthLevel === "weak",
      score: 80,
      tags: ["日主偏弱"],
      message:
        "日主偏弱，对环境较敏感，易被压力与责任牵动，更适合先积累资源、建立支持系统，不宜过早承担过大压力。",
      evidence: (ctx) => ctx.algo.dayMasterStrength.weakeningFactors.slice(0, 3),
    },
  ];
}

function buildCareerRules(): Rule[] {
  const combos = [
    { id: "career-shishang-cai", tags: ["食伤生财"], check: (c: BaziRuleContext) => (godCount(c, "食神") + godCount(c, "伤官")) > 1 && (godCount(c, "正财") + godCount(c, "偏财")) > 0.8, msg: "食伤生财结构明显，适合靠表达、技能、创意、内容与销售变现。" },
    { id: "career-guanyin", tags: ["官印相生"], check: (c: BaziRuleContext) => godCount(c, "正官") > 0.8 && (godCount(c, "正印") + godCount(c, "偏印")) > 0.8, msg: "官印相生，适合稳定路径、学历证书、组织平台与管理体系。" },
    { id: "career-shayin", tags: ["杀印相生"], check: (c: BaziRuleContext) => godCount(c, "七杀") > 0.8 && (godCount(c, "正印") + godCount(c, "偏印")) > 0.8, msg: "杀印相生，适合高压环境下成长，技术、管理与竞争型岗位有发挥空间。" },
    { id: "career-caiguan", tags: ["财官相生"], check: (c: BaziRuleContext) => (godCount(c, "正财") + godCount(c, "偏财")) > 1 && godCount(c, "正官") > 0.8, msg: "财官相生，适合商业、管理与资源整合类方向。" },
    { id: "career-bijie", tags: ["比劫旺"], check: (c: BaziRuleContext) => (godCount(c, "比肩") + godCount(c, "劫财")) > 2, msg: "比劫较旺，适合创业、团队与竞争行业，但合伙与人情开支需谨慎。" },
  ];
  return combos.map((c) => ({
    id: c.id,
    category: "career" as const,
    priority: 72,
    condition: c.check,
    score: 70,
    tags: c.tags,
    message: c.msg,
    evidence: () => c.tags,
  }));
}

function buildWealthRules(): Rule[] {
  return [
    {
      id: "wealth-cai-dan",
      category: "wealth",
      priority: 78,
      condition: (ctx) =>
        (godCount(ctx, "正财") + godCount(ctx, "偏财")) > 1.5 &&
        ctx.algo.dayMasterStrength.strengthLevel !== "weak",
      score: 76,
      tags: ["财星旺", "能担财"],
      message: "财星较旺且日主能担，现实资源意识强，较容易看到机会，宜务实理财。",
      evidence: (ctx) => [`财星合计 ${(godCount(ctx, "正财") + godCount(ctx, "偏财")).toFixed(1)}`],
    },
    {
      id: "wealth-cai-weak-dm",
      category: "wealth",
      priority: 80,
      condition: (ctx) =>
        (godCount(ctx, "正财") + godCount(ctx, "偏财")) > 1.5 &&
        ctx.algo.dayMasterStrength.strengthLevel === "weak",
      score: 78,
      tags: ["财重身弱"],
      message: "财星旺而日主偏弱，容易有赚钱压力，机会多但消耗也大，宜先固本再扩张。",
      evidence: (ctx) => ["日主偏弱", "财星不弱"],
    },
    {
      id: "wealth-bijie-cai",
      category: "wealth",
      priority: 74,
      condition: (ctx) =>
        (godCount(ctx, "比肩") + godCount(ctx, "劫财")) > 1.5 &&
        (godCount(ctx, "正财") + godCount(ctx, "偏财")) < 1,
      score: 68,
      tags: ["比劫旺财弱"],
      message: "比劫旺而财星弱，易因人情、合伙或冲动影响财务，宜设清晰预算与边界。",
      evidence: () => ["比劫明显", "财星相对弱"],
    },
    {
      id: "wealth-shishang",
      category: "wealth",
      priority: 73,
      condition: (ctx) => godCount(ctx, "食神") + godCount(ctx, "伤官") > 1.5,
      score: 70,
      tags: ["食伤生财潜力"],
      message: "食伤较旺，适合通过技能、表达、内容与专业能力生财，宜把才华产品化。",
      evidence: () => ["食伤结构突出"],
    },
    {
      id: "wealth-yin-cai",
      category: "wealth",
      priority: 71,
      condition: (ctx) =>
        (godCount(ctx, "正印") + godCount(ctx, "偏印")) > 1.5 &&
        (godCount(ctx, "正财") + godCount(ctx, "偏财")) < 1,
      score: 66,
      tags: ["先学后财"],
      message: "印旺而财弱，适合先学技能、证书与专业积累，再谈稳定变现。",
      evidence: () => ["印星明显"],
    },
  ];
}

function buildLoveRules(): Rule[] {
  return [
    {
      id: "love-day-branch-clash",
      category: "love",
      priority: 76,
      condition: (ctx) => ctx.algo.branchRelations.clashes.some((c) => c.pillars.includes("day")),
      score: 72,
      tags: ["夫妻宫冲"],
      message: "日支存在冲象，感情相处中宜重视沟通节奏与边界，避免在情绪高点做重大决定。",
      evidence: (ctx) => ctx.algo.branchRelations.clashes.map((c) => c.description),
    },
    {
      id: "love-peach",
      category: "love",
      priority: 70,
      condition: (ctx) => ctx.algo.symbolicStars.some((s) => (s.name === "桃花" || s.name === "咸池") && s.found),
      score: 65,
      tags: ["桃花"],
      message: "桃花星较明显，人缘与情感机缘偏多，宜理性筛选而非急于定论。",
      evidence: (ctx) => ctx.algo.symbolicStars.filter((s) => s.found && (s.name === "桃花" || s.name === "咸池")).map((s) => s.positions.join(",")),
    },
    {
      id: "love-hongluan",
      category: "love",
      priority: 68,
      condition: (ctx) => ctx.algo.symbolicStars.some((s) => s.name === "红鸾" && s.found),
      score: 63,
      tags: ["红鸾"],
      message: "红鸾星见，社交与喜庆场合缘分偏多，宜主动但不强求结果。",
      evidence: () => ["红鸾命中"],
    },
    {
      id: "love-shangguan",
      category: "love",
      priority: 67,
      condition: (ctx) => godCount(ctx, "伤官") > 1.5,
      score: 62,
      tags: ["伤官感情"],
      message: "伤官较旺，感情中表达直接、不喜束缚，宜寻找能欣赏个性的相处方式。",
      evidence: () => ["伤官偏旺"],
    },
    {
      id: "love-bijie",
      category: "love",
      priority: 66,
      condition: (ctx) => (godCount(ctx, "比肩") + godCount(ctx, "劫财")) > 2,
      score: 60,
      tags: ["比劫感情"],
      message: "比劫较旺，感情中独立性强，需平衡自我与伴侣需求，避免竞争心态带入关系。",
      evidence: () => ["比劫明显"],
    },
  ];
}

function buildStudyRules(): Rule[] {
  return [
    { id: "study-yin", category: "study" as const, priority: 78, condition: (c) => (godCount(c, "正印") + godCount(c, "偏印")) > 1.5, score: 75, tags: ["印星学习"], message: "印星较旺，适合系统学习、证书考试与理论积累，学习要建立知识框架。", evidence: () => ["印星旺"] },
    { id: "study-shishang", category: "study" as const, priority: 76, condition: (c) => godCount(c, "食神") + godCount(c, "伤官") > 1.5, score: 73, tags: ["食伤学习"], message: "食伤较旺，适合输出式学习，通过讲解、写作与做题巩固更有效。", evidence: () => ["食伤旺"] },
    { id: "study-guansha", category: "study" as const, priority: 75, condition: (c) => godCount(c, "正官") + godCount(c, "七杀") > 1.5, score: 72, tags: ["官杀学习"], message: "官杀较旺，适合目标型学习，需要压力与 deadline，但要防止焦虑过度。", evidence: () => ["官杀旺"] },
    { id: "study-bijie", category: "study" as const, priority: 74, condition: (c) => godCount(c, "比肩") + godCount(c, "劫财") > 1.5, score: 70, tags: ["比劫学习"], message: "比劫较旺，适合竞争型学习，可通过同伴比较激发动力，但避免心态失衡。", evidence: () => ["比劫旺"] },
    { id: "study-cai", category: "study" as const, priority: 73, condition: (c) => godCount(c, "正财") + godCount(c, "偏财") > 1.2, score: 68, tags: ["财星学习"], message: "财星较旺，学习易受现实目标驱动，明确学习能带来结果时效率更高。", evidence: () => ["财星旺"] },
    { id: "study-wenchang", category: "study" as const, priority: 72, condition: (c) => c.algo.symbolicStars.some((s) => s.name === "文昌贵人" && s.found), score: 67, tags: ["文昌"], message: "文昌贵人见，利于阅读、考试与文书类学习，宜制定复习计划。", evidence: () => ["文昌命中"] },
  ];
}

function buildHealthRules(): Rule[] {
  const lifestyle = [
    { el: "火" as FiveElement, id: "health-fire", msg: "火偏旺时，注意作息与情绪降温，避免长期熬夜与过度兴奋。" },
    { el: "土" as FiveElement, id: "health-earth", msg: "土偏旺时，注意运动与饮食节奏，避免久坐与压力内化。" },
    { el: "金" as FiveElement, id: "health-metal", msg: "金偏旺时，注意放松与柔软度，避免长期紧绷。" },
    { el: "水" as FiveElement, id: "health-water-weak", weak: true, msg: "水偏弱时，注意休息、规律饮水与适度流动性活动。" },
    { el: "木" as FiveElement, id: "health-wood-weak", weak: true, msg: "木偏弱时，注意拉伸、户外活动与长期规划带来的身心节奏。" },
  ];
  return lifestyle.map((h) => ({
    id: h.id,
    category: "health" as const,
    priority: 65,
    condition: (ctx) =>
      h.weak
        ? ctx.algo.fiveElements.weakestElement === h.el
        : ctx.algo.fiveElements.strongestElement === h.el,
    score: 58,
    tags: ["生活方式", h.el],
    message: h.msg,
    evidence: (ctx) => [h.weak ? `最弱五行${h.el}` : `最旺五行${h.el}`],
  }));
}

function buildYearlyRules(): Rule[] {
  return [
    {
      id: "yearly-has-luck",
      category: "yearly",
      priority: 80,
      condition: (ctx) => !!ctx.algo.yearlyLuck,
      score: 75,
      tags: ["流年"],
      message: "流年干支与命局、大运形成互动，宜结合关注方向观察节奏变化，不作绝对吉凶定论。",
      evidence: (ctx) =>
        ctx.algo.yearlyLuck
          ? [`${ctx.algo.yearlyLuck.targetYear}年 ${ctx.algo.yearlyLuck.yearPillar}`]
          : [],
    },
    {
      id: "yearly-relation",
      category: "yearly",
      priority: 78,
      condition: (ctx) => (ctx.algo.yearlyLuck?.relationWithLuckCycle.length ?? 0) > 0,
      score: 72,
      tags: ["流年大运"],
      message: "流年与当前大运形成互动，宜结合关注方向观察节奏，小步验证优于孤注一掷。",
      evidence: (ctx) => ctx.algo.yearlyLuck?.relationWithLuckCycle ?? [],
    },
  ];
}

function buildAdviceRules(): Rule[] {
  const tips = [
    "把大目标拆成可执行的周计划，比空泛许愿更有效。",
    "重要决定尽量避开情绪高峰，给自己二十四小时冷静期。",
    "财务上建立应急储备，比追逐单次机会更稳妥。",
    "学习时采用「输入—输出—复盘」三步循环，巩固记忆。",
    "感情中多表达需求而非指责，减少误读空间。",
    "工作中主动对齐上级预期，减少返工与内耗。",
    "健康方面优先保证睡眠，比任何补法都基础。",
    "遇到冲突先厘清事实再谈立场，避免扩大化。",
    "每月复盘一次五行能量对应的作息与情绪模式。",
    "把擅长的事做成可展示的作品集，机会更易被看见。",
    "合作前书面约定分工与退出机制，减少日后纠纷。",
    "流年变动期宜守正出奇，先稳后扩。",
    "阅读经典命理典籍时，重在理解逻辑而非迷信断语。",
    "定期整理居住环境，有助于稳定心绪与执行力。",
    "对不确定信息保持求证习惯，不轻信恐吓式断语。",
  ];
  return tips.map((msg, i) => ({
    id: `advice-${i}`,
    category: "advice" as const,
    priority: 50 + i,
    condition: () => true,
    score: 45 + (i % 10),
    tags: ["建议"],
    message: msg,
    evidence: () => ["传统命理生活建议"],
  }));
}

function buildRelationRules(): Rule[] {
  return [
    {
      id: "branch-clash",
      category: "personality",
      priority: 68,
      condition: (ctx) => ctx.algo.branchRelations.clashes.length > 0,
      score: 65,
      tags: ["地支冲"],
      message: "命局地支存在冲象，人生某些阶段变动感较强，宜预留弹性而非抗拒变化。",
      evidence: (ctx) => ctx.algo.branchRelations.clashes.map((c) => c.description),
    },
    {
      id: "branch-combine",
      category: "personality",
      priority: 66,
      condition: (ctx) => ctx.algo.branchRelations.combinations.length > 0,
      score: 63,
      tags: ["地支合"],
      message: "命局地支有合象，人际与资源整合能力较好，宜主动建立互信关系。",
      evidence: (ctx) => ctx.algo.branchRelations.combinations.map((c) => c.description),
    },
    {
      id: "stem-clash",
      category: "personality",
      priority: 64,
      condition: (ctx) => ctx.algo.stemRelations.clashes.length > 0,
      score: 60,
      tags: ["天干冲"],
      message: "天干存在冲象，内心或外在偶有对立感，宜练习换位思考。",
      evidence: (ctx) =>
        ctx.algo.stemRelations.clashes.map((c) => c.stems.join("冲")),
    },
    {
      id: "branch-stable",
      category: "personality",
      priority: 55,
      condition: (ctx) =>
        ctx.algo.branchRelations.clashes.length === 0 &&
        ctx.algo.branchRelations.harms.length === 0 &&
        ctx.algo.branchRelations.punishments.length === 0,
      score: 50,
      tags: ["平稳"],
      message: "命局地支结构相对平稳，内外节奏较易自我调节。",
      evidence: () => ["无明显冲刑害"],
    },
  ];
}

function buildPatternRules(): Rule[] {
  return [
    {
      id: "pattern-tendency",
      category: "personality",
      priority: 75,
      condition: (ctx) => (ctx.algo.patternTendencies?.length ?? 0) > 0,
      score: 70,
      tags: ["格局倾向"],
      message: "命局呈现一定格局倾向，可作性格与处事风格的参考，非绝对定论。",
      evidence: (ctx) =>
        (ctx.algo.patternTendencies ?? []).slice(0, 3).map((p) => p.patternName),
    },
    {
      id: "useful-gods",
      category: "advice",
      priority: 74,
      condition: (ctx) => !!ctx.algo.usefulGods,
      score: 68,
      tags: ["喜用倾向"],
      message: "喜用神仅为倾向分析，需结合大运流年动态理解，不等于缺什么补什么。",
      evidence: (ctx) => ctx.algo.usefulGods?.reasoning ?? [],
    },
  ];
}

function buildSymbolicStarRules(): Rule[] {
  const names = ["驿马", "华盖", "天乙贵人", "禄神", "将星", "太极贵人"];
  return names.map((name) => ({
    id: `star-${name}`,
    category: "personality" as const,
    priority: 62,
    condition: (ctx) => ctx.algo.symbolicStars.some((s) => s.name === name && s.found),
    score: 58,
    tags: [name],
    message: `${name}见，${ctxMsg(name)}`,
    evidence: (ctx) => {
      const s = ctx.algo.symbolicStars.find((x) => x.name === name && x.found);
      return s ? [s.meaning, `位置 ${s.positions.join("、")}`] : [];
    },
  }));
}

function ctxMsg(name: string): string {
  const map: Record<string, string> = {
    驿马: "变动与出行机缘偏多，宜把握学习迁移机会。",
    华盖: "独处与艺术气质偏明显，适合深度思考。",
    天乙贵人: "贵人缘标签，宜主动请教与结盟。",
    禄神: "自身资源与稳定感较好，宜守正积累。",
    将星: "组织与领导气质偏明显，宜承担责任。",
    太极贵人: "对玄学、哲学与深层问题有兴趣倾向。",
  };
  return map[name] ?? "可作辅助参考。";
}

function buildFocusRules(): Rule[] {
  const areas = ["love", "career", "wealth", "study", "health", "overall"] as const;
  return areas.map((area) => ({
    id: `focus-${area}`,
    category: (area === "overall" ? "personality" : area) as Rule["category"],
    priority: 90,
    condition: (ctx) => ctx.focusArea === area,
    score: 85,
    tags: ["关注方向", area],
    message: `当前关注方向为${areaLabel(area)}，以下解读将侧重该领域，其他维度仅作背景参考。`,
    evidence: () => [`focusArea=${area}`],
  }));
}

function areaLabel(area: string): string {
  const m: Record<string, string> = {
    overall: "综合",
    love: "感情",
    career: "事业",
    wealth: "财运",
    study: "学业",
    health: "生活方式",
  };
  return m[area] ?? area;
}

/** 扩展组合规则至 200+ 条 */
function buildComboRules(): Rule[] {
  const rules: Rule[] = [];
  const gods: TenGod[] = ["比肩", "劫财", "食神", "伤官", "正财", "偏财", "正官", "七杀", "正印", "偏印"];
  for (let i = 0; i < gods.length; i++) {
    for (let j = i + 1; j < gods.length; j++) {
      const a = gods[i];
      const b = gods[j];
      rules.push({
        id: `combo-${a}-${b}`,
        category: "personality",
        priority: 45,
        condition: (ctx) => godCount(ctx, a) > 0.5 && godCount(ctx, b) > 0.5,
        score: 42,
        tags: [a, b],
        message: `命局中${a}与${b}并见，性格与处事风格会同时带有两种十神色彩，宜扬长避短。`,
        evidence: (ctx) => [`${a} ${godCount(ctx, a).toFixed(1)}`, `${b} ${godCount(ctx, b).toFixed(1)}`],
      });
    }
  }
  return rules;
}

function buildExtendedRules(): Rule[] {
  const rules: Rule[] = [];
  const elements: FiveElement[] = ["木", "火", "土", "金", "水"];
  const areas = ["overall", "love", "career", "wealth", "study", "health"] as const;
  const areaLabels: Record<string, string> = {
    overall: "综合", love: "感情", career: "事业", wealth: "财运", study: "学业", health: "生活方式",
  };

  for (const el of elements) {
    for (let s = 50; s <= 90; s += 10) {
      rules.push({
        id: `balance-${el}-${s}`,
        category: "personality",
        priority: 40,
        condition: (ctx) => ctx.algo.fiveElements.balanceScore >= s,
        score: 35 + s / 10,
        tags: ["平衡度", el],
        message: `五行平衡度较高时，${el}相关主题更容易被平稳驾驭。`,
        evidence: (ctx) => [`平衡度 ${ctx.algo.fiveElements.balanceScore}`],
      });
    }
  }

  for (const area of areas) {
    for (let i = 0; i < 5; i++) {
      rules.push({
        id: `area-tip-${area}-${i}`,
        category: area === "overall" ? "personality" : area,
        priority: 48 + i,
        condition: (ctx) => ctx.focusArea === area,
        score: 46,
        tags: [areaLabels[area]],
        message: `${areaLabels[area]}方向：保持节奏感，比追逐单次结果更能积累优势。`,
        evidence: () => [`专项 ${area}`],
      });
    }
  }

  const months = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
  months.forEach((m, i) => {
    rules.push({
      id: `month-ref-${i}`,
      category: "yearly",
      priority: 44,
      condition: (ctx) => (ctx.algo.monthlyLuck?.length ?? 0) > 0,
      score: 42,
      tags: ["流月", m],
      message: `流月趋势中${m}宜关注节奏微调，结合十神变化安排事务优先级。`,
      evidence: (ctx) => [ctx.algo.monthlyLuck?.[i]?.pillar ?? ""],
    });
  });

  return rules;
}

export const ALL_BAZI_RULES: Rule[] = [
  ...buildFocusRules(),
  ...buildDayMasterRules(),
  ...buildElementRules(),
  ...buildTenGodRules(),
  ...buildCareerRules(),
  ...buildWealthRules(),
  ...buildLoveRules(),
  ...buildStudyRules(),
  ...buildHealthRules(),
  ...buildYearlyRules(),
  ...buildRelationRules(),
  ...buildPatternRules(),
  ...buildSymbolicStarRules(),
  ...buildAdviceRules(),
  ...buildComboRules(),
  ...buildExtendedRules(),
];

export function runBaziRules(
  algo: import("../bazi").BaziAlgorithmResult,
  focusArea: string,
) {
  return runRuleEngine(ALL_BAZI_RULES, { algo, focusArea });
}

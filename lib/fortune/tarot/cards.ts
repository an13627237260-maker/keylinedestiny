import type { TarotCardDefinition, TarotSuit } from "./types";

type MajorSeed = {
  id: string;
  number: number;
  nameCn: string;
  nameEn: string;
  uprightKeywords: string[];
  reversedKeywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
};

const MAJOR_ARCANA: MajorSeed[] = [
  {
    id: "major-fool",
    number: 0,
    nameCn: "愚者",
    nameEn: "The Fool",
    uprightKeywords: ["开始", "自由", "冒险", "信任"],
    reversedKeywords: ["鲁莽", "逃避", "准备不足", "不稳定"],
    uprightMeaning: "正位的愚者代表新的开始、开放心态和愿意尝试未知。",
    reversedMeaning: "逆位的愚者提醒你不要只凭冲动行动，当前需要更多准备。",
  },
  {
    id: "major-magician",
    number: 1,
    nameCn: "魔术师",
    nameEn: "The Magician",
    uprightKeywords: ["行动", "资源", "创造", "表达"],
    reversedKeywords: ["分散", "操控", "虚张", "资源错配"],
    uprightMeaning: "正位的魔术师表示资源已经在手，关键在于集中意图并开始执行。",
    reversedMeaning: "逆位的魔术师提示能力与资源尚未整合，表达和行动可能不够一致。",
  },
  {
    id: "major-high-priestess",
    number: 2,
    nameCn: "女祭司",
    nameEn: "The High Priestess",
    uprightKeywords: ["直觉", "沉静", "洞察", "保留"],
    reversedKeywords: ["隐瞒", "迟疑", "误判", "过度封闭"],
    uprightMeaning: "正位的女祭司代表内在直觉、观察力和暂时不急着表态的智慧。",
    reversedMeaning: "逆位的女祭司提醒你不要被猜测带走，也不要把重要信息长期压住。",
  },
  {
    id: "major-empress",
    number: 3,
    nameCn: "女皇",
    nameEn: "The Empress",
    uprightKeywords: ["滋养", "丰盛", "关系", "创造"],
    reversedKeywords: ["依赖", "消耗", "过度照顾", "停滞"],
    uprightMeaning: "正位的女皇象征滋养、创造力和把想法落到生活中的能力。",
    reversedMeaning: "逆位的女皇提醒你关注消耗与边界，避免只给予而忽略自身。",
  },
  {
    id: "major-emperor",
    number: 4,
    nameCn: "皇帝",
    nameEn: "The Emperor",
    uprightKeywords: ["秩序", "责任", "结构", "掌控"],
    reversedKeywords: ["僵硬", "控制", "抗拒", "压力"],
    uprightMeaning: "正位的皇帝代表结构、责任和建立稳定规则的力量。",
    reversedMeaning: "逆位的皇帝提示规则可能过紧，或你正在抗拒必要的责任。",
  },
  {
    id: "major-hierophant",
    number: 5,
    nameCn: "教皇",
    nameEn: "The Hierophant",
    uprightKeywords: ["传统", "学习", "规范", "指导"],
    reversedKeywords: ["教条", "盲从", "束缚", "质疑"],
    uprightMeaning: "正位的教皇代表学习传统方法、寻求指导和遵循成熟路径。",
    reversedMeaning: "逆位的教皇提醒你分辨规则是否适合当下，不宜盲目套用旧答案。",
  },
  {
    id: "major-lovers",
    number: 6,
    nameCn: "恋人",
    nameEn: "The Lovers",
    uprightKeywords: ["选择", "联结", "价值", "关系"],
    reversedKeywords: ["摇摆", "失衡", "逃避选择", "价值冲突"],
    uprightMeaning: "正位的恋人代表重要选择、真诚联结和价值观的对齐。",
    reversedMeaning: "逆位的恋人提示关系或选择中存在摇摆，需要先厘清真实需求。",
  },
  {
    id: "major-chariot",
    number: 7,
    nameCn: "战车",
    nameEn: "The Chariot",
    uprightKeywords: ["推进", "意志", "胜任", "方向"],
    reversedKeywords: ["失控", "急躁", "方向混乱", "拉扯"],
    uprightMeaning: "正位的战车表示目标感增强，适合用纪律和行动推动局面。",
    reversedMeaning: "逆位的战车提醒你先校准方向，避免用蛮力推进复杂问题。",
  },
  {
    id: "major-strength",
    number: 8,
    nameCn: "力量",
    nameEn: "Strength",
    uprightKeywords: ["勇气", "耐心", "温柔", "自控"],
    reversedKeywords: ["失衡", "压抑", "焦躁", "自我怀疑"],
    uprightMeaning: "正位的力量代表温和但坚定的控制力，以及面对问题的耐心。",
    reversedMeaning: "逆位的力量提醒你不要压抑情绪，真正的稳定来自理解而非硬撑。",
  },
  {
    id: "major-hermit",
    number: 9,
    nameCn: "隐士",
    nameEn: "The Hermit",
    uprightKeywords: ["独处", "内省", "寻找", "沉淀"],
    reversedKeywords: ["孤立", "退缩", "迷失", "拒绝帮助"],
    uprightMeaning: "正位的隐士表示需要安静梳理，答案更可能来自深度观察。",
    reversedMeaning: "逆位的隐士提醒你不要把独处变成隔绝，必要时应主动求助。",
  },
  {
    id: "major-wheel-of-fortune",
    number: 10,
    nameCn: "命运之轮",
    nameEn: "Wheel of Fortune",
    uprightKeywords: ["转机", "循环", "变化", "时机"],
    reversedKeywords: ["停滞", "反复", "抗拒变化", "节奏错位"],
    uprightMeaning: "正位的命运之轮代表阶段转换和外部节奏正在变化。",
    reversedMeaning: "逆位的命运之轮提示你可能卡在旧循环里，需要调整应对方式。",
  },
  {
    id: "major-justice",
    number: 11,
    nameCn: "正义",
    nameEn: "Justice",
    uprightKeywords: ["公平", "判断", "契约", "责任"],
    reversedKeywords: ["偏见", "失衡", "逃责", "信息不足"],
    uprightMeaning: "正位的正义强调事实、规则、责任和清晰判断。",
    reversedMeaning: "逆位的正义提醒你避免带着偏见下结论，也要补齐关键资料。",
  },
  {
    id: "major-hanged-man",
    number: 12,
    nameCn: "倒吊人",
    nameEn: "The Hanged Man",
    uprightKeywords: ["暂停", "换位", "牺牲", "等待"],
    reversedKeywords: ["拖延", "僵持", "无效付出", "拒绝转念"],
    uprightMeaning: "正位的倒吊人表示暂停不是失败，而是需要换角度看问题。",
    reversedMeaning: "逆位的倒吊人提示等待可能已经变成拖延，需要重新评估投入。",
  },
  {
    id: "major-death",
    number: 13,
    nameCn: "死神",
    nameEn: "Death",
    uprightKeywords: ["结束", "转化", "清理", "重生"],
    reversedKeywords: ["抗拒", "拖延结束", "旧模式", "停滞"],
    uprightMeaning: "正位的死神代表旧阶段的结束和新结构的形成。",
    reversedMeaning: "逆位的死神提醒你不要执着旧模式，越拖延越消耗能量。",
  },
  {
    id: "major-temperance",
    number: 14,
    nameCn: "节制",
    nameEn: "Temperance",
    uprightKeywords: ["调和", "耐心", "整合", "修复"],
    reversedKeywords: ["失衡", "过量", "急躁", "配合困难"],
    uprightMeaning: "正位的节制代表调和不同力量，适合用耐心修复关系与节奏。",
    reversedMeaning: "逆位的节制提示节奏失衡，需要减少极端做法和过量投入。",
  },
  {
    id: "major-devil",
    number: 15,
    nameCn: "恶魔",
    nameEn: "The Devil",
    uprightKeywords: ["欲望", "束缚", "沉迷", "现实牵引"],
    reversedKeywords: ["松绑", "觉察", "戒断", "挣脱"],
    uprightMeaning: "正位的恶魔提示欲望、依赖或现实利益正在牵动判断。",
    reversedMeaning: "逆位的恶魔表示你开始看见束缚，也有机会逐步拿回主动权。",
  },
  {
    id: "major-tower",
    number: 16,
    nameCn: "高塔",
    nameEn: "The Tower",
    uprightKeywords: ["冲击", "揭露", "重建", "突破"],
    reversedKeywords: ["延迟冲突", "回避真相", "内在震荡", "缓慢重建"],
    uprightMeaning: "正位的高塔代表旧结构被打破，真相或问题变得难以忽视。",
    reversedMeaning: "逆位的高塔提示冲击可能转为内在压力，仍需要面对结构问题。",
  },
  {
    id: "major-star",
    number: 17,
    nameCn: "星星",
    nameEn: "The Star",
    uprightKeywords: ["希望", "疗愈", "信念", "灵感"],
    reversedKeywords: ["失望", "疲惫", "信心不足", "等待恢复"],
    uprightMeaning: "正位的星星代表恢复、希望和愿意重新相信未来。",
    reversedMeaning: "逆位的星星提醒你先照顾疲惫感，信心需要通过小成果恢复。",
  },
  {
    id: "major-moon",
    number: 18,
    nameCn: "月亮",
    nameEn: "The Moon",
    uprightKeywords: ["潜意识", "迷雾", "情绪", "直觉"],
    reversedKeywords: ["看清", "焦虑", "误解", "信息浮现"],
    uprightMeaning: "正位的月亮代表情绪与不确定性增强，需要分辨直觉和恐惧。",
    reversedMeaning: "逆位的月亮表示迷雾正在散开，但仍要避免被焦虑推着走。",
  },
  {
    id: "major-sun",
    number: 19,
    nameCn: "太阳",
    nameEn: "The Sun",
    uprightKeywords: ["清晰", "活力", "成功", "坦诚"],
    reversedKeywords: ["延迟", "过度乐观", "消耗", "光芒不足"],
    uprightMeaning: "正位的太阳代表清晰、活力和较容易被看见的成果。",
    reversedMeaning: "逆位的太阳提醒你不要过度乐观，成果仍需稳定维护。",
  },
  {
    id: "major-judgement",
    number: 20,
    nameCn: "审判",
    nameEn: "Judgement",
    uprightKeywords: ["唤醒", "复盘", "决定", "更新"],
    reversedKeywords: ["逃避总结", "拖延决定", "自责", "旧账"],
    uprightMeaning: "正位的审判代表重新评估过去，并做出更成熟的选择。",
    reversedMeaning: "逆位的审判提示你可能仍困在旧评价里，需要从事实出发复盘。",
  },
  {
    id: "major-world",
    number: 21,
    nameCn: "世界",
    nameEn: "The World",
    uprightKeywords: ["完成", "整合", "阶段成果", "圆满"],
    reversedKeywords: ["未完成", "收尾拖延", "缺口", "循环未闭合"],
    uprightMeaning: "正位的世界代表阶段完成、资源整合和更完整的视野。",
    reversedMeaning: "逆位的世界提醒你还有收尾工作，缺口补齐后成果更稳。",
  },
];

const SUIT_DATA: Record<
  Exclude<TarotSuit, "major">,
  {
    cn: string;
    en: string;
    theme: string;
    love: string;
    career: string;
    wealth: string;
    study: string;
    keywords: string[];
    reversedKeywords: string[];
  }
> = {
  wands: {
    cn: "权杖",
    en: "Wands",
    theme: "行动力、热情、创造与主动推进",
    love: "感情上强调主动表达、热度和相处节奏。",
    career: "事业上强调行动、竞争、项目推进和个人表现。",
    wealth: "财富上强调机会意识和开拓，但需要控制冲动。",
    study: "学习上强调动力、输出和持续练习。",
    keywords: ["行动", "热情"],
    reversedKeywords: ["急躁", "分散"],
  },
  cups: {
    cn: "圣杯",
    en: "Cups",
    theme: "情绪、关系、感受与内在满足",
    love: "感情上强调感受流动、亲密回应和情绪照顾。",
    career: "事业上强调团队氛围、兴趣和价值感。",
    wealth: "财富上提醒消费与情绪有关，适合回到真实需要。",
    study: "学习上强调兴趣、记忆联想和情绪状态。",
    keywords: ["情感", "回应"],
    reversedKeywords: ["敏感", "失落"],
  },
  swords: {
    cn: "宝剑",
    en: "Swords",
    theme: "思考、沟通、判断与压力处理",
    love: "感情上强调沟通质量、边界和理性确认。",
    career: "事业上强调策略、判断、规则和问题拆解。",
    wealth: "财富上提醒用数据和合同说话，避免情绪化判断。",
    study: "学习上强调逻辑、表达、理解和错题分析。",
    keywords: ["思考", "沟通"],
    reversedKeywords: ["焦虑", "误判"],
  },
  pentacles: {
    cn: "星币",
    en: "Pentacles",
    theme: "现实资源、金钱、身体与长期积累",
    love: "感情上强调稳定投入、现实安排和长期承诺。",
    career: "事业上强调技能、成果、流程和稳步积累。",
    wealth: "财富上强调预算、储蓄、资产和务实规划。",
    study: "学习上强调基础训练、耐心和可衡量成果。",
    keywords: ["稳定", "资源"],
    reversedKeywords: ["停滞", "失衡"],
  },
};

const RANK_DATA: Array<{
  key: string;
  cn: string;
  en: string;
  number: number | string;
  upright: string;
  reversed: string;
  keywords: string[];
  reversedKeywords: string[];
}> = [
  { key: "ace", cn: "A", en: "Ace", number: "A", upright: "新的机会正在萌芽，适合从小而明确的一步开始。", reversed: "机会还没有准备好落地，当前更适合补齐基础。", keywords: ["新机会", "萌芽"], reversedKeywords: ["延迟", "准备不足"] },
  { key: "two", cn: "2", en: "Two", number: 2, upright: "需要在两个方向之间协调，先看清选择标准。", reversed: "摇摆或配合不足会拉低效率，别让迟疑拖太久。", keywords: ["选择", "协调"], reversedKeywords: ["摇摆", "失衡"] },
  { key: "three", cn: "3", en: "Three", number: 3, upright: "已有初步进展，适合扩展视野并争取外部支持。", reversed: "计划可能过于分散，合作和节奏需要重新对齐。", keywords: ["扩展", "合作"], reversedKeywords: ["分散", "延误"] },
  { key: "four", cn: "4", en: "Four", number: 4, upright: "结构趋于稳定，适合巩固基础并享受阶段成果。", reversed: "稳定感不足或过度守成，需要调整安全边界。", keywords: ["稳定", "基础"], reversedKeywords: ["不稳", "保守"] },
  { key: "five", cn: "5", en: "Five", number: 5, upright: "出现摩擦或挑战，适合把问题摆到台面处理。", reversed: "冲突有机会缓和，但前提是停止重复旧反应。", keywords: ["挑战", "调整"], reversedKeywords: ["缓和", "内耗"] },
  { key: "six", cn: "6", en: "Six", number: 6, upright: "局面开始回稳，回馈、支持或阶段认可更容易出现。", reversed: "过度依赖认可会削弱主动性，先回到自身节奏。", keywords: ["回馈", "恢复"], reversedKeywords: ["依赖", "失衡"] },
  { key: "seven", cn: "7", en: "Seven", number: 7, upright: "需要坚持立场并筛选干扰，守住关键目标。", reversed: "防御过强或信心不足时，先判断哪些战场值得投入。", keywords: ["坚持", "筛选"], reversedKeywords: ["退缩", "过防"] },
  { key: "eight", cn: "8", en: "Eight", number: 8, upright: "节奏加快，适合专注执行并减少无关消耗。", reversed: "推进受阻时不要硬冲，先处理流程和信息堵点。", keywords: ["推进", "效率"], reversedKeywords: ["阻滞", "混乱"] },
  { key: "nine", cn: "9", en: "Nine", number: 9, upright: "接近阶段收尾，需要耐力、边界和最后一轮确认。", reversed: "疲惫可能放大防备，先恢复体力再做判断。", keywords: ["耐力", "边界"], reversedKeywords: ["疲惫", "防备"] },
  { key: "ten", cn: "10", en: "Ten", number: 10, upright: "责任或成果累积到高点，需要分配压力并准备收束。", reversed: "负担过重时要减法处理，避免把所有事都扛在自己身上。", keywords: ["完成", "责任"], reversedKeywords: ["过载", "释放"] },
  { key: "page", cn: "侍从", en: "Page", number: "Page", upright: "带着学习心态进入新阶段，适合观察、练习和尝试。", reversed: "经验不足或消息不清晰时，不宜急着给出承诺。", keywords: ["学习", "消息"], reversedKeywords: ["稚嫩", "不清"] },
  { key: "knight", cn: "骑士", en: "Knight", number: "Knight", upright: "行动力增强，适合推进任务，但要看清方向。", reversed: "急进或反复会消耗资源，先稳定节奏再出发。", keywords: ["行动", "推进"], reversedKeywords: ["急进", "反复"] },
  { key: "queen", cn: "王后", en: "Queen", number: "Queen", upright: "成熟的接纳与管理能力出现，适合稳住人和资源。", reversed: "过度照顾或情绪化管理会造成消耗，需要照看边界。", keywords: ["成熟", "照顾"], reversedKeywords: ["消耗", "边界"] },
  { key: "king", cn: "国王", en: "King", number: "King", upright: "掌控力和责任意识增强，适合定规则、做决策。", reversed: "控制欲或僵硬判断会限制局面，需保留弹性。", keywords: ["掌控", "决策"], reversedKeywords: ["僵硬", "控制"] },
];

function focusMeanings(nameCn: string, base: string, suitTheme?: string) {
  const theme = suitTheme ? `这张牌的核心主题是${suitTheme}。` : "";
  return {
    loveMeaning: `感情上，${nameCn}提示你观察互动中的真实需求与回应方式。${theme}`,
    careerMeaning: `事业上，${nameCn}提醒你把牌面能量转化为具体行动和可验证成果。${theme}`,
    wealthMeaning: `财富上，${nameCn}适合用稳健态度理解资源流动，避免冲动决定。${theme}`,
    studyMeaning: `学习上，${nameCn}提示你调整方法、节奏和专注点。${base}`,
  };
}

function completeMajor(seed: MajorSeed): TarotCardDefinition {
  return {
    id: seed.id,
    nameCn: seed.nameCn,
    nameEn: seed.nameEn,
    suit: "major",
    arcana: "major",
    number: seed.number,
    uprightKeywords: seed.uprightKeywords,
    reversedKeywords: seed.reversedKeywords,
    uprightMeaning: seed.uprightMeaning,
    reversedMeaning: seed.reversedMeaning,
    ...focusMeanings(seed.nameCn, seed.uprightMeaning),
    advice: `围绕${seed.uprightKeywords[0]}采取小而明确的行动，同时保留观察空间。`,
    warning: `留意${seed.reversedKeywords[0]}带来的偏差，不要忽略现实反馈。`,
  };
}

function createMinorCard(
  suit: Exclude<TarotSuit, "major">,
  rank: (typeof RANK_DATA)[number],
): TarotCardDefinition {
  const suitData = SUIT_DATA[suit];
  const isCourt = ["page", "knight", "queen", "king"].includes(rank.key);
  const nameCn = isCourt ? `${suitData.cn}${rank.cn}` : `${suitData.cn} ${rank.cn}`;
  const nameEn = `${rank.en} of ${suitData.en}`;
  const uprightMeaning = `${nameCn}正位表示${rank.upright}${suitData.theme}是这张牌的底色。`;
  const reversedMeaning = `${nameCn}逆位提醒：${rank.reversed}需要重新校准${suitData.theme}。`;

  return {
    id: `${suit}-${rank.key}`,
    nameCn,
    nameEn,
    suit,
    arcana: "minor",
    number: rank.number,
    uprightKeywords: [...rank.keywords, ...suitData.keywords],
    reversedKeywords: [...rank.reversedKeywords, ...suitData.reversedKeywords],
    uprightMeaning,
    reversedMeaning,
    loveMeaning: `${suitData.love}${rank.upright}`,
    careerMeaning: `${suitData.career}${rank.upright}`,
    wealthMeaning: `${suitData.wealth}${rank.reversed}`,
    studyMeaning: `${suitData.study}${rank.upright}`,
    advice: `把${rank.keywords[0]}落实到一个具体动作，并留意${suitData.theme}的实际反馈。`,
    warning: `避免被${rank.reversedKeywords[0]}牵着走，先确认事实、资源和边界。`,
  };
}

export const TAROT_CARDS: TarotCardDefinition[] = [
  ...MAJOR_ARCANA.map(completeMajor),
  ...(["wands", "cups", "swords", "pentacles"] as const).flatMap((suit) =>
    RANK_DATA.map((rank) => createMinorCard(suit, rank)),
  ),
];

export const TAROT_DECK = TAROT_CARDS;

export function getCardById(id: string): TarotCardDefinition | undefined {
  return TAROT_CARDS.find((card) => card.id === id);
}

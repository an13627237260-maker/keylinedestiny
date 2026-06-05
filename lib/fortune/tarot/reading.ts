import type { CalculationStep } from "../shared/types";
import { getTarotSpread } from "./spreads";
import {
  drawTarotCards,
  drawTarotCardsWithSeed,
  getRandomMethodDescription,
} from "./random";
import type {
  DrawnTarotCard,
  TarotCardDefinition,
  TarotFocusArea,
  TarotOrientation,
  TarotReading,
  TarotSpread,
} from "./types";

const DEFAULT_QUESTION = "我当前需要关注什么？";
export const TAROT_DISCLAIMER =
  "塔罗结果基于本地牌库与规则生成，仅供娱乐和自我反思参考，不构成现实决策依据。";

function stableHash(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function normalizeFocusArea(focusArea?: TarotFocusArea): TarotFocusArea {
  return focusArea === "love" ||
    focusArea === "career" ||
    focusArea === "wealth" ||
    focusArea === "study" ||
    focusArea === "overall"
    ? focusArea
    : "overall";
}

function focusLabel(focusArea: TarotFocusArea): string {
  const labels: Record<TarotFocusArea, string> = {
    overall: "综合",
    love: "感情",
    career: "事业",
    wealth: "财富",
    study: "学业",
  };
  return labels[focusArea];
}

function focusMeaning(card: TarotCardDefinition, focusArea: TarotFocusArea): string {
  if (focusArea === "love") return card.loveMeaning;
  if (focusArea === "career") return card.careerMeaning;
  if (focusArea === "wealth") return card.wealthMeaning;
  if (focusArea === "study") return card.studyMeaning;
  return card.uprightMeaning;
}

function orientationLabel(orientation: TarotOrientation): string {
  return orientation === "upright" ? "正位" : "逆位";
}

function buildInterpretation(input: {
  card: TarotCardDefinition;
  orientation: TarotOrientation;
  positionName: string;
  positionMeaning: string;
  focusArea: TarotFocusArea;
  question: string;
}): string {
  const { card, orientation, positionName, positionMeaning, focusArea, question } = input;
  const base = orientation === "upright" ? card.uprightMeaning : card.reversedMeaning;
  const focused = focusMeaning(card, focusArea);
  return `${positionName}位置代表${positionMeaning}${card.nameCn}以${orientationLabel(orientation)}出现，说明围绕“${question}”这个问题，当前可从${focusLabel(focusArea)}角度观察：${base}${focused}建议是：${card.advice}`;
}

function ensureMinimumSummary(text: string): string {
  if (text.length >= 140) return text;
  return `${text} 这次牌面更适合被理解为一组提醒：先看见当前能量，再判断哪些行动可以马上落地，哪些部分需要等待更多信息。塔罗不替你做决定，而是帮助你把问题拆清楚。`;
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function buildAdvice(cards: DrawnTarotCard[]): string[] {
  const fromCards = uniqueStrings(cards.map((item) => item.card.advice));
  return [
    ...fromCards,
    "先把问题拆成一个可执行的小步骤，再观察现实反馈。",
    "如果牌面出现逆位，优先处理准备不足、边界不清或节奏失衡。",
  ].slice(0, Math.max(3, Math.min(5, fromCards.length + 2)));
}

function buildCautions(cards: DrawnTarotCard[]): string[] {
  const fromCards = uniqueStrings(cards.map((item) => item.card.warning));
  return [
    ...fromCards,
    "不要把单次抽牌当成现实结论，重要决定仍需结合事实与责任。",
    "情绪强烈时先暂停，再回来看牌面提示会更清楚。",
  ].slice(0, Math.max(2, Math.min(4, fromCards.length + 2)));
}

function buildReadingFromDrawn(input: {
  question?: string;
  spreadId?: string;
  focusArea?: TarotFocusArea;
  drawn: { card: TarotCardDefinition; orientation: TarotOrientation }[];
  method: string;
}): TarotReading {
  const question = input.question?.trim() || DEFAULT_QUESTION;
  const focusArea = normalizeFocusArea(input.focusArea);
  const spread = getTarotSpread(input.spreadId ?? "single");
  if (spread.count !== spread.positions.length || spread.count <= 0) {
    throw new Error(`牌阵配置错误：${spread.name}`);
  }
  if (input.drawn.length !== spread.count) {
    throw new Error("抽到的牌数与牌阵位置不一致");
  }

  const cards: DrawnTarotCard[] = input.drawn.map((drawn, index) => {
    const position = spread.positions[index];
    const keywords =
      drawn.orientation === "upright"
        ? drawn.card.uprightKeywords
        : drawn.card.reversedKeywords;
    return {
      card: drawn.card,
      orientation: drawn.orientation,
      position,
      keywords,
      interpretation: buildInterpretation({
        card: drawn.card,
        orientation: drawn.orientation,
        positionName: position.name,
        positionMeaning: position.meaning,
        focusArea,
        question,
      }),
    };
  });

  const createdAt = new Date().toISOString();
  const lead = cards[0];
  const reversedCount = cards.filter((item) => item.orientation === "reversed").length;
  const summary = ensureMinimumSummary(
    `本次问题是“${question}”，使用${spread.name}，关注方向为${focusLabel(focusArea)}。核心牌为${lead.card.nameCn}${orientationLabel(lead.orientation)}，它提示当前主题围绕${lead.keywords.slice(0, 3).join("、")}展开。${cards.map((item) => `${item.position.name}见${item.card.nameCn}${orientationLabel(item.orientation)}`).join("；")}。${reversedCount > 0 ? `牌面中有${reversedCount}张逆位，说明需要先处理阻滞、边界或节奏问题。` : "牌面正位较多，说明行动方向相对清楚，但仍需要按步骤推进。"}`,
  );

  return {
    id: `tarot-${stableHash(`${createdAt}|${question}|${cards.map((c) => c.card.id).join("|")}`)}`,
    question,
    focusArea,
    spread,
    createdAt,
    cards,
    summary,
    advice: buildAdvice(cards),
    cautions: buildCautions(cards),
    disclaimer: TAROT_DISCLAIMER,
    randomTrace: {
      method: input.method,
      drawnCardIds: cards.map((item) => item.card.id),
      orientations: cards.map((item) => item.orientation),
      timestamp: createdAt,
    },
  };
}

export function generateTarotReading(input: {
  question?: string;
  spreadId?: string;
  focusArea?: TarotFocusArea;
}): TarotReading {
  const spread = getTarotSpread(input.spreadId ?? "single");
  const drawn = drawTarotCards({ count: spread.count, allowReversed: true });
  return buildReadingFromDrawn({
    ...input,
    spreadId: spread.id,
    drawn,
    method: getRandomMethodDescription(),
  });
}

export function buildTarotCalculationSteps(reading: TarotReading): CalculationStep[] {
  return [
    {
      step: "tarot_draw",
      title: "塔罗抽牌",
      input: {
        question: reading.question,
        spread: reading.spread.id,
        focusArea: reading.focusArea,
      },
      method: "从完整 78 张本地牌库洗牌后按牌阵数量抽取；同一次抽牌移除已抽牌；每张牌独立生成正位或逆位",
      result: {
        cardIds: reading.randomTrace.drawnCardIds,
        orientations: reading.randomTrace.orientations,
        positions: reading.cards.map((item) => item.position.name),
        randomMethod: reading.randomTrace.method,
      },
      notes: ["牌库与解读均来自本地规则。"],
    },
  ];
}

export function drawTarotReading(
  spreadId: string,
  question?: string,
  seed?: string,
): { result: TarotReading; steps: CalculationStep[] } {
  const spread = getTarotSpread(spreadId);
  const drawn = seed
    ? drawTarotCardsWithSeed({ count: spread.count, seed, allowReversed: true })
    : drawTarotCards({ count: spread.count, allowReversed: true });
  const result = buildReadingFromDrawn({
    question,
    spreadId: spread.id,
    focusArea: "overall",
    drawn,
    method: seed ? "seeded deterministic PRNG" : getRandomMethodDescription(),
  });
  return { result, steps: buildTarotCalculationSteps(result) };
}

import type { CalculationStep } from "../shared/types";
import { TAROT_DECK, createSeededRng, drawRandomSeed } from "./cards";
import { getSpreadPositions } from "./spreads";
import type { DrawnCard, TarotReadingResult, TarotSpreadType } from "./types";

export function drawTarotReading(
  spread: TarotSpreadType,
  question?: string,
  seed?: string,
): { result: TarotReadingResult; steps: CalculationStep[] } {
  const actualSeed = seed ?? drawRandomSeed();
  const rng = createSeededRng(actualSeed);
  const positions = getSpreadPositions(spread);
  const deck = [...TAROT_DECK];
  const randomTrace: number[] = [];
  const cards: DrawnCard[] = [];

  for (let i = 0; i < positions.length; i++) {
    const rand = rng();
    randomTrace.push(rand);
    const idx = Math.floor(rand * deck.length);
    const card = deck.splice(idx, 1)[0];
    const uprightRand = rng();
    randomTrace.push(uprightRand);
    cards.push({
      card,
      upright: uprightRand >= 0.5,
      position: positions[i],
    });
  }

  const interpretation = cards
    .map(
      (c) =>
        `${c.position}：${c.card.nameCn}（${c.upright ? "正位" : "逆位"}）`,
    )
    .join("；");

  const result: TarotReadingResult = {
    spread,
    question,
    cards,
    seed: actualSeed,
    randomTrace,
    algorithmicInterpretation: interpretation,
  };

  return {
    result,
    steps: [
      {
        step: "tarot_draw",
        title: "塔罗抽牌",
        input: { spread, seed: actualSeed, question },
        method: "crypto 种子 + 无重复抽牌；每张牌独立决定正逆位",
        result: {
          cardIds: cards.map((c) => c.card.id),
          upright: cards.map((c) => c.upright),
          randomTrace,
        },
        notes: ["同 seed 可复核抽牌结果"],
      },
    ],
  };
}

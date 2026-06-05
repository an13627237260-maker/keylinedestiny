import type { TarotReadingResult } from "../tarot/types";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

export function generateTarotReport(
  result: TarotReadingResult,
  question?: string,
): FortuneReport {
  const cardTexts = result.cards.map((c) => {
    const kw = c.upright ? c.card.uprightKeywords : c.card.reversedKeywords;
    return `${c.position}：${c.card.nameCn}${c.upright ? "（正位）" : "（逆位）"}。关键词：${kw.join("、")}。${c.upright ? c.card.advice : c.card.warning}`;
  });

  const summary = joinParagraphs([
    question ? `所问：${question}` : "本次为通用塔罗解读。",
    `牌阵：${result.spread}，共 ${result.cards.length} 张牌。`,
    "解读由传统规则库与本地模板引擎生成，仅供娱乐参考。",
  ]);

  return buildReport(
    "塔罗规则解读",
    summary,
    [
      {
        title: "整体能量",
        content: result.algorithmicInterpretation,
      },
      { title: "逐牌解读", content: joinParagraphs(cardTexts) },
      {
        title: "建议",
        content: joinParagraphs(result.cards.map((c) => c.card.advice)),
      },
    ],
    result.cards.map((c) => c.card.advice).slice(0, 6),
  );
}

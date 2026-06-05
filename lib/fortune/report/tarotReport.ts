import type { TarotReading } from "../tarot/types";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

export function generateTarotReport(reading: TarotReading): FortuneReport {
  return buildReport(
    "塔罗规则解读",
    reading.summary,
    [
      {
        title: "抽牌问题",
        content: `问题：${reading.question}\n\n牌阵：${reading.spread.name}\n\n关注方向：${reading.focusArea}`,
      },
      {
        title: "逐牌解读",
        content: joinParagraphs(
          reading.cards.map(
            (item) =>
              `${item.position.name}：${item.card.nameCn} ${item.card.nameEn}（${item.orientation === "upright" ? "正位" : "逆位"}）。关键词：${item.keywords.join("、")}。${item.interpretation}`,
          ),
        ),
      },
      {
        title: "建议",
        content: joinParagraphs(reading.advice),
      },
      {
        title: "注意事项",
        content: joinParagraphs(reading.cautions),
      },
    ],
    reading.advice,
  );
}

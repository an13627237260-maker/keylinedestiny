import type { ZodiacSignInfo } from "../zodiac/zodiac";
import type { FortunePeriod } from "../zodiac/fortune";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

interface ZodiacAlgoResult {
  sign: ZodiacSignInfo;
  fortune: {
    seed: string;
    themes: string[];
    summary: string;
    love: string;
    career: string;
    wellness: string;
  };
  period: FortunePeriod;
  date: string;
}

export function generateZodiacReport(result: ZodiacAlgoResult): FortuneReport {
  const z = result.sign;
  const f = result.fortune;
  const summary = `${z.name}（${z.element}象·${z.modality}）运势由确定性算法生成，同一天同星座结果一致。`;
  return buildReport(
    "星座运势报告",
    summary,
    [
      {
        title: "性格关键词",
        content: z.personalityKeywords.join("、"),
      },
      {
        title: "运势摘要",
        content: joinParagraphs([f.summary, `感情：${f.love}`, `事业：${f.career}`, `身心：${f.wellness}`]),
      },
    ],
    [f.love, f.career, f.wellness],
  );
}

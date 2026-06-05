import type { ZodiacSignInfo } from "../zodiac/zodiac";
import type { FortunePeriod, ZodiacFortuneCategory } from "../zodiac/fortune";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

interface ZodiacAlgoResult {
  sign: ZodiacSignInfo;
  fortune: {
    seed: string;
    themes: string[];
    overallScore: number;
    scores: Record<ZodiacFortuneCategory, number>;
    interpretations: Record<ZodiacFortuneCategory, string>;
    luckyColor: string;
    luckyNumber: number;
    luckyDirection: string;
    summary: string;
    love: string;
    wealth: string;
    career: string;
    study: string;
    social: string;
    wellness: string;
  };
  period: FortunePeriod;
  date: string;
}

export function generateZodiacReport(result: ZodiacAlgoResult): FortuneReport {
  const z = result.sign;
  const f = result.fortune;
  const summary = `${z.name}（${z.element}象·${z.modality}）综合分 ${f.overallScore}，运势由确定性算法生成，同一天同星座结果一致。`;
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
        content: joinParagraphs([
          f.summary,
          `幸运色：${f.luckyColor}；幸运数字：${f.luckyNumber}；幸运方位：${f.luckyDirection}`,
        ]),
      },
      {
        title: "六项趋势",
        content: joinParagraphs([
          `爱情 ${f.scores.love}：${f.love}`,
          `财富 ${f.scores.wealth}：${f.wealth}`,
          `事业 ${f.scores.career}：${f.career}`,
          `学习 ${f.scores.study}：${f.study}`,
          `人际 ${f.scores.social}：${f.social}`,
          `身心 ${f.scores.wellness}：${f.wellness}`,
        ]),
      },
    ],
    [f.love, f.wealth, f.career, f.study, f.social, f.wellness],
  );
}

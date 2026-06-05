import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

interface NameAlgoResult {
  name: string;
  fiveGrid?: {
    tianGe: number;
    renGe: number;
    diGe: number;
    waiGe: number;
    zongGe: number;
  };
  threeTalent?: { tian: string; ren: string; di: string; config: string };
  nameScore?: number;
  personalityHints?: string[];
  careerHints?: string[];
  relationshipHints?: string[];
  missingChars?: string[];
}

export function generateNameReport(result: NameAlgoResult): FortuneReport {
  if (!result.fiveGrid) {
    return buildReport(
      "姓名五格报告",
      `姓名「${result.name}」缺少笔画数据，无法完成五格计算。`,
      [
        {
          title: "缺字提示",
          content: `以下字符暂无笔画库：${(result.missingChars ?? []).join("、")}。请勿猜测，可补充字库后重试。`,
        },
      ],
      ["姓名学流派众多，当前采用五格剖象法简化模型。"],
    );
  }

  const fg = result.fiveGrid;
  const summary = `姓名五格：天${fg.tianGe} 人${fg.renGe} 地${fg.diGe} 外${fg.waiGe} 总${fg.zongGe}。综合评分约 ${result.nameScore ?? 60}。`;
  return buildReport(
    "姓名五格报告",
    summary,
    [
      {
        title: "五格剖象",
        content: joinParagraphs([
          `天格 ${fg.tianGe}，人格 ${fg.renGe}，地格 ${fg.diGe}，外格 ${fg.waiGe}，总格 ${fg.zongGe}。`,
          result.threeTalent
            ? `三才：${result.threeTalent.config}（天${result.threeTalent.tian} 人${result.threeTalent.ren} 地${result.threeTalent.di}）`
            : "",
          "当前采用五格剖象法简化模型，流派众多，仅供参考。",
        ]),
      },
      {
        title: "性格倾向",
        content: joinParagraphs(result.personalityHints ?? []),
      },
      {
        title: "事业倾向",
        content: joinParagraphs(result.careerHints ?? []),
      },
      {
        title: "人际感情",
        content: joinParagraphs(result.relationshipHints ?? []),
      },
    ],
    (result.personalityHints ?? []).slice(0, 6),
  );
}

import type { NameAnalysisSuccess } from "../name/types";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

type NameAlgoResult = NameAnalysisSuccess["result"] & {
  missingChars?: string[];
  status?: string;
};

const MODE_LABELS = {
  simplified: "简体笔画",
  traditional: "繁体笔画",
  kangxi: "康熙笔画",
};

function gridSection(fg: NameAlgoResult["fiveGrid"]): string {
  return joinParagraphs([
    `天格 ${fg.tianGe}：先天环境、家族影响倾向`,
    `人格 ${fg.renGe}：性格与自我表达的核心参考`,
    `地格 ${fg.diGe}：基础习惯与内在安全感`,
    `外格 ${fg.waiGe}：人际互动与外在印象`,
    `总格 ${fg.zongGe}：整体人生节奏的综合参考`,
  ]);
}

export function generateNameReport(result: NameAlgoResult): FortuneReport {
  const modeLabel = MODE_LABELS[result.mode] ?? result.mode;
  const summary = `姓名「${result.name}」五格：天${result.fiveGrid.tianGe} 人${result.fiveGrid.renGe} 地${result.fiveGrid.diGe} 外${result.fiveGrid.waiGe} 总${result.fiveGrid.zongGe}。综合评分约 ${result.nameScore} 分（${modeLabel}）。`;

  const charDetail = result.charStrokes
    .map((c) => `${c.char}（${c.strokes}画${c.warning ? `，${c.warning}` : ""}）`)
    .join("、");

  return buildReport(
    "姓名五格报告",
    summary,
    [
      {
        title: "姓名基础信息",
        content: joinParagraphs([
          `姓名：${result.name}`,
          `笔画模式：${modeLabel}`,
          `各字笔画：${charDetail}`,
          "字义分析为简化参考，五格以笔画数理为主。",
        ]),
      },
      {
        title: "五格剖象",
        content: joinParagraphs([
          gridSection(result.fiveGrid),
          result.threeTalent
            ? `三才配置：${result.threeTalent.config}（天${result.threeTalent.tian} 人${result.threeTalent.ren} 地${result.threeTalent.di}）`
            : "",
          "当前采用五格剖象法简化模型，流派众多，仅供参考。",
        ]),
      },
      {
        title: "三才配置",
        content: joinParagraphs([
          `三才五行：${result.threeTalent.config}`,
          "三才反映天、人、地三层的五行搭配节奏，宜结合整体五格理解，不宜单独定论。",
        ]),
      },
      {
        title: "字义与音形提示",
        content:
          "姓名各字的字义、读音与字形搭配会影响日常使用的感受。本报告不做深度字义数据库解析，仅提示：顺口、好写、寓意积极的名字更容易带来良好的自我认同。",
      },
      {
        title: "综合评分",
        content: `综合评分 ${result.nameScore} 分（55-92 区间）。分数反映五格数理的整体协调感，不代表命运好坏。`,
      },
      {
        title: "优势",
        content: joinParagraphs(result.strengths),
      },
      {
        title: "注意点",
        content: joinParagraphs(result.cautions),
      },
    ],
    result.suggestions,
  );
}

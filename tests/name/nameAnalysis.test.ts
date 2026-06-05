import { describe, expect, it } from "vitest";
import { analyzeName, calculateFiveGrid } from "@/lib/fortune/name/analysis";
import { getStrokeCount } from "@/lib/fortune/name/strokes";
import { generateNameReport } from "@/lib/fortune/report/nameReport";

describe("name analysis", () => {
  it("常用字笔画准确", () => {
    expect(getStrokeCount("卓", "simplified").stroke).toBe(8);
    expect(getStrokeCount("晓", "simplified").stroke).toBe(10);
    expect(getStrokeCount("曉", "traditional").stroke).toBe(16);
    expect(getStrokeCount("婷", "simplified").stroke).toBe(12);
  });

  it("卓晓婷可以成功分析", () => {
    const { analysis, calculation_steps, warnings } = analyzeName("卓晓婷", "simplified");
    expect(analysis.status).toBe("success");
    if (analysis.status !== "success") return;
    expect(analysis.result.strokes).toEqual([8, 10, 12]);
    expect(analysis.result.fiveGrid.tianGe).toBe(9);
    expect(analysis.result.fiveGrid.renGe).toBe(18);
    expect(analysis.result.fiveGrid.diGe).toBe(22);
    expect(analysis.result.threeTalent.config).toHaveLength(3);
    expect(calculation_steps[0].result.fiveGrid).toBeDefined();
    expect(warnings.join("")).toContain("五格剖象法简化模型");
  });

  it("缺字返回 needs_strokes，不直接 error", () => {
    const { analysis } = analyzeName("卓燚", "simplified");
    expect(analysis.status).toBe("needs_strokes");
    if (analysis.status !== "needs_strokes") return;
    expect(analysis.missingChars).toContain("燚");
  });

  it("自定义笔画优先", () => {
    const { fiveGrid, missingChars, charStrokes } = calculateFiveGrid(
      "卓",
      "燚",
      "simplified",
      { 燚: { simplified: 16 } },
    );
    expect(missingChars).toHaveLength(0);
    expect(charStrokes.find((entry) => entry.char === "燚")?.strokes).toBe(16);
    expect(fiveGrid?.diGe).toBe(17);
  });

  it("姓名报告说明简化模型且不含禁用断语", () => {
    const { analysis } = analyzeName("卓晓婷", "simplified");
    expect(analysis.status).toBe("success");
    if (analysis.status !== "success") return;
    const report = generateNameReport(analysis.result);
    const text = [
      report.summary,
      ...report.sections.map((section) => section.content),
      ...report.advice,
    ].join("");
    expect(text).toContain("五格剖象法简化模型");
    for (const word of ["一定", "必然", "注定", "必发财", "改命"]) {
      expect(text).not.toContain(word);
    }
  });
});

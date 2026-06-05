"use client";

import { FormFieldShell } from "@/components/ui/form-field-shell";
import { MysticButton } from "@/components/ui/mystic-button";
import type { TarotFocusArea } from "@/lib/fortune/tarot";
import { TarotSpreadSelector } from "./TarotSpreadSelector";

const FOCUS_OPTIONS: Array<{ id: TarotFocusArea; label: string }> = [
  { id: "overall", label: "综合" },
  { id: "love", label: "感情" },
  { id: "career", label: "事业" },
  { id: "wealth", label: "财富" },
  { id: "study", label: "学业" },
];

export function TarotQuestionForm({
  question,
  spreadId,
  focusArea,
  isDrawing,
  hasReading,
  onQuestionChange,
  onSpreadChange,
  onFocusAreaChange,
  onSubmit,
}: {
  question: string;
  spreadId: string;
  focusArea: TarotFocusArea;
  isDrawing: boolean;
  hasReading: boolean;
  onQuestionChange: (value: string) => void;
  onSpreadChange: (value: string) => void;
  onFocusAreaChange: (value: TarotFocusArea) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <FormFieldShell label="问题（可选）" htmlFor="tarot-question">
        <textarea
          id="tarot-question"
          rows={3}
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="你想问什么？不输入时会使用默认问题。"
          className="mystic-input min-h-[96px] w-full rounded-lg px-3 py-2 text-base sm:text-sm"
        />
      </FormFieldShell>

      <FormFieldShell label="关注方向" htmlFor="tarot-focus">
        <select
          id="tarot-focus"
          value={focusArea}
          onChange={(event) => onFocusAreaChange(event.target.value as TarotFocusArea)}
          className="mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm"
        >
          {FOCUS_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </FormFieldShell>

      <FormFieldShell label="牌阵" htmlFor="tarot-spread">
        <TarotSpreadSelector value={spreadId} onChange={onSpreadChange} />
      </FormFieldShell>

      <MysticButton type="submit" variant="primary" loading={isDrawing} className="w-full" disabled={isDrawing}>
        {isDrawing ? "正在洗牌..." : hasReading ? "重新抽牌" : "开始抽牌"}
      </MysticButton>
    </form>
  );
}

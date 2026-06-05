import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TarotQuestionForm } from "@/components/tarot/TarotQuestionForm";

describe("TarotQuestionForm", () => {
  it("点击开始抽牌会触发 onSubmit", () => {
    const onSubmit = vi.fn();
    render(
      <TarotQuestionForm
        question=""
        spreadId="single"
        focusArea="overall"
        isDrawing={false}
        hasReading={false}
        onQuestionChange={() => undefined}
        onSpreadChange={() => undefined}
        onFocusAreaChange={() => undefined}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "开始抽牌" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

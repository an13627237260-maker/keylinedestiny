import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwipeTabs } from "@/components/ui/SwipeTabs";
import { ExpandableReportSection } from "@/components/ui/ExpandableReportSection";

describe("mobile UI components", () => {
  it("SwipeTabs renders and switches tabs", () => {
    let value = "a";
    const { rerender } = render(
      <SwipeTabs
        items={[
          { id: "a", label: "日" },
          { id: "b", label: "周" },
        ]}
        value={value}
        onChange={(id) => {
          value = id;
        }}
      />,
    );
    expect(screen.getByText("日")).toBeTruthy();
    fireEvent.click(screen.getByText("周"));
    rerender(
      <SwipeTabs
        items={[
          { id: "a", label: "日" },
          { id: "b", label: "周" },
        ]}
        value={value}
        onChange={(id) => {
          value = id;
        }}
      />,
    );
    expect(value).toBe("b");
  });

  it("ExpandableReportSection toggles content", () => {
    render(
      <ExpandableReportSection title="概览" defaultOpen={false}>
        报告正文
      </ExpandableReportSection>,
    );
    expect(screen.queryByText("报告正文")).toBeNull();
    fireEvent.click(screen.getByText("概览"));
    expect(screen.getByText("报告正文")).toBeTruthy();
  });
});

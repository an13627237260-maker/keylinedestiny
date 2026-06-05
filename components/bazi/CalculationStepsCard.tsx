import { CollapsiblePanel } from "@/components/ui/collapsible-panel";
import { CalculationStepsPanel } from "@/components/fortune/calculation-steps";
import type { CalculationStep } from "@/lib/fortune/shared/types";

export function CalculationStepsCard({ steps }: { steps: CalculationStep[] }) {
  return (
    <CollapsiblePanel
      title="计算步骤"
      description="可复核 · 展开查看校准来源、节气、四柱、十神与证据来源"
      defaultOpen={false}
    >
      <CalculationStepsPanel steps={steps} />
    </CollapsiblePanel>
  );
}

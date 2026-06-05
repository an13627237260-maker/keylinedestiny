import { CollapsiblePanel } from "@/components/ui/collapsible-panel";
import { CalculationStepsPanel } from "@/components/fortune/calculation-steps";
import type { CalculationStep } from "@/lib/fortune/shared/types";

export function CalculationStepsCard({ steps }: { steps: CalculationStep[] }) {
  return (
    <CollapsiblePanel
      title="计算步骤"
      description="可复核 · 展开查看节气、四柱、十神等推导过程"
      defaultOpen={false}
    >
      <CalculationStepsPanel steps={steps} />
    </CollapsiblePanel>
  );
}

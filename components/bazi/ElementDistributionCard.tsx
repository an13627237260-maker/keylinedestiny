import { BarChart3 } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { FiveElementsChart } from "@/components/bazi/five-elements-chart";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function ElementDistributionCard({ algo }: { algo: BaziAlgorithmResult }) {
  return (
    <MysticCard
      title="五行能量分布"
      description="加权统计 · 不代表缺什么补什么"
      icon={BarChart3}
    >
      <FiveElementsChart
        percentages={algo.fiveElements.percentages}
        strongestElement={algo.fiveElements.strongestElement}
        weakestElement={algo.fiveElements.weakestElement}
        balanceScore={algo.fiveElements.balanceScore}
      />
    </MysticCard>
  );
}

import { ResultMetric } from "@/components/ui/result-metric";
import { labelStrength } from "@/lib/fortune/shared/labels";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function CoreMetricsRow({ algo }: { algo: BaziAlgorithmResult }) {
  const dm = algo.dayMasterStrength;
  const fe = algo.fiveElements;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <ResultMetric
        label="日主"
        value={`${dm.dayMaster}`}
        sub={dm.dayMasterElement}
        accent="gold"
      />
      <ResultMetric
        label="强弱"
        value={labelStrength(dm.strengthLevel)}
        sub={`评分 ${dm.strengthScore}`}
      />
      <ResultMetric
        label="最旺五行"
        value={fe.strongestElement}
        accent="purple"
      />
      <ResultMetric label="最弱五行" value={fe.weakestElement} />
      <ResultMetric
        label="平衡度"
        value={`${fe.balanceScore}`}
        sub="满分 100"
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
}

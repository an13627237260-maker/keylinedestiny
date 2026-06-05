import { MysticCard } from "@/components/ui/mystic-card";
import { ReportSections } from "@/components/ui/ReportSections";
import { TarotCardUI } from "./TarotCard";
import { CalculationStepsCard } from "@/components/bazi/CalculationStepsCard";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

export function TarotReadingResult({
  cards,
  report,
  steps,
}: {
  cards: Array<{ card: { nameCn: string }; upright: boolean; position: string }>;
  report: FortuneReport;
  steps: CalculationStep[];
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 scrollbar-none md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-3">
        {cards.map((c, i) => (
          <MysticCard key={i} className="min-w-[140px] shrink-0 text-center md:min-w-0">
            <TarotCardUI
              name={c.card.nameCn}
              position={c.position}
              upright={c.upright}
              revealed
            />
          </MysticCard>
        ))}
      </div>

      <MysticCard title="牌阵解读" description="规则引擎趋势分析" highlighted>
        <p className="text-sm leading-7 text-[var(--text-main)]">{report.summary}</p>
        <div className="mt-4">
          <ReportSections report={report} />
        </div>
      </MysticCard>

      <CalculationStepsCard steps={steps} />
    </div>
  );
}

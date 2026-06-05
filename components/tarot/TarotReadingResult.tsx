import { MysticCard } from "@/components/ui/mystic-card";
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
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <MysticCard key={i} className="text-center">
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
        <p className="text-sm text-[var(--text-main)]">{report.summary}</p>
        <div className="mt-6 space-y-6">
          {report.sections.map((s) => (
            <div key={s.title}>
              <h4 className="font-display text-sm text-[var(--gold-main)]">{s.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.content}</p>
            </div>
          ))}
        </div>
      </MysticCard>

      <CalculationStepsCard steps={steps} />
    </div>
  );
}

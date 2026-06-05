import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import { CalculationStepsCard } from "@/components/bazi/CalculationStepsCard";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { TarotReading } from "@/lib/fortune/tarot";
import { TarotCardUI } from "./TarotCard";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TarotReadingResult({
  reading,
  steps = [],
}: {
  reading: TarotReading;
  steps?: CalculationStep[];
}) {
  return (
    <div className="space-y-4 pb-8 md:space-y-6">
      <MysticCard title="本次抽牌" description={`${reading.spread.name} · ${formatDate(reading.createdAt)}`} highlighted>
        <div className="space-y-2 text-sm leading-7 text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--gold-main)]">问题 · </span>
            {reading.question}
          </p>
          <p>
            <span className="text-[var(--gold-main)]">牌阵 · </span>
            {reading.spread.name}：{reading.spread.description}
          </p>
        </div>
      </MysticCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reading.cards.map((item) => (
          <MysticCard key={`${item.position.id}-${item.card.id}`} className="min-w-0 text-center">
            <TarotCardUI
              card={item.card}
              position={item.position}
              orientation={item.orientation}
              revealed
            />
            <div className="mt-4 text-left">
              <div className="flex flex-wrap gap-1.5">
                {item.keywords.map((keyword) => (
                  <PillBadge key={keyword} variant="purple">
                    {keyword}
                  </PillBadge>
                ))}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                {item.interpretation}
              </p>
            </div>
          </MysticCard>
        ))}
      </div>

      <MysticCard title="整体解读" description="基于本地牌库与牌阵位置生成" highlighted>
        <p className="text-sm leading-7 text-[var(--text-main)]">{reading.summary}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-display text-sm font-semibold text-[var(--gold-main)]">建议</h4>
            <ul className="mt-2 space-y-2">
              {reading.advice.map((item) => (
                <li key={item} className="text-sm leading-6 text-[var(--text-muted)]">
                  <span className="text-[var(--gold-main)]">· </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-[var(--danger)]">注意事项</h4>
            <ul className="mt-2 space-y-2">
              {reading.cautions.map((item) => (
                <li key={item} className="text-sm leading-6 text-[var(--text-muted)]">
                  <span className="text-[var(--danger)]">· </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-[var(--border-soft)] bg-[rgba(8,6,17,0.35)] px-3 py-2 text-xs leading-relaxed text-[var(--text-dim)]">
          {reading.disclaimer}
        </p>
      </MysticCard>

      {steps.length > 0 && <CalculationStepsCard steps={steps} />}
    </div>
  );
}

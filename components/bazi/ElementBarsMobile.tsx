const COLORS: Record<string, string> = {
  木: "var(--element-wood)",
  火: "var(--element-fire)",
  土: "var(--element-earth)",
  金: "var(--element-metal)",
  水: "var(--element-water)",
};

const ORDER = ["木", "火", "土", "金", "水"];

export function ElementBarsMobile({
  percentages,
  strongestElement,
  weakestElement,
  balanceScore,
}: {
  percentages: Record<string, number>;
  strongestElement?: string;
  weakestElement?: string;
  balanceScore?: number;
}) {
  const top = strongestElement ?? ORDER[0];
  const low = weakestElement ?? ORDER[ORDER.length - 1];

  return (
    <div className="space-y-4 md:hidden">
      <div className="space-y-3">
        {ORDER.map((el) => {
          const pct = percentages[el] ?? 0;
          return (
            <div key={el}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span style={{ color: COLORS[el] }} className="font-medium">
                  {el}
                </span>
                <span className="text-[var(--text-dim)]">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: `linear-gradient(90deg, ${COLORS[el]}99, ${COLORS[el]})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
        <p>
          <span className="text-[var(--text-dim)]">最旺 </span>
          <span style={{ color: COLORS[top] }}>{top}</span>
        </p>
        <p>
          <span className="text-[var(--text-dim)]">最弱 </span>
          <span style={{ color: COLORS[low] }}>{low}</span>
        </p>
        <p>
          <span className="text-[var(--text-dim)]">平衡 </span>
          {balanceScore ?? "—"}
        </p>
      </div>
    </div>
  );
}

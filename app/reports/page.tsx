"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { PillBadge } from "@/components/ui/pill-badge";
import {
  listReports,
  deleteReport,
  clearReports,
  type StoredReport,
} from "@/lib/storage/localReports";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  bazi: "八字",
  tarot: "塔罗",
  zodiac: "星座",
  name: "姓名",
  love: "合盘",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [filter, setFilter] = useState("");

  function refresh() {
    setReports(listReports(filter ? (filter as StoredReport["type"]) : undefined));
  }

  useEffect(() => {
    refresh();
  }, [filter]);

  return (
    <AppShell>
      <SectionTitle
        eyebrow="历史记录"
        title="历史报告"
        subtitle="本地浏览器保存 · 可随时删除"
        className="mb-4 md:mb-0"
      />

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none md:mt-6 md:flex-wrap">
        <MysticButton
          variant={filter === "" ? "primary" : "secondary"}
          onClick={() => setFilter("")}
          className="shrink-0"
        >
          全部
        </MysticButton>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <MysticButton
            key={k}
            variant={filter === k ? "primary" : "secondary"}
            onClick={() => setFilter(k)}
            className="shrink-0"
          >
            {v}
          </MysticButton>
        ))}
        <MysticButton
          variant="ghost"
          onClick={() => {
            clearReports(filter ? (filter as StoredReport["type"]) : undefined);
            refresh();
          }}
          className="shrink-0"
        >
          清空
        </MysticButton>
      </div>

      <div className="mt-4 space-y-3 md:mt-8 md:space-y-4">
        {reports.length === 0 ? (
          <MysticCard className="flex flex-col items-center py-12 text-center sm:py-16">
            <FileText className="mb-3 h-10 w-10 text-[var(--text-dim)]" />
            <p className="font-display text-base text-[var(--text-muted)] sm:text-lg">暂无本地报告</p>
            <p className="mt-2 text-xs text-[var(--text-dim)]">完成测算后会自动保存至此</p>
          </MysticCard>
        ) : (
          reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <MysticCard>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PillBadge variant="purple">{TYPE_LABELS[r.type] ?? r.type}</PillBadge>
                      <h3 className="font-display text-sm font-semibold text-[var(--text-main)] sm:text-base">
                        {r.title}
                      </h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                      {r.summary}
                    </p>
                    {r.type === "bazi" &&
                      (r.payload as { luckOverview?: { day?: { overallScore: number; overallLevel: string } } })
                        .luckOverview?.day && (
                        <p className="mt-2 text-xs text-[var(--text-dim)]">
                          当日运势{" "}
                          <span className="font-display text-[var(--gold-main)]">
                            {
                              (r.payload as { luckOverview: { day: { overallScore: number } } })
                                .luckOverview.day.overallScore
                            }
                          </span>{" "}
                          分 ·{" "}
                          {
                            (r.payload as { luckOverview: { day: { overallLevel: string } } })
                              .luckOverview.day.overallLevel
                          }
                        </p>
                      )}
                    <p className="mt-2 text-[10px] text-[var(--text-dim)]">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <MysticButton
                    variant="secondary"
                    onClick={() => {
                      deleteReport(r.id);
                      refresh();
                    }}
                    className={cn("w-full shrink-0 sm:w-auto")}
                    aria-label="删除报告"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:sr-only">删除</span>
                    <span className="sm:hidden">删除</span>
                  </MysticButton>
                </div>
              </MysticCard>
            </motion.div>
          ))
        )}
      </div>
    </AppShell>
  );
}

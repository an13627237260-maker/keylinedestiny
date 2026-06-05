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
      <SectionTitle eyebrow="历史记录" title="历史报告" subtitle="本地浏览器保存 · 可随时删除" />

      <div className="mt-6 flex flex-wrap gap-2">
        <MysticButton variant={filter === "" ? "primary" : "secondary"} onClick={() => setFilter("")}>
          全部
        </MysticButton>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <MysticButton
            key={k}
            variant={filter === k ? "primary" : "secondary"}
            onClick={() => setFilter(k)}
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
        >
          清空记录
        </MysticButton>
      </div>

      <div className="mt-8 space-y-4">
        {reports.length === 0 ? (
          <MysticCard className="flex flex-col items-center py-16 text-center">
            <FileText className="mb-4 h-10 w-10 text-[var(--text-dim)]" />
            <p className="font-display text-lg text-[var(--text-muted)]">暂无本地报告</p>
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PillBadge variant="purple">{TYPE_LABELS[r.type] ?? r.type}</PillBadge>
                      <h3 className="font-display font-semibold text-[var(--text-main)]">{r.title}</h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{r.summary}</p>
                    <p className="mt-2 text-[10px] text-[var(--text-dim)]">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <MysticButton
                    variant="ghost"
                    onClick={() => {
                      deleteReport(r.id);
                      refresh();
                    }}
                    className="shrink-0 px-2"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--text-dim)]" />
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

"use client";

import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import { cn } from "@/lib/utils";

function MysticInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mystic-input h-10 w-full rounded-lg px-3 text-sm",
        props.className,
      )}
    />
  );
}

function MysticSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "mystic-input h-10 w-full rounded-lg px-3 text-sm",
        props.className,
      )}
    />
  );
}

export function BaziForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <MysticCard
      title="出生信息"
      description="请尽量填写准确时间与出生地"
      headerAction={
        <div className="hidden flex-wrap gap-1 sm:flex">
          <PillBadge variant="purple">规则引擎</PillBadge>
          <PillBadge variant="muted">可复核</PillBadge>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldShell label="姓名（可选）" htmlFor="name">
            <MysticInput id="name" name="name" placeholder="可选" />
          </FormFieldShell>
          <FormFieldShell label="性别" htmlFor="gender">
            <MysticSelect id="gender" name="gender" defaultValue="unknown">
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="unknown">未说明</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="出生日期" htmlFor="birthDate">
            <MysticInput id="birthDate" name="birthDate" type="date" required />
          </FormFieldShell>
          <FormFieldShell label="出生时间" htmlFor="birthTime">
            <MysticInput id="birthTime" name="birthTime" type="time" required />
          </FormFieldShell>
          <FormFieldShell label="出生地" htmlFor="birthPlace">
            <MysticInput id="birthPlace" name="birthPlace" placeholder="城市" required />
          </FormFieldShell>
          <FormFieldShell label="时区" htmlFor="timezone" description="如 Asia/Shanghai">
            <MysticInput id="timezone" name="timezone" defaultValue="Asia/Shanghai" />
          </FormFieldShell>
          <FormFieldShell label="经度（真太阳时）" htmlFor="longitude">
            <MysticInput id="longitude" name="longitude" type="number" step="0.0001" placeholder="116.4" />
          </FormFieldShell>
          <FormFieldShell label="关注方向" htmlFor="focusArea">
            <MysticSelect id="focusArea" name="focusArea" defaultValue="overall">
              <option value="overall">综合</option>
              <option value="love">感情</option>
              <option value="career">事业</option>
              <option value="wealth">财运</option>
              <option value="study">学业</option>
              <option value="health">生活方式</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="流年（可选）" htmlFor="targetYear">
            <MysticInput id="targetYear" name="targetYear" type="number" placeholder="2026" />
          </FormFieldShell>
          <FormFieldShell label="换日规则" htmlFor="dayBoundaryMode">
            <MysticSelect id="dayBoundaryMode" name="dayBoundaryMode" defaultValue="midnight">
              <option value="midnight">午夜换日</option>
              <option value="ziHour">子时初换日 (23:00)</option>
            </MysticSelect>
          </FormFieldShell>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-purple)] bg-[rgba(139,92,246,0.04)] px-4 py-3">
          <input
            type="checkbox"
            name="useTrueSolarTime"
            className="h-4 w-4 rounded border-[var(--border-purple)] accent-[var(--purple-primary)]"
          />
          <span className="text-sm text-[var(--text-muted)]">使用真太阳时（需填写经度）</span>
        </label>

        <MysticButton
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "正在校准节气与四柱…" : "开始排盘"}
        </MysticButton>
      </form>
    </MysticCard>
  );
}

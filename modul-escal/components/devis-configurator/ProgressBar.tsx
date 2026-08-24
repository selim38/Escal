"use client";

import { useT } from "@/lib/i18n/useT";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);
  const { m, t } = useT();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted">
        <span>
          {t(m.progress.stepOf, { current: currentStep + 1, total: totalSteps })}
        </span>
        <span>{pct} %</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={t(m.progress.stepOf, {
          current: currentStep + 1,
          total: totalSteps,
        })}
        aria-label={m.progress.label}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

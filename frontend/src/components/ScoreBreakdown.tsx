"use client";

import type { ExplainResponse } from "@/lib/schemas";
import { cn, formatNumber } from "@/lib/utils";

const FEATURE_LABELS: Record<string, string> = {
  median_income: "Median Income",
  crime_index: "Crime Index",
  growth_index: "Growth Index",
  home_price: "Home Price",
  rent_price: "Rent Price",
};

interface ScoreBreakdownProps {
  data: ExplainResponse;
  className?: string;
}

export default function ScoreBreakdown({ data, className }: ScoreBreakdownProps) {
  const features = Object.entries(data.features).sort(
    ([, a], [, b]) => Math.abs(b.contribution) - Math.abs(a.contribution)
  );

  const maxContrib = Math.max(...features.map(([, f]) => Math.abs(f.contribution)));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Total score */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
        <span className="text-sm font-semibold text-blue-800">Total Score</span>
        <span className="text-2xl font-bold text-blue-700">
          {(data.total_score * 100).toFixed(1)}
        </span>
      </div>

      {/* Feature breakdown */}
      <div className="space-y-3">
        {features.map(([featureKey, detail]) => {
          const label = FEATURE_LABELS[featureKey] ?? featureKey;
          const pct = maxContrib > 0 ? Math.abs(detail.contribution) / maxContrib : 0;
          const isPositive = detail.contribution >= 0;

          return (
            <div key={featureKey}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Base: {formatNumber(detail.base_value, 0)}</span>
                  <span>Norm: {formatNumber(detail.normalized_value, 3)}</span>
                  <span>Wt: {formatNumber(detail.weight, 2)}</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isPositive ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {formatNumber(detail.contribution, 4)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isPositive ? "bg-emerald-500" : "bg-red-400"
                  )}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import type { RecommendResult } from "@/lib/schemas";
import { useFiltersStore } from "@/store/filtersStore";
import { useExplain } from "@/hooks/useExplain";
import { Skeleton } from "./ui/Skeleton";
import ScoreBreakdown from "./ScoreBreakdown";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

interface LocationDrawerProps {
  result: RecommendResult | null;
  onClose: () => void;
}

export default function LocationDrawer({ result, onClose }: LocationDrawerProps) {
  const store = useFiltersStore();
  const explain = useExplain();

  useEffect(() => {
    if (!result) return;
    explain.mutate({
      locationId: result.location.location_id,
      body: store.toScoringRequest(),
      bypassCache: store.bypassCache,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.location.location_id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!result) return null;
  const { location, total_score } = result;

  const scoreVariant = total_score >= 0.75 ? "success" : total_score >= 0.5 ? "warning" : "danger";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        role="dialog"
        aria-label={`${location.city} detail`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {location.city}, {location.state}
            </h2>
            <p className="text-sm text-slate-500">{location.county} County</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={scoreVariant}>Score: {(total_score * 100).toFixed(1)}</Badge>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <StatItem label="Median Income" value={formatCurrency(location.median_income)} />
            <StatItem label="Home Price" value={formatCurrency(location.home_price)} />
            <StatItem label="Rent / mo" value={formatCurrency(location.rent_price)} />
            <StatItem label="Population" value={formatNumber(location.population, 0)} />
            <StatItem label="Crime Index" value={formatNumber(location.crime_index, 2)} />
            <StatItem label="Growth Index" value={formatNumber(location.growth_index, 2)} />
            <StatItem
              label="Coordinates"
              value={`${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`}
            />
          </div>
        </div>

        {/* Score explainability */}
        <div className="flex-1 px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Score Breakdown
          </h3>

          {explain.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-10" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          )}

          {explain.isError && (
            <p className="text-sm text-red-500">
              Could not load breakdown: {explain.error?.message}
            </p>
          )}

          {explain.data && <ScoreBreakdown data={explain.data} />}
        </div>

        {/* Footer action */}
        <div className="border-t border-slate-200 px-5 py-4">
          <Link href={`/location/${location.location_id}`}>
            <Button variant="secondary" size="sm" className="w-full">
              Open full detail page →
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { RecommendResult } from "@/lib/schemas";
import { SkeletonCard, SkeletonTable } from "./ui/Skeleton";
import LocationCard from "./LocationCard";
import RankingTable from "./RankingTable";
import { cn } from "@/lib/utils";

// Leaflet must be loaded client-side only
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] animate-pulse rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
      Loading map…
    </div>
  ),
});

type View = "list" | "table" | "map";

interface ResultsViewProps {
  results: RecommendResult[];
  isLoading?: boolean;
  onSelectResult?: (result: RecommendResult) => void;
  selectedId?: string;
}

export default function ResultsView({
  results,
  isLoading = false,
  onSelectResult,
  selectedId,
}: ResultsViewProps) {
  const [view, setView] = useState<View>("list");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {(["list", "table", "map"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              view === v
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        view === "table" ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )
      ) : (
        <>
          {view === "list" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.length === 0 ? (
                <p className="col-span-full text-center py-16 text-slate-400">
                  Run a recommendation to see results here.
                </p>
              ) : (
                results.map((r, idx) => (
                  <LocationCard
                    key={r.location.location_id}
                    location={r.location}
                    score={r.total_score}
                    rank={idx + 1}
                    selected={selectedId === r.location.location_id}
                    onClick={() => onSelectResult?.(r)}
                  />
                ))
              )}
            </div>
          )}

          {view === "table" && (
            <RankingTable
              results={results}
              onSelectRow={onSelectResult}
              selectedId={selectedId}
            />
          )}

          {view === "map" && (
            <MapView
              results={results}
              onSelectMarker={onSelectResult}
              selectedId={selectedId}
            />
          )}
        </>
      )}
    </div>
  );
}

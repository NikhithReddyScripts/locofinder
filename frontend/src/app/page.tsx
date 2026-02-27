"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useFiltersStore } from "@/store/filtersStore";
import { useRecommend } from "@/hooks/useRecommend";
import FiltersPanel from "@/components/FiltersPanel";
import ResultsView from "@/components/ResultsView";
import LocationDrawer from "@/components/LocationDrawer";
import { Button } from "@/components/ui/Button";
import type { RecommendResult } from "@/lib/schemas";

export default function HomePage() {
  const store = useFiltersStore();
  const recommend = useRecommend();
  const [selectedResult, setSelectedResult] = useState<RecommendResult | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleRecommend = useCallback(async () => {
    try {
      await recommend.mutateAsync({
        body: store.toScoringRequest(),
        bypassCache: store.bypassCache,
      });
      toast.success("Recommendations loaded!");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to fetch recommendations");
    }
  }, [recommend, store]);

  const handleSelectResult = useCallback((result: RecommendResult) => {
    setSelectedResult(result);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedResult(null);
  }, []);

  const results = recommend.data?.results ?? [];
  const totalAnalyzed = recommend.data?.total_analyzed ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Location Recommender</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tune weights and filters, then click Recommend to rank US locations by your criteria.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Filters sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {/* Mobile toggle */}
          <button
            className="lg:hidden mb-2 flex items-center gap-2 text-sm font-medium text-blue-700"
            onClick={() => setPanelOpen((o) => !o)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            {panelOpen ? "Hide" : "Show"} Filters & Weights
          </button>

          <FiltersPanel
            className={`w-full lg:w-72 xl:w-80 ${panelOpen ? "block" : "hidden lg:block"}`}
          />
        </div>

        {/* Right: Results */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Recommend button + stats */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleRecommend}
              loading={recommend.isPending}
              className="shrink-0"
            >
              {recommend.isPending ? "Finding…" : "Recommend"}
            </Button>

            {recommend.isError && !recommend.isPending && (
              <span className="text-sm text-red-600">{recommend.error?.message}</span>
            )}

            {recommend.data && (
              <span className="text-sm text-slate-500">
                Showing <strong className="text-slate-700">{results.length}</strong> results from{" "}
                <strong className="text-slate-700">{totalAnalyzed.toLocaleString()}</strong>{" "}
                locations analyzed
                {store.bypassCache && (
                  <span className="ml-2 rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5 font-medium">
                    cache bypassed
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Results */}
          <ResultsView
            results={results}
            isLoading={recommend.isPending}
            onSelectResult={handleSelectResult}
            selectedId={selectedResult?.location.location_id}
          />
        </div>
      </div>

      {/* Location detail drawer */}
      {selectedResult && (
        <LocationDrawer result={selectedResult} onClose={handleCloseDrawer} />
      )}
    </div>
  );
}

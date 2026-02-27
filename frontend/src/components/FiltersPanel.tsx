"use client";

import { useFiltersStore } from "@/store/filtersStore";
import { WeightSlider } from "./WeightSlider";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { cn, US_STATES } from "@/lib/utils";
import type { Weights } from "@/lib/schemas";

const WEIGHT_META: { key: keyof Weights; label: string; description: string }[] = [
  { key: "median_income", label: "Median Income", description: "Higher income is better" },
  { key: "crime_index", label: "Crime Index", description: "Lower crime rate is better" },
  { key: "growth_index", label: "Growth Index", description: "Higher growth potential is better" },
  { key: "home_price", label: "Home Price", description: "Lower home price is preferred" },
  { key: "rent_price", label: "Rent Price", description: "Lower rent price is preferred" },
];

interface FiltersPanelProps {
  className?: string;
}

export default function FiltersPanel({ className }: FiltersPanelProps) {
  const {
    weights,
    filters,
    limit,
    bypassCache,
    setWeight,
    setFilter,
    setLimit,
    setBypassCache,
    resetWeights,
    resetFilters,
  } = useFiltersStore();

  return (
    <aside className={cn("rounded-xl border border-slate-200 bg-white p-5 space-y-6", className)}>
      {/* Weights */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Scoring Weights
          </h2>
          <Button variant="ghost" size="sm" onClick={resetWeights}>
            Reset
          </Button>
        </div>
        <div className="space-y-4">
          {WEIGHT_META.map(({ key, label, description }) => (
            <WeightSlider
              key={key}
              label={label}
              description={description}
              value={weights[key]}
              onChange={(v) => setWeight(key, v)}
            />
          ))}
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* Filters */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filters</h2>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear
          </Button>
        </div>
        <div className="space-y-3">
          {/* State selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="state-select" className="text-sm font-medium text-slate-700">
              State
            </label>
            <select
              id="state-select"
              value={filters.state ?? ""}
              onChange={(e) => setFilter("state", e.target.value || null)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All states</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Max Home Price ($)"
            type="number"
            min={0}
            step={10000}
            placeholder="e.g. 500000"
            value={filters.max_home_price ?? ""}
            onChange={(e) =>
              setFilter("max_home_price", e.target.value ? parseFloat(e.target.value) : null)
            }
          />

          <Input
            label="Max Rent Price ($/mo)"
            type="number"
            min={0}
            step={100}
            placeholder="e.g. 2000"
            value={filters.max_rent_price ?? ""}
            onChange={(e) =>
              setFilter("max_rent_price", e.target.value ? parseFloat(e.target.value) : null)
            }
          />

          <Input
            label="Min Median Income ($)"
            type="number"
            min={0}
            step={1000}
            placeholder="e.g. 50000"
            value={filters.min_income ?? ""}
            onChange={(e) =>
              setFilter("min_income", e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* Limit + Cache */}
      <section className="space-y-3">
        <Input
          label="Results limit"
          type="number"
          min={1}
          max={100}
          value={limit}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) setLimit(Math.min(100, Math.max(1, v)));
          }}
          hint="1–100 results"
        />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bypassCache}
            onChange={(e) => setBypassCache(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Bypass backend cache</span>
        </label>
      </section>
    </aside>
  );
}

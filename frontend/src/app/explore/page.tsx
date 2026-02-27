"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocations } from "@/hooks/useLocations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber, US_STATES } from "@/lib/utils";

const PAGE_SIZE = 25;

export default function ExplorePage() {
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(0);
  const [bypassCache, setBypassCache] = useState(false);

  const offset = page * PAGE_SIZE;

  const { data, isLoading, isError, error, isFetching } = useLocations(
    {
      state: stateFilter || undefined,
      offset,
      limit: PAGE_SIZE,
    },
    bypassCache
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  function handleStateChange(val: string) {
    setStateFilter(val);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Locations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and search the full location dataset.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="explore-state" className="text-sm font-medium text-slate-700">
            Filter by state
          </label>
          <select
            id="explore-state"
            value={stateFilter}
            onChange={(e) => handleStateChange(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            <option value="">All states</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
          <input
            type="checkbox"
            checked={bypassCache}
            onChange={(e) => setBypassCache(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Bypass cache</span>
        </label>

        {data && (
          <p className="text-sm text-slate-500 pb-0.5">
            <strong className="text-slate-700">{data.total.toLocaleString()}</strong> total locations
          </p>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={PAGE_SIZE} />
      ) : isError ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
          <p className="font-semibold">Error loading locations</p>
          <p className="text-sm mt-1">{(error as Error)?.message}</p>
        </div>
      ) : !data || data.locations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">No locations found</p>
          {stateFilter && (
            <p className="text-sm mt-1">Try clearing the state filter.</p>
          )}
        </div>
      ) : (
        <>
          <div className={`overflow-x-auto rounded-xl border border-slate-200 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3 text-left font-medium">City</th>
                  <th className="px-3 py-3 text-left font-medium">County</th>
                  <th className="px-3 py-3 text-left font-medium">State</th>
                  <th className="px-3 py-3 text-right font-medium">Median Income</th>
                  <th className="px-3 py-3 text-right font-medium">Home Price</th>
                  <th className="px-3 py-3 text-right font-medium">Rent/mo</th>
                  <th className="px-3 py-3 text-right font-medium">Crime</th>
                  <th className="px-3 py-3 text-right font-medium">Growth</th>
                  <th className="px-3 py-3 text-right font-medium">Population</th>
                  <th className="px-3 py-3 text-center font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.locations.map((loc) => (
                  <tr
                    key={loc.location_id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-900">{loc.city}</td>
                    <td className="px-3 py-2.5 text-slate-600">{loc.county}</td>
                    <td className="px-3 py-2.5 text-slate-600">{loc.state}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatCurrency(loc.median_income)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatCurrency(loc.home_price)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatCurrency(loc.rent_price)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatNumber(loc.crime_index, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatNumber(loc.growth_index, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {formatNumber(loc.population, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Link
                        href={`/location/${loc.location_id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page + 1} of {totalPages} &nbsp;·&nbsp; showing {offset + 1}–
              {Math.min(offset + PAGE_SIZE, data.total)} of {data.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

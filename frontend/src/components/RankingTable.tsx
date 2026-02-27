"use client";

import Link from "next/link";
import type { RecommendResult } from "@/lib/schemas";
import { Badge } from "./ui/Badge";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

interface RankingTableProps {
  results: RecommendResult[];
  onSelectRow?: (result: RecommendResult) => void;
  selectedId?: string;
}

export default function RankingTable({ results, onSelectRow, selectedId }: RankingTableProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No results to display.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-3 text-left font-medium">#</th>
            <th className="px-3 py-3 text-left font-medium">City</th>
            <th className="px-3 py-3 text-left font-medium">State</th>
            <th className="px-3 py-3 text-right font-medium">Score</th>
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
          {results.map(({ location, total_score }, idx) => {
            const scoreVariant =
              total_score >= 0.75 ? "success" : total_score >= 0.5 ? "warning" : "danger";
            return (
              <tr
                key={location.location_id}
                onClick={() => onSelectRow?.({ location, total_score })}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-blue-50",
                  selectedId === location.location_id && "bg-blue-50"
                )}
              >
                <td className="px-3 py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                <td className="px-3 py-2.5 font-medium text-slate-900">{location.city}</td>
                <td className="px-3 py-2.5 text-slate-500">{location.state}</td>
                <td className="px-3 py-2.5 text-right">
                  <Badge variant={scoreVariant}>{(total_score * 100).toFixed(1)}</Badge>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatCurrency(location.median_income)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatCurrency(location.home_price)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatCurrency(location.rent_price)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatNumber(location.crime_index, 1)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatNumber(location.growth_index, 1)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatNumber(location.population, 0)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <Link
                    href={`/location/${location.location_id}`}
                    className="text-blue-600 hover:underline text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { LocationOut } from "@/lib/schemas";
import { Badge } from "./ui/Badge";
import { cn, formatCurrency, formatNumber, scoreToBgClass } from "@/lib/utils";

interface LocationCardProps {
  location: LocationOut;
  score?: number;
  rank?: number;
  onClick?: () => void;
  selected?: boolean;
}

export default function LocationCard({
  location,
  score,
  rank,
  onClick,
  selected = false,
}: LocationCardProps) {
  const scoreVariant =
    score == null
      ? "default"
      : score >= 0.75
        ? "success"
        : score >= 0.5
          ? "warning"
          : "danger";

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-white p-4 transition-all cursor-pointer",
        "hover:shadow-md hover:border-blue-300",
        selected ? "border-blue-500 shadow-md ring-1 ring-blue-500" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          {rank != null && (
            <span className="mr-1.5 text-xs font-bold text-slate-400">#{rank}</span>
          )}
          <Link
            href={`/location/${location.location_id}`}
            className="font-semibold text-slate-900 hover:text-blue-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {location.city}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">
            {location.county}, {location.state}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {score != null && (
            <Badge variant={scoreVariant}>
              Score: {(score * 100).toFixed(1)}
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            Pop. {formatNumber(location.population, 0)}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <Stat label="Median Income" value={formatCurrency(location.median_income)} />
        <Stat label="Home Price" value={formatCurrency(location.home_price)} />
        <Stat label="Rent/mo" value={formatCurrency(location.rent_price)} />
        <Stat label="Crime Index" value={formatNumber(location.crime_index, 1)} />
        <Stat label="Growth Index" value={formatNumber(location.growth_index, 1)} />
        <Stat label="Lat/Lon" value={`${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label}: </span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

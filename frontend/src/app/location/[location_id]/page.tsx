"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useFiltersStore } from "@/store/filtersStore";
import { useExplain } from "@/hooks/useExplain";
import { useLocations } from "@/hooks/useLocations";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { LocationOut } from "@/lib/schemas";

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params?.location_id as string;

  const store = useFiltersStore();
  const explain = useExplain();

  // Fetch the single location by searching with a wide net and filtering client-side.
  // The API doesn't have GET /locations/{id}, so we use the search endpoint.
  // We'll fetch all results for the given ID by passing no filters.
  const { data: searchData, isLoading: locationLoading } = useLocations(
    { limit: 100 },
    false
  );

  // Find this specific location from the search results
  const location = searchData?.locations.find((l) => l.location_id === locationId);

  // Run explain when location found
  useEffect(() => {
    if (!locationId) return;
    explain.mutate(
      {
        locationId,
        body: store.toScoringRequest(),
        bypassCache: store.bypassCache,
      },
      {
        onError: (err) => {
          toast.error(`Could not load score breakdown: ${err.message}`);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  const handleRerunExplain = () => {
    explain.mutate(
      {
        locationId,
        body: store.toScoringRequest(),
        bypassCache: store.bypassCache,
      },
      {
        onSuccess: () => toast.success("Score recalculated"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-blue-600 hover:underline">
          Explore
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-[200px]">{locationId}</span>
      </nav>

      {/* Location header */}
      {locationLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : location ? (
        <LocationHeader location={location} score={explain.data?.total_score} />
      ) : !locationLoading && searchData ? (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          <p className="font-semibold">Location not found in current dataset</p>
          <p className="mt-1">ID: {locationId}</p>
          <p className="mt-1 text-xs">The score breakdown below uses the ID directly.</p>
        </div>
      ) : null}

      {/* Stats grid */}
      {location && <LocationStats location={location} />}

      {/* Score explainability */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Score Breakdown</h2>
          <div className="flex items-center gap-2">
            {store.bypassCache && (
              <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">
                cache bypassed
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRerunExplain}
              loading={explain.isPending}
            >
              Recalculate
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Using current weights from the{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Recommender
          </Link>
          . Adjust weights there and click Recalculate.
        </p>

        {explain.isPending && (
          <div className="space-y-3">
            <Skeleton className="h-12" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        )}

        {explain.isError && !explain.isPending && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            <p className="font-semibold">Score calculation failed</p>
            <p className="mt-1">{explain.error?.message}</p>
          </div>
        )}

        {explain.data && <ScoreBreakdown data={explain.data} />}
      </div>
    </div>
  );
}

function LocationHeader({
  location,
  score,
}: {
  location: LocationOut;
  score?: number;
}) {
  const scoreVariant =
    score == null ? "default" : score >= 0.75 ? "success" : score >= 0.5 ? "warning" : "danger";

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{location.city}</h1>
          <p className="text-slate-500 mt-0.5">
            {location.county} County, {location.state}
          </p>
        </div>
        {score != null && (
          <Badge variant={scoreVariant} className="text-sm px-3 py-1">
            Score: {(score * 100).toFixed(1)}
          </Badge>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">ID: {location.location_id}</p>
    </div>
  );
}

function LocationStats({ location }: { location: LocationOut }) {
  const stats = [
    { label: "Median Income", value: formatCurrency(location.median_income) },
    { label: "Home Price", value: formatCurrency(location.home_price) },
    { label: "Rent / mo", value: formatCurrency(location.rent_price) },
    { label: "Population", value: formatNumber(location.population, 0) },
    { label: "Crime Index", value: formatNumber(location.crime_index, 2) },
    { label: "Growth Index", value: formatNumber(location.growth_index, 2) },
    { label: "Latitude", value: location.lat.toFixed(4) },
    { label: "Longitude", value: location.lon.toFixed(4) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-lg bg-white border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

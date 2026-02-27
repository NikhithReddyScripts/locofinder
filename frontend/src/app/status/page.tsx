"use client";

import { useHealth } from "@/hooks/useHealth";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

export default function StatusPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <StatusDot status="error" />
            <h2 className="font-semibold text-red-800">Backend unreachable</h2>
          </div>
          <p className="text-sm text-red-600">{(error as Error)?.message}</p>
          <p className="text-xs text-red-400 mt-2">
            Make sure the backend is running at{" "}
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}
          </p>
        </div>
      )}

      {data && (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {/* Backend */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <StatusDot status="ok" />
              <div>
                <p className="font-semibold text-slate-900">Backend API</p>
                <p className="text-xs text-slate-400">FastAPI / Locofinder</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success">{data.status}</Badge>
              <p className="text-xs text-slate-400 mt-1">v{data.version}</p>
            </div>
          </div>

          {/* Redis */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <StatusDot status={data.redis === "connected" ? "ok" : "error"} />
              <div>
                <p className="font-semibold text-slate-900">Redis Cache</p>
                <p className="text-xs text-slate-400">Result caching layer</p>
              </div>
            </div>
            <Badge variant={data.redis === "connected" ? "success" : "danger"}>
              {data.redis}
            </Badge>
          </div>

          {/* Uptime */}
          <div className="px-5 py-4 bg-slate-50 rounded-b-xl">
            <p className="text-sm text-slate-500">
              Uptime:{" "}
              <strong className="text-slate-700">{formatUptime(data.uptime_seconds)}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-refreshes every 30 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: "ok" | "error" }) {
  return (
    <span
      className={`h-3 w-3 rounded-full shrink-0 ${
        status === "ok" ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

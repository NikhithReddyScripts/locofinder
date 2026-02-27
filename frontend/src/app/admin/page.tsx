"use client";

import { useState } from "react";
import { toast } from "sonner";
import { postAdminReset } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminPage() {
  const [rows, setRows] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setResponse(null);
    setResponseError(null);
    try {
      const result = await postAdminReset(rows);
      setResponse(result);
      toast.success("Dummy data reset triggered successfully");
    } catch (err) {
      const msg = (err as Error).message ?? "Unknown error";
      setResponseError(msg);
      toast.error(`Reset failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Developer tools — use with caution in production.
        </p>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Dev-only endpoint.</strong> This will regenerate all dummy location data in the
        backend.
      </div>

      {/* Reset form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Reset Dummy Data</h2>

        <Input
          label="Number of rows"
          type="number"
          min={1}
          max={100000}
          step={1000}
          value={rows}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) setRows(v);
          }}
          hint="How many dummy location rows to generate"
        />

        <Button onClick={handleReset} loading={loading} variant="danger">
          {loading ? "Resetting…" : `Reset with ${rows.toLocaleString()} rows`}
        </Button>
      </div>

      {/* Response output */}
      {responseError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Error</p>
          <pre className="text-xs text-red-600 whitespace-pre-wrap break-words">{responseError}</pre>
        </div>
      )}

      {response != null && !responseError && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700 mb-2">Response</p>
          <pre className="text-xs text-slate-700 bg-white rounded-md border border-slate-200 p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

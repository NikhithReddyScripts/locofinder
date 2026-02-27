"use client";

import { cn } from "@/lib/utils";

interface WeightSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function WeightSlider({
  label,
  description,
  value,
  onChange,
  className,
}: WeightSliderProps) {
  const pct = Math.round(value * 100);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="w-10 text-right text-sm font-semibold tabular-nums text-blue-700">
          {pct}%
        </span>
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-blue-600"
      />
    </div>
  );
}

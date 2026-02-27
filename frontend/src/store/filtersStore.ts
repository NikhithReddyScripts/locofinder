import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Weights, Filters } from "@/lib/schemas";

export interface FiltersState {
  weights: Weights;
  filters: Filters;
  limit: number;
  bypassCache: boolean;

  setWeight: (key: keyof Weights, value: number) => void;
  setFilter: (key: keyof Filters, value: string | number | null) => void;
  setLimit: (limit: number) => void;
  setBypassCache: (bypass: boolean) => void;
  resetWeights: () => void;
  resetFilters: () => void;

  /** Returns the ScoringRequest body derived from the current store state */
  toScoringRequest: () => { weights: Weights; filters: Filters; limit: number };
}

const DEFAULT_WEIGHTS: Weights = {
  median_income: 0.3,
  crime_index: 0.2,
  growth_index: 0.2,
  home_price: 0.15,
  rent_price: 0.15,
};

const DEFAULT_FILTERS: Filters = {
  state: null,
  max_home_price: null,
  max_rent_price: null,
  min_income: null,
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      weights: { ...DEFAULT_WEIGHTS },
      filters: { ...DEFAULT_FILTERS },
      limit: 20,
      bypassCache: false,

      setWeight: (key, value) =>
        set((state) => ({ weights: { ...state.weights, [key]: value } })),

      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),

      setLimit: (limit) => set({ limit }),

      setBypassCache: (bypassCache) => set({ bypassCache }),

      resetWeights: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

      resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

      toScoringRequest: () => {
        const { weights, filters, limit } = get();
        return { weights, filters, limit };
      },
    }),
    { name: "locofinder-filters" }
  )
);

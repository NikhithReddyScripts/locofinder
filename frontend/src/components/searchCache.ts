// Cache manager for storing real API results

interface CachedSearch {
  settings: {
    businessType: string;
    businessTypeSearch: string;
    searchRadius: number;
    centerPoint: { lat: number; lng: number };
    targetAgeMin: number;
    targetAgeMax: number;
    minIncome: number;
    competitionTolerance: 'low' | 'medium' | 'high';
    footTrafficImportance: 'low' | 'medium' | 'high';
  };
  results: any[];
  timestamp: number;
}

class SearchCache {
  private storageKey = 'locofinder_cached_searches';

  // Generate a unique key for a search
  private generateKey(settings: CachedSearch['settings']): string {
    return `${settings.businessType}_${settings.centerPoint.lat.toFixed(4)}_${settings.centerPoint.lng.toFixed(4)}_${settings.searchRadius}`;
  }

  // Save a search result
  saveSearch(settings: CachedSearch['settings'], results: any[]): void {
    const key = this.generateKey(settings);
    const cached: CachedSearch = {
      settings,
      results,
      timestamp: Date.now(),
    };

    try {
      const allCached = this.getAllCached();
      allCached[key] = cached;
      localStorage.setItem(this.storageKey, JSON.stringify(allCached));
      console.log('✓ Search cached:', key);
    } catch (e) {
      console.error('Failed to cache search:', e);
    }
  }

  // Get a cached search
  getCached(settings: CachedSearch['settings']): CachedSearch | null {
    const key = this.generateKey(settings);
    const allCached = this.getAllCached();
    return allCached[key] || null;
  }

  // Get all cached searches
  getAllCached(): Record<string, CachedSearch> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  // Get list of all cached searches for display
  getCachedList(): Array<{ key: string; label: string; settings: CachedSearch['settings']; timestamp: number }> {
    const allCached = this.getAllCached();
    return Object.entries(allCached).map(([key, cached]) => ({
      key,
      label: `${cached.settings.businessTypeSearch} - ${cached.settings.searchRadius}mi radius`,
      settings: cached.settings,
      timestamp: cached.timestamp,
    }));
  }

  // Clear all cached searches
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    console.log('✓ All cached searches cleared');
  }

  // Remove a specific cached search
  remove(settings: CachedSearch['settings']): void {
    const key = this.generateKey(settings);
    const allCached = this.getAllCached();
    delete allCached[key];
    localStorage.setItem(this.storageKey, JSON.stringify(allCached));
    console.log('✓ Cached search removed:', key);
  }
}

export const searchCache = new SearchCache();
export type { CachedSearch };

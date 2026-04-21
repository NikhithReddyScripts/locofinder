/**
 * Market Research page - Competitor analysis with interactive map
 */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const MarketMap = dynamic(() => import('@/components/market/MarketMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});

interface Competitor {
  id: string;
  displayName?: { text: string };
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  zone_category?: string;
}

export default function MarketResearchPage() {
  const [businessType, setBusinessType] = useState('cafe');
  const [radiusMiles, setRadiusMiles] = useState(1.0);
  const [commercialOnly, setCommercialOnly] = useState(false);
  const [showBoundary, setShowBoundary] = useState(false);
  const [showZoning, setShowZoning] = useState(false);
  const [showPopulation, setShowPopulation] = useState(false);
  
  const [searchCenter, setSearchCenter] = useState<[number, number]>([32.7157, -117.1611]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [population, setPopulation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSearchCenter([lat, lng]);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSelectedPlace(null);
    
    try {
      // Search competitors
      const response = await fetch('/api/v1/market/competitors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: businessType,
          center: { lat: searchCenter[0], lng: searchCenter[1] },

          commercial_only: commercialOnly,
        }),
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setCompetitors(data.places || []);
      setSummary(data.summary || null);

      // Get population estimate
      const popResponse = await fetch('/api/v1/market/population/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center: { lat: searchCenter[0], lng: searchCenter[1] },
          radius_meters: Math.round(radiusMiles * 1609.34),
        }),
      });

      if (popResponse.ok) {
        const popData = await popResponse.json();
        setPopulation(popData.population_estimate);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const competitorsPerTenK = summary && population 
    ? ((summary.count / population) * 10000).toFixed(2)
    : null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-96 border-r bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Market Research</h1>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Business Type</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cafe">Cafe</option>
              <option value="coffee_shop">Coffee Shop</option>
              <option value="restaurant">Restaurant</option>
              <option value="gym">Gym</option>
              <option value="bakery">Bakery</option>
              <option value="bar">Bar</option>
              <option value="clothing_store">Clothing Store</option>
            </select>
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Radius: {radiusMiles} mi
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={commercialOnly}
                onChange={(e) => setCommercialOnly(e.target.checked)}
              />
              <span className="text-sm">Commercial zones only</span>
            </label>
          </div>

          {/* Map Layers */}
          <div>
            <div className="text-sm font-medium mb-2">Map Layers</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                />
                <span className="text-sm">City Boundary</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showZoning}
                  onChange={(e) => setShowZoning(e.target.checked)}
                />
                <span className="text-sm">Zoning</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPopulation}
                  onChange={(e) => setShowPopulation(e.target.checked)}
                />
                <span className="text-sm">Population Density</span>
              </label>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search Competitors'}
          </button>

          {/* Market Summary */}
          {summary && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="font-semibold mb-2">Market Summary</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Competitors:</span>
                  <span className="font-medium">{summary.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Rating:</span>
                  <span className="font-medium">{summary.avg_rating}</span>
                </div>
                {population && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium">{population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per 10k people:</span>
                      <span className="font-medium">{competitorsPerTenK}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Competitors List */}
          {competitors.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-sm">
                Competitors ({competitors.length})
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPlace(comp)}
                  >
                    <div className="font-medium text-sm">
                      {comp.displayName?.text || 'Unknown'}
                    </div>
                    {comp.rating && (
                      <div className="text-xs text-gray-600">
                        ⭐ {comp.rating.toFixed(1)} ({comp.userRatingCount || 0} reviews)
                      </div>
                    )}
                    {comp.zone_category && (
                      <div className="text-xs text-gray-500 mt-1">
                        {comp.zone_category}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Place Details */}
          {selectedPlace && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2">
                {selectedPlace.displayName?.text || 'Unknown'}
              </h3>
              <div className="text-sm space-y-1">
                {selectedPlace.rating && (
                  <div>Rating: {selectedPlace.rating.toFixed(1)} ⭐</div>
                )}
                {selectedPlace.formattedAddress && (
                  <div className="text-gray-600">{selectedPlace.formattedAddress}</div>
                )}
                {selectedPlace.primaryType && (
                  <div>Type: {selectedPlace.primaryType}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MarketMap
          center={searchCenter}
          zoom={12}
          onMapClick={handleMapClick}
          competitors={competitors.map((c) => ({
            id: c.id,
            name: c.displayName?.text || 'Unknown',
            location: c.location,
            rating: c.rating,
            reviews: c.userRatingCount,
          }))}
          showBoundary={showBoundary}
          showZoning={showZoning}
          showPopulation={showPopulation}
        />
      </div>
    </div>
  );
}

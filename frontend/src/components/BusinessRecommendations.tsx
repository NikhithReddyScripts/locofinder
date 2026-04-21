'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import RecommendationCard from './RecommendationCard';
import { searchCache } from './searchCache';

const MapWrapper = dynamic(() => import('./MapWrapper'), { ssr: false });

// Google Places business types (curated list)
const BUSINESS_TYPES = [
  { value: 'cafe', label: 'Cafe / Coffee Shop', category: 'Food & Drink' },
  { value: 'restaurant', label: 'Restaurant', category: 'Food & Drink' },
  { value: 'bakery', label: 'Bakery', category: 'Food & Drink' },
  { value: 'bar', label: 'Bar', category: 'Food & Drink' },
  { value: 'fast_food_restaurant', label: 'Fast Food', category: 'Food & Drink' },
  { value: 'pizza_restaurant', label: 'Pizza Restaurant', category: 'Food & Drink' },
  { value: 'ice_cream_shop', label: 'Ice Cream Shop', category: 'Food & Drink' },
  { value: 'meal_takeaway', label: 'Takeaway Restaurant', category: 'Food & Drink' },
  { value: 'gym', label: 'Gym / Fitness Center', category: 'Health & Fitness' },
  { value: 'spa', label: 'Spa', category: 'Health & Fitness' },
  { value: 'yoga_studio', label: 'Yoga Studio', category: 'Health & Fitness' },
  { value: 'beauty_salon', label: 'Beauty Salon', category: 'Health & Fitness' },
  { value: 'hair_salon', label: 'Hair Salon', category: 'Health & Fitness' },
  { value: 'nail_salon', label: 'Nail Salon', category: 'Health & Fitness' },
  { value: 'grocery_store', label: 'Grocery Store', category: 'Retail' },
  { value: 'supermarket', label: 'Supermarket', category: 'Retail' },
  { value: 'convenience_store', label: 'Convenience Store', category: 'Retail' },
  { value: 'clothing_store', label: 'Clothing Store', category: 'Retail' },
  { value: 'shoe_store', label: 'Shoe Store', category: 'Retail' },
  { value: 'book_store', label: 'Bookstore', category: 'Retail' },
  { value: 'florist', label: 'Florist', category: 'Retail' },
  { value: 'pet_store', label: 'Pet Store', category: 'Retail' },
  { value: 'hardware_store', label: 'Hardware Store', category: 'Retail' },
  { value: 'electronics_store', label: 'Electronics Store', category: 'Retail' },
  { value: 'furniture_store', label: 'Furniture Store', category: 'Retail' },
  { value: 'jewelry_store', label: 'Jewelry Store', category: 'Retail' },
  { value: 'bicycle_store', label: 'Bicycle Store', category: 'Retail' },
  { value: 'liquor_store', label: 'Liquor Store', category: 'Retail' },
  { value: 'laundry', label: 'Laundromat', category: 'Services' },
  { value: 'car_wash', label: 'Car Wash', category: 'Services' },
  { value: 'bank', label: 'Bank', category: 'Services' },
  { value: 'atm', label: 'ATM', category: 'Services' },
  { value: 'gas_station', label: 'Gas Station', category: 'Services' },
  { value: 'parking', label: 'Parking', category: 'Services' },
  { value: 'auto_parts_store', label: 'Auto Parts Store', category: 'Automotive' },
  { value: 'car_dealer', label: 'Car Dealership', category: 'Automotive' },
  { value: 'car_repair', label: 'Auto Repair Shop', category: 'Automotive' },
  { value: 'hospital', label: 'Hospital', category: 'Healthcare' },
  { value: 'pharmacy', label: 'Pharmacy', category: 'Healthcare' },
  { value: 'dentist', label: 'Dentist', category: 'Healthcare' },
  { value: 'doctor', label: 'Doctor', category: 'Healthcare' },
  { value: 'veterinary_care', label: 'Veterinary Clinic', category: 'Healthcare' },
  { value: 'preschool', label: 'Preschool / Daycare', category: 'Education' },
  { value: 'primary_school', label: 'Primary School', category: 'Education' },
  { value: 'secondary_school', label: 'Secondary School', category: 'Education' },
  { value: 'university', label: 'University', category: 'Education' },
  { value: 'library', label: 'Library', category: 'Education' },
  { value: 'night_club', label: 'Night Club', category: 'Entertainment' },
  { value: 'movie_theater', label: 'Movie Theater', category: 'Entertainment' },
  { value: 'bowling_alley', label: 'Bowling Alley', category: 'Entertainment' },
  { value: 'amusement_park', label: 'Amusement Park', category: 'Entertainment' },
  { value: 'tourist_attraction', label: 'Tourist Attraction', category: 'Entertainment' },
  { value: 'lodging', label: 'Hotel / Lodging', category: 'Hospitality' },
  { value: 'rv_park', label: 'RV Park', category: 'Hospitality' },
  { value: 'campground', label: 'Campground', category: 'Hospitality' },
];

interface Recommendation {
  location_id: string;
  name: string;
  lat: number;
  lng: number;
  opportunity_score: number;
  population_estimate: number;
  competitor_count: number;
  market_saturation: number;
  zone_category: string | null;
  in_commercial_zone: boolean;
  retail_center_distance: number | null;
  demographics_score: number;
  foot_traffic_score: number;
  accessibility_score: number;
  competitors: Array<{
    name: string;
    rating: number | null;
    reviews: number | null;
  }>;
  nearest_retail_centers: Array<{
    name: string;
    type: string;
    distance_meters: number;
  }>;
  competitor_analysis?: {
    overall_strengths: string[];
    overall_weaknesses: string[];
    market_opportunities: string[];
    competitor_summaries: Array<{
      name: string;
      summary: string;
    }>;
  };
  demographics_data?: {
    age_distribution: { [key: string]: number };
    income_distribution: { [key: string]: number };
  };
}

export default function BusinessRecommendations() {
  const [businessType, setBusinessType] = useState('cafe');
  const [businessTypeSearch, setBusinessTypeSearch] = useState('');
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);
  const [searchRadius, setSearchRadius] = useState(2.0);
  const [centerPoint, setCenterPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const [targetAgeMin, setTargetAgeMin] = useState(18);
  const [targetAgeMax, setTargetAgeMax] = useState(65);
  const [minIncome, setMinIncome] = useState(20000);
  const [competitionTolerance, setCompetitionTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [footTrafficImportance, setFootTrafficImportance] = useState<'low' | 'medium' | 'high'>('high');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [populationWeight, setPopulationWeight] = useState(0.25);
  const [demographicsWeight, setDemographicsWeight] = useState(0.20);
  const [competitionWeight, setCompetitionWeight] = useState(0.20);
  const [footTrafficWeight, setFootTrafficWeight] = useState(0.15);
  const [transitWeight, setTransitWeight] = useState(0.05);
  const [parkingWeight, setParkingWeight] = useState(0.05);
  const [retailProximityWeight, setRetailProximityWeight] = useState(0.10);

  const [cachedSearches, setCachedSearches] = useState<Array<any>>([]);
  const [showCachedDropdown, setShowCachedDropdown] = useState(false);

  const businessTypeRef = useRef<HTMLDivElement>(null);
  const defaultCenter = { lat: 32.7157, lng: -117.1611 };

  const filteredBusinessTypes = BUSINESS_TYPES.filter(type =>
    type.label.toLowerCase().includes(businessTypeSearch.toLowerCase()) ||
    type.category.toLowerCase().includes(businessTypeSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (businessTypeRef.current && !businessTypeRef.current.contains(event.target as Node)) {
        setShowBusinessTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        const L = leaflet.default;
        
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setL(L);
        setMapReady(true);
      });
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);

      // Load cached searches
      setCachedSearches(searchCache.getCachedList());
    }
  }, []);

  const handleBusinessTypeSelect = (value: string, label: string) => {
    setBusinessType(value);
    setBusinessTypeSearch(label);
    setShowBusinessTypeDropdown(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCenterPoint({ lat, lng });
    setRecommendations([]);
    setError(null);
  };

  const loadCachedSearch = (cachedItem: any) => {
    const { settings } = cachedItem;
    const cached = searchCache.getCached(settings);
    
    if (!cached) return;
    
    // Load settings
    setBusinessType(settings.businessType);
    setBusinessTypeSearch(settings.businessTypeSearch);
    setSearchRadius(settings.searchRadius);
    setCenterPoint(settings.centerPoint);
    setTargetAgeMin(settings.targetAgeMin);
    setTargetAgeMax(settings.targetAgeMax);
    setMinIncome(settings.minIncome);
    setCompetitionTolerance(settings.competitionTolerance);
    setFootTrafficImportance(settings.footTrafficImportance);
    
    // Load cached results immediately
    setRecommendations(cached.results);
    setError(null);
    setLoading(false);
    setShowCachedDropdown(false);
    
    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const fetchRecommendations = async () => {
    if (!centerPoint) {
      setError('Please select a location on the map below');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const customProfile = showAdvanced ? {
        weights: {
          population: populationWeight,
          demographics_match: demographicsWeight,
          competition: competitionWeight,
          foot_traffic: footTrafficWeight,
          transit_access: transitWeight,
          parking: parkingWeight,
          retail_proximity: retailProximityWeight,
        },
        target_age_range: [targetAgeMin, targetAgeMax],
        min_income: minIncome,
        ideal_saturation: competitionTolerance === 'low' ? 2 : competitionTolerance === 'medium' ? 5 : 8,
      } : {
        target_age_range: [targetAgeMin, targetAgeMax],
        min_income: minIncome,
        ideal_saturation: competitionTolerance === 'low' ? 2 : competitionTolerance === 'medium' ? 5 : 8,
      };

      const response = await fetch('https://loco-finder-production.up.railway.app/api/v1/recommend/business-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: businessType,
          num_recommendations: 3,
          search_radius_miles: searchRadius,
          center_lat: centerPoint.lat,
          center_lng: centerPoint.lng,
          commercial_only: false,
          custom_profile: customProfile,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);

      // Auto-save to cache for future demo use
      if (data.recommendations && data.recommendations.length > 0 && centerPoint) {
        const currentSettings = {
          businessType,
          businessTypeSearch,
          searchRadius,
          centerPoint,
          targetAgeMin,
          targetAgeMax,
          minIncome,
          competitionTolerance,
          footTrafficImportance,
        };
        searchCache.saveSearch(currentSettings, data.recommendations);
        // Update cached searches list
        setCachedSearches(searchCache.getCachedList());
      }
    } catch (err) {
      if ((err as any).name === 'AbortError') {
        setError('Request timed out. Try reducing the search radius.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#10b981';
    if (rank === 2) return '#f59e0b';
    return '#ef4444';
  };

  const createNumberIcon = (number: number, color: string) => {
    if (!L) return null;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${number}</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const createCenterIcon = () => {
    if (!L) return null;
    
    return L.divIcon({
      className: 'center-marker',
      html: `
        <div style="
          background-color: #3b82f6;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const radiusInMeters = searchRadius * 1609.34;

  const normalizeWeights = () => {
    const total = populationWeight + demographicsWeight + competitionWeight + 
                  footTrafficWeight + transitWeight + parkingWeight + retailProximityWeight;
    
    if (total === 0) return;

    setPopulationWeight(populationWeight / total);
    setDemographicsWeight(demographicsWeight / total);
    setCompetitionWeight(competitionWeight / total);
    setFootTrafficWeight(footTrafficWeight / total);
    setTransitWeight(transitWeight / total);
    setParkingWeight(parkingWeight / total);
    setRetailProximityWeight(retailProximityWeight / total);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Location Recommendations
        </h1>
        <p className="text-gray-600 mb-8">
          Configure your business preferences, select your search area on the map, then find the best locations
        </p>

        {/* Cached Searches - Instant Demo */}
        {cachedSearches.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  ✨ Load Saved Search (Instant Results)
                </h3>
                <p className="text-xs text-gray-600">
                  Select a previously cached search to see results instantly - no wait time!
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowCachedDropdown(!showCachedDropdown)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm transition-colors flex items-center gap-2"
                >
                  📚 Load Cached ({cachedSearches.length})
                  <span className="text-xs">{showCachedDropdown ? '▼' : '▶'}</span>
                </button>
                
                {showCachedDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {cachedSearches.map((cached, idx) => (
                      <div
                        key={cached.key}
                        onClick={() => loadCachedSearch(cached)}
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100"
                      >
                        <div className="font-medium text-gray-900">{cached.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Lat: {cached.settings.centerPoint.lat.toFixed(4)}, 
                          Lng: {cached.settings.centerPoint.lng.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Saved {new Date(cached.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          searchCache.clearAll();
                          setCachedSearches([]);
                          setShowCachedDropdown(false);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear All Cache
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MOVED UP: Search Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Business Type */}
            <div className="relative" ref={businessTypeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <input
                type="text"
                value={businessTypeSearch}
                onChange={(e) => {
                  setBusinessTypeSearch(e.target.value);
                  setShowBusinessTypeDropdown(true);
                }}
                onFocus={() => setShowBusinessTypeDropdown(true)}
                placeholder="Search business types..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {showBusinessTypeDropdown && filteredBusinessTypes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredBusinessTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleBusinessTypeSelect(type.value, type.label)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-gray-500">{type.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {searchRadius.toFixed(1)} miles
              </label>
              <input
                type="range"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
                step="0.5"
                min="0.5"
                max="5"
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5 mi</span>
                <span>2.5 mi</span>
                <span>5 mi</span>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Profile Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Age Range: {targetAgeMin} - {targetAgeMax} years
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    value={targetAgeMin}
                    onChange={(e) => setTargetAgeMin(parseInt(e.target.value))}
                    min="18"
                    max={targetAgeMax - 1}
                    className="flex-1 h-2 bg-gray-200 rounded-lg"
                  />
                  <input
                    type="range"
                    value={targetAgeMax}
                    onChange={(e) => setTargetAgeMax(parseInt(e.target.value))}
                    min={targetAgeMin + 1}
                    max="80"
                    className="flex-1 h-2 bg-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Income: ${(minIncome / 1000).toFixed(0)}k
                </label>
                <input
                  type="range"
                  value={minIncome}
                  onChange={(e) => setMinIncome(parseInt(e.target.value))}
                  min="20000"
                  max="150000"
                  step="10000"
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Tolerance
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setCompetitionTolerance(level)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        competitionTolerance === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foot Traffic Importance
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFootTrafficImportance(level)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        footTrafficImportance === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-semibold text-gray-900">Advanced Settings</span>
              <span className="text-gray-500">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-gray-600">
                  Fine-tune the scoring weights for your business. All weights will be normalized to sum to 100%.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Population Weight: {(populationWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={populationWeight}
                      onChange={(e) => setPopulationWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Demographics Match: {(demographicsWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={demographicsWeight}
                      onChange={(e) => setDemographicsWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Competition: {(competitionWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={competitionWeight}
                      onChange={(e) => setCompetitionWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foot Traffic: {(footTrafficWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={footTrafficWeight}
                      onChange={(e) => setFootTrafficWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transit Access: {(transitWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={transitWeight}
                      onChange={(e) => setTransitWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking: {(parkingWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={parkingWeight}
                      onChange={(e) => setParkingWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retail Proximity: {(retailProximityWeight * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      value={retailProximityWeight}
                      onChange={(e) => setRetailProximityWeight(parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-full h-2 bg-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={normalizeWeights}
                  className="mt-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                >
                  Normalize Weights to 100%
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={fetchRecommendations}
            disabled={loading || !centerPoint}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading 
              ? `Analyzing locations... (~${Math.round(searchRadius * 15)} sec estimated)` 
              : !centerPoint
              ? 'Select a point on the map below'
              : 'Find Best Locations'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* MOVED DOWN: Map */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="h-[500px] relative">
            {mapReady && (
              <MapWrapper
                centerPoint={centerPoint}
                defaultCenter={defaultCenter}
                radiusInMeters={radiusInMeters}
                recommendations={recommendations}
                L={L}
                onMapClick={handleMapClick}
                createCenterIcon={createCenterIcon}
                createNumberIcon={createNumberIcon}
                getRankColor={getRankColor}
              />
            )}
          </div>
          
          {!centerPoint && (
            <div className="bg-blue-50 border-t border-blue-200 px-4 py-3 text-blue-800 text-sm">
              👆 Click anywhere on the map to set your search center point
            </div>
          )}
          
          {centerPoint && !recommendations.length && !loading && (
            <div className="bg-green-50 border-t border-green-200 px-4 py-3 text-green-800 text-sm">
              ✓ Search area selected at {centerPoint.lat.toFixed(4)}, {centerPoint.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <RecommendationCard 
                key={rec.location_id}
                recommendation={rec}
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

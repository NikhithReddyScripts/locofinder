/**
 * MarketMap - Interactive map for competitor analysis and location research
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MarketMapProps {
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  competitors?: Array<{
    id: string;
    name: string;
    location: { latitude: number; longitude: number };
    rating?: number;
    reviews?: number;
  }>;
  showBoundary?: boolean;
  showZoning?: boolean;
  showPopulation?: boolean;
}

export default function MarketMap({
  center = [32.7157, -117.1611], // San Diego default
  zoom = 11,
  onMapClick,
  competitors = [],
  showBoundary = false,
  showZoning = false,
  showPopulation = false,
}: MarketMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const zoningLayerRef = useRef<L.GeoJSON | null>(null);
  const populationLayerRef = useRef<L.GeoJSON | null>(null);
  const competitorLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Initialize layer groups
    competitorLayerRef.current = L.layerGroup().addTo(map);

    // Handle map clicks
    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update competitors markers
  useEffect(() => {
    if (!mapRef.current || !competitorLayerRef.current) return;

    competitorLayerRef.current.clearLayers();

    competitors.forEach((comp) => {
      const marker = L.marker([comp.location.latitude, comp.location.longitude], {
        icon: L.divIcon({
          className: 'competitor-marker',
          html: `
            <div style="
              background: #ef4444;
              color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${comp.rating ? comp.rating.toFixed(1) : '?'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      });

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${comp.name}</h3>
          ${comp.rating ? `<div>⭐ ${comp.rating.toFixed(1)} (${comp.reviews || 0} reviews)</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      competitorLayerRef.current?.addLayer(marker);
    });
  }, [competitors]);

  // Load boundary layer
  useEffect(() => {
    if (!mapRef.current || !showBoundary) {
      if (boundaryLayerRef.current) {
        mapRef.current?.removeLayer(boundaryLayerRef.current);
        boundaryLayerRef.current = null;
      }
      return;
    }

    if (boundaryLayerRef.current) return; // Already loaded

    fetch('/api/v1/market/geo/boundary')
      .then((res) => res.json())
      .then((geojson) => {
        if (!mapRef.current) return;

        boundaryLayerRef.current = L.geoJSON(geojson, {
          style: {
            color: '#3b82f6',
            weight: 2,
            fillOpacity: 0.05,
          },
        }).addTo(mapRef.current);
      })
      .catch((err) => console.error('Failed to load boundary:', err));
  }, [showBoundary]);

  // Load zoning layer
  useEffect(() => {
    if (!mapRef.current || !showZoning) {
      if (zoningLayerRef.current) {
        mapRef.current?.removeLayer(zoningLayerRef.current);
        zoningLayerRef.current = null;
      }
      return;
    }

    if (zoningLayerRef.current) return;

    fetch('/api/v1/market/geo/zoning')
      .then((res) => res.json())
      .then((geojson) => {
        if (!mapRef.current) return;

        const zoneColors: Record<string, string> = {
          Commercial: '#f59e0b',
          'Mixed-use': '#8b5cf6',
          Industrial: '#6b7280',
          Residential: '#10b981',
          Other: '#d1d5db',
        };

        zoningLayerRef.current = L.geoJSON(geojson, {
          style: (feature) => {
            const category = feature?.properties?.zone_category || 'Other';
            return {
              color: zoneColors[category] || '#999',
              weight: 1,
              fillOpacity: 0.2,
            };
          },
          onEachFeature: (feature, layer) => {
            const category = feature?.properties?.zone_category;
            const name = feature?.properties?.zone_name;
            layer.bindPopup(`<b>${category}</b><br/>${name}`);
          },
        }).addTo(mapRef.current);
      })
      .catch((err) => console.error('Failed to load zoning:', err));
  }, [showZoning]);

  // Load population layer
  useEffect(() => {
    if (!mapRef.current || !showPopulation) {
      if (populationLayerRef.current) {
        mapRef.current?.removeLayer(populationLayerRef.current);
        populationLayerRef.current = null;
      }
      return;
    }

    if (populationLayerRef.current) return;

    fetch('/api/v1/market/population/blockgroups')
      .then((res) => res.json())
      .then((geojson) => {
        if (!mapRef.current) return;

        // Color scale for population density
        const getColor = (pop: number) => {
          if (pop > 3000) return '#800026';
          if (pop > 2000) return '#bd0026';
          if (pop > 1500) return '#e31a1c';
          if (pop > 1000) return '#fc4e2a';
          if (pop > 500) return '#fd8d3c';
          if (pop > 200) return '#feb24c';
          if (pop > 100) return '#fed976';
          return '#ffeda0';
        };

        populationLayerRef.current = L.geoJSON(geojson, {
          style: (feature) => {
            const pop = feature?.properties?.population || 0;
            return {
              fillColor: getColor(pop),
              weight: 1,
              opacity: 0.5,
              color: 'white',
              fillOpacity: 0.5,
            };
          },
          onEachFeature: (feature, layer) => {
            const pop = feature?.properties?.population || 0;
            layer.bindPopup(`<b>Population:</b> ${pop.toLocaleString()}`);
          },
        }).addTo(mapRef.current);
      })
      .catch((err) => console.error('Failed to load population:', err));
  }, [showPopulation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend */}
      {(showZoning || showPopulation) && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs z-[1000]">
          {showZoning && (
            <div className="mb-2">
              <div className="font-semibold mb-1">Zoning</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 opacity-50"></div>
                <span>Commercial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 opacity-50"></div>
                <span>Mixed-use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 opacity-50"></div>
                <span>Residential</span>
              </div>
            </div>
          )}
          {showPopulation && (
            <div>
              <div className="font-semibold mb-1">Population</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4" style={{ background: '#800026' }}></div>
                <span>&gt; 3000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4" style={{ background: '#fc4e2a' }}></div>
                <span>1000-1500</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4" style={{ background: '#fed976' }}></div>
                <span>&lt; 200</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

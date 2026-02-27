"use client";

/**
 * MapView — rendered only on the client (no SSR) because Leaflet needs `window`.
 *
 * This file is the real implementation; it is dynamically imported from
 * ResultsView with `{ ssr: false }`.
 */

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { RecommendResult } from "@/lib/schemas";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

// Fix Leaflet's default icon path issue in webpack/Next.js builds
function fixLeafletIcons() {
  // Leaflet's internal property needs to be deleted to allow custom icon URLs
  const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

/** Fit map bounds to visible markers */
function BoundsAdjuster({ results }: { results: RecommendResult[] }) {
  const map = useMap();
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (results.length === 0) return;
    if (results.length === prevCountRef.current) return;
    prevCountRef.current = results.length;

    const bounds = L.latLngBounds(results.map((r) => [r.location.lat, r.location.lon]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [map, results]);

  return null;
}

interface MapViewProps {
  results: RecommendResult[];
  onSelectMarker?: (result: RecommendResult) => void;
  selectedId?: string;
}

export default function MapView({ results, onSelectMarker, selectedId }: MapViewProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-slate-100 rounded-xl text-slate-400">
        No results to map.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: 520 }}>
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsAdjuster results={results} />
        {results.map(({ location, total_score }) => {
          const isSelected = selectedId === location.location_id;
          const icon = L.divIcon({
            html: `<div style="
              background:${isSelected ? "#2563eb" : "#3b82f6"};
              color:white;
              padding:3px 6px;
              border-radius:4px;
              font-size:11px;
              font-weight:600;
              white-space:nowrap;
              box-shadow:0 1px 3px rgba(0,0,0,.3);
              border:${isSelected ? "2px solid #1e3a8a" : "1px solid #1d4ed8"};
            ">${location.city} ${(total_score * 100).toFixed(0)}</div>`,
            className: "",
            iconAnchor: [0, 0],
          });

          return (
            <Marker
              key={location.location_id}
              position={[location.lat, location.lon]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectMarker?.({ location, total_score }),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[160px]">
                  <p className="font-semibold">
                    {location.city}, {location.state}
                  </p>
                  <p className="text-slate-500 text-xs">{location.county} County</p>
                  <div className="mt-2 space-y-0.5 text-xs">
                    <p>
                      Score:{" "}
                      <strong className="text-blue-700">{(total_score * 100).toFixed(1)}</strong>
                    </p>
                    <p>Income: {formatCurrency(location.median_income)}</p>
                    <p>Home: {formatCurrency(location.home_price)}</p>
                    <p>Rent: {formatCurrency(location.rent_price)}/mo</p>
                    <p>Growth: {formatNumber(location.growth_index, 1)}</p>
                  </div>
                  <Link
                    href={`/location/${location.location_id}`}
                    className="mt-2 block text-blue-600 hover:underline text-xs"
                  >
                    View detail →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

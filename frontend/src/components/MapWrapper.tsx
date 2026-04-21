'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';

// Map click handler - uses useMapEvents hook
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked at:', e.latlng.lat, e.latlng.lng);
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapWrapperProps {
  centerPoint: { lat: number; lng: number } | null;
  defaultCenter: { lat: number; lng: number };
  radiusInMeters: number;
  recommendations: any[];
  L: any;
  onMapClick: (lat: number, lng: number) => void;
  createCenterIcon: () => any;
  createNumberIcon: (num: number, color: string) => any;
  getRankColor: (rank: number) => string;
}

export default function MapWrapper({
  centerPoint,
  defaultCenter,
  radiusInMeters,
  recommendations,
  L,
  onMapClick,
  createCenterIcon,
  createNumberIcon,
  getRankColor,
}: MapWrapperProps) {
  return (
    <MapContainer
      center={[defaultCenter.lat, defaultCenter.lng]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {/* Click handler */}
      <MapEvents onClick={onMapClick} />
      
      {/* Center point marker */}
      {centerPoint && L && (
        <>
          <Marker
            position={[centerPoint.lat, centerPoint.lng]}
            icon={createCenterIcon()}
          >
            <Popup>
              <div className="font-semibold">Search Center</div>
              <div className="text-sm">
                {centerPoint.lat.toFixed(4)}, {centerPoint.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
          
          {/* Search radius circle */}
          <Circle
            center={[centerPoint.lat, centerPoint.lng]}
            radius={radiusInMeters}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        </>
      )}
      
      {/* Recommendation markers */}
      {recommendations.map((rec, idx) => {
        const icon = createNumberIcon(idx + 1, getRankColor(idx + 1));
        if (!icon) return null;
        
        return (
          <Marker
            key={rec.location_id}
            position={[rec.lat, rec.lng]}
            icon={icon}
          >
            <Popup>
              <div className="font-semibold">#{idx + 1} {rec.name}</div>
              <div className="text-sm">Score: {rec.opportunity_score}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

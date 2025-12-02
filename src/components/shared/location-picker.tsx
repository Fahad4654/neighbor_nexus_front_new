'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Skeleton } from '@/components/ui/skeleton';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


interface LocationPickerProps {
    onLocationChange: (location: { lat: number; lng: number }) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This now runs only once, preventing re-renders from HMR in dev
        setIsClient(true);
    }, []);

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        setPosition(e.latlng);
        onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    const displayPosition = useMemo(() => {
        return position ? position : new L.LatLng(51.505, -0.09) // Default to London
    }, [position]);


  if (!isClient) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <MapContainer 
      key="leaflet-map-client"
      center={displayPosition} 
      zoom={position ? 13 : 5} 
      scrollWheelZoom={false} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={handleMapClick} />
      {position && <Marker position={position}></Marker>}
    </MapContainer>
  );
}

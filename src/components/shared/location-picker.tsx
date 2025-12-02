'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
};

interface LocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(defaultCenter);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '',
  });

  useEffect(() => {
    // Pass the default location up on initial load
    if (defaultCenter) {
      onLocationChange(defaultCenter);
    }
  }, [onLocationChange]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setPosition(newPosition);
      onLocationChange(newPosition);
    }
  };

  if (loadError) {
    return <div>Error loading maps. Please check the API key.</div>;
  }

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position || defaultCenter}
      zoom={position ? 13 : 11}
      onClick={handleMapClick}
    >
      {position && <Marker position={position} />}
    </GoogleMap>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
};

const libraries: ('places')[] = ['places'];

interface LocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(defaultCenter);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '',
    libraries,
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

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPosition(newPosition);
        onLocationChange(newPosition);

        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
          mapRef.current.setZoom(15);
        }
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (loadError) {
    return <div>Error loading maps. Please check the API key.</div>;
  }

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position || defaultCenter}
        zoom={position ? 13 : 11}
        onClick={handleMapClick}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] sm:w-[70%] md:w-[50%]">
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <Input
              type="text"
              placeholder="Search for a location"
              className="w-full bg-white shadow-md"
            />
          </Autocomplete>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  initialPosition?: { lat: number; lng: number } | null;
}

export default function LocationPicker({ onLocationChange, initialPosition }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || defaultCenter);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    // Pass the initial location up on mount
    if (initialPosition) {
        setPosition(initialPosition);
        onLocationChange(initialPosition);
    } else {
        onLocationChange(defaultCenter);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the initialPosition prop changes (e.g., from parent state), update our internal state
  useEffect(() => {
      if (initialPosition && (initialPosition.lat !== position?.lat || initialPosition.lng !== position?.lng)) {
          setPosition(initialPosition);
           if (mapRef.current) {
            mapRef.current.panTo(initialPosition);
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition]);


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
  
  const handleMyLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const newPosition = {
            lat: geoPosition.coords.latitude,
            lng: geoPosition.coords.longitude,
          };
          setPosition(newPosition);
          onLocationChange(newPosition);

          if (mapRef.current) {
            mapRef.current.panTo(newPosition);
            mapRef.current.setZoom(15);
          }
           toast({
            title: "Location Found",
            description: "Map centered on your current location.",
          });
        },
        (error) => {
           console.error("Error getting user location: ", error);
           toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Please ensure you've granted permission.",
          });
        }
      );
    } else {
       toast({
        variant: "destructive",
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
      });
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
        options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }}
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
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-4 right-4 h-10 w-10 shadow-md"
        onClick={handleMyLocationClick}
      >
        <LocateFixed className="h-5 w-5" />
        <span className="sr-only">My Location</span>
      </Button>
    </div>
  );
}

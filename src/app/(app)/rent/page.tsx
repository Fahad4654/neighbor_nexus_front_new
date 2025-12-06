'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AuthenticatedImage from '@/components/shared/authenticated-image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wrench, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type ToolImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

export type Tool = {
  listing_id: string;
  title: string;
  listing_type: 'Tool' | 'Skill';
  daily_price: string;
  images: ToolImage[] | null; // Can be null
  owner_id: string;
  distanceText?: string;
};

function ListingsGrid({ listings, isLoading, error, noDataTitle, noDataDescription }: { listings: Tool[], isLoading: boolean, error: string | null, noDataTitle: string, noDataDescription: string }) {
    
    const getPrimaryImage = (images: ToolImage[] | null) => {
        if (!images || images.length === 0) {
            return '/media/tools/default.png'; // A default placeholder
        }
        const primary = images.find(img => img.is_primary);
        return primary ? primary.image_url : images[0].image_url;
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden h-full flex flex-col">
                        <CardHeader className="p-0">
                            <Skeleton className="aspect-video w-full" />
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col flex-grow">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <div className="flex-grow" />
                            <Skeleton className="h-5 w-1/3 mt-2" />
                            <Skeleton className="h-7 w-1/2 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Wrench className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (listings.length === 0) {
        return (
            <Alert>
                <Wrench className="h-4 w-4" />
                <AlertTitle>{noDataTitle}</AlertTitle>
                <AlertDescription>{noDataDescription}</AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <Link href={`/rent/${listing.listing_id}`} key={listing.listing_id}>
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative aspect-video">
                    <AuthenticatedImage
                      src={getPrimaryImage(listing.images)}
                      alt={listing.title}
                      className="object-contain"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <Badge variant={listing.listing_type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.listing_type}</Badge>
                  <CardTitle className="text-lg font-headline mb-1">{listing.title}</CardTitle>
                  <div className="flex-grow" />
                   {listing.distanceText && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.distanceText} away</span>
                    </div>
                  )}
                  <CardDescription className="text-base font-bold text-primary mt-1">
                    BDT {parseFloat(listing.daily_price).toFixed(2)} / day
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
    );
}

function RentPageComponent() {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [rentListings, setRentListings] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchRentListings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`${backendUrl}/tools/gooleNearby/${user.id}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `Failed to fetch nearby listings.`);
      }
      
      setRentListings(result.data || []);
    } catch (err: any)      {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: `Error fetching nearby listings`,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, toast, user]);

  useEffect(() => {
    if (user) {
        fetchRentListings();
    }
  }, [fetchRentListings, user]);

  const filteredListings = useMemo(() => {
    if (!searchQuery) {
      return rentListings;
    }
    return rentListings.filter(listing => 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rentListings, searchQuery]);

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold">Rent from Your Nexus</h1>
                <p className="text-muted-foreground">Browse tools and skills shared by others in your community, sorted by proximity.</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search for tools or skills..." 
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
         <ListingsGrid 
            listings={filteredListings}
            isLoading={isLoading}
            error={error}
            noDataTitle="Nothing to Rent Nearby"
            noDataDescription={searchQuery ? "No items match your search." : "There are currently no items available for rent from other users near you."}
          />
    </div>
  );
}

export default function RentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RentPageComponent />
        </Suspense>
    );
}

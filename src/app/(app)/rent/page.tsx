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
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  distanceMeters?: number;
  distanceText?: string;
};

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

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

    if (!listings || listings.length === 0) {
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

const SORT_OPTIONS = {
    distance: [{ column: 'distance', order: 'ASC' }],
    availability: [{ column: 'is_available', order: 'DESC' }, { column: 'distance', order: 'ASC' }],
    price_asc: [{ column: 'daily_price', order: 'ASC' }, { column: 'distance', order: 'ASC' }],
    price_desc: [{ column: 'daily_price', order: 'DESC' }, { column: 'distance', order: 'ASC' }],
};

type SortOptionKey = keyof typeof SORT_OPTIONS;

function RentPageComponent() {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [rentListings, setRentListings] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<number>(50); // Default to 50km
  const [sortOption, setSortOption] = useState<SortOptionKey>('distance');
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
        const params = new URLSearchParams();
        params.append('maxDistance', (distanceFilter * 1000).toString());
        if (debouncedSearchQuery) {
            params.append('search', debouncedSearchQuery);
        }
        
        const sortCriteria = SORT_OPTIONS[sortOption];
        params.append('sort', JSON.stringify(sortCriteria));
        
        const response = await api.get(`${backendUrl}/tools/gooleNearby/${user.id}?${params.toString()}`);
        const result = await response.json();
      
        if (!response.ok) {
            throw new Error(result.message || result.error || `Failed to fetch nearby listings.`);
        }
      
        // The API returns { tools: [...] } inside the data object
        const listingsArray = result.data?.tools || [];
        setRentListings(listingsArray);
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
  }, [api, toast, user, debouncedSearchQuery, distanceFilter, sortOption]);

  useEffect(() => {
    if (user) {
        fetchRentListings();
    }
  }, [fetchRentListings, user]);

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-2xl font-bold">Rent from Your Nexus</h1>
          <p className="text-muted-foreground">Browse tools and skills shared by others in your community.</p>
      </div>
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="search"
                        type="search"
                        placeholder="Search for tools or skills..." 
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="md:col-span-1 space-y-2">
                <Label htmlFor="distance">Distance (up to {distanceFilter} km)</Label>
                <Slider
                    id="distance"
                    min={1}
                    max={100}
                    step={1}
                    value={[distanceFilter]}
                    onValueChange={(value) => setDistanceFilter(value[0])}
                />
            </div>
            <div className="md:col-span-1 space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                 <Select value={sortOption} onValueChange={(value: SortOptionKey) => setSortOption(value)}>
                    <SelectTrigger id="sort" className="w-full">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="distance">Distance: Closest</SelectItem>
                        <SelectItem value="availability">Availability</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <ListingsGrid 
          listings={rentListings}
          isLoading={isLoading}
          error={error}
          noDataTitle="Nothing to Rent Nearby"
          noDataDescription={searchQuery || distanceFilter < 100 ? "No items match your filters." : "There are currently no items available for rent from other users near you."}
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

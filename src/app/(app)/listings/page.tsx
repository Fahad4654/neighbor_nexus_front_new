'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AuthenticatedImage from '@/components/shared/authenticated-image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wrench } from 'lucide-react';
import { CreateListingDialog } from '@/components/listings/create-listing-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  images: ToolImage[];
  owner_id: string;
};

function ListingsGrid({ listings, isLoading, error, noDataTitle, noDataDescription }: { listings: Tool[], isLoading: boolean, error: string | null, noDataTitle: string, noDataDescription: string }) {
    
    const getPrimaryImage = (images: ToolImage[]) => {
        if (!images || images.length === 0) {
            return '/media/tools/default.png';
        }
        const primary = images.find(img => img.is_primary);
        return primary ? primary.image_url : images[0].image_url;
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden h-full flex flex-col">
                        <CardHeader className="p-0">
                            <Skeleton className="aspect-video w-full" />
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col flex-grow">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-7 w-1/2 mt-auto" />
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
            <Link href={`/listings/${listing.listing_id}`} key={listing.listing_id}>
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
                  <CardDescription className="text-base font-bold text-primary flex-grow mt-auto">
                    BDT {parseFloat(listing.daily_price).toFixed(2)} / day
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
    );
}

export default function ListingsPage() {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [myListings, setMyListings] = useState<Tool[]>([]);
  const [rentListings, setRentListings] = useState<Tool[]>([]);
  const [isMyListingsLoading, setIsMyListingsLoading] = useState(true);
  const [isRentListingsLoading, setIsRentListingsLoading] = useState(true);
  const [myListingsError, setMyListingsError] = useState<string | null>(null);
  const [rentListingsError, setRentListingsError] = useState<string | null>(null);

  const fetchListings = useCallback(async (type: 'my' | 'rent') => {
    if (!user) return;
    
    const setIsLoading = type === 'my' ? setIsMyListingsLoading : setIsRentListingsLoading;
    const setError = type === 'my' ? setMyListingsError : setRentListingsError;
    const setListings = type === 'my' ? setMyListings : setRentListings;

    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        order: 'createdAt',
        asc: 'DESC',
        page: 1,
        pageSize: 10,
      };

      if (type === 'my') {
        payload.owner_id = user.id;
      } else {
        payload.not_owner_id = user.id;
      }
      
      const response = await api.post(`${backendUrl}/tools/all`, payload);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `Failed to fetch ${type === 'my' ? 'your' : 'rentable'} listings.`);
      }
      
      setListings(result.data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: `Error fetching ${type === 'my' ? 'your' : 'rentable'} listings`,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, toast, user]);

  useEffect(() => {
    if (user) {
        fetchListings('my');
        fetchListings('rent');
    }
  }, [fetchListings, user]);
  
  const handleListingCreated = () => {
    fetchListings('my');
  }

  return (
    <Tabs defaultValue="my-listings" className="space-y-4">
       <div className="flex items-center justify-between gap-4">
         <TabsList>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>
        {user && !user.isAdmin && <CreateListingDialog onListingCreated={handleListingCreated} />}
      </div>

      <TabsContent value="my-listings">
          <ListingsGrid 
            listings={myListings}
            isLoading={isMyListingsLoading}
            error={myListingsError}
            noDataTitle="No Listings Found"
            noDataDescription="You haven't created any listings yet. Get started by adding a new tool or skill!"
          />
      </TabsContent>
      <TabsContent value="rent">
         <ListingsGrid 
            listings={rentListings}
            isLoading={isRentListingsLoading}
            error={rentListingsError}
            noDataTitle="Nothing to Rent"
            noDataDescription="There are currently no items available for rent from other users in your nexus."
          />
      </TabsContent>
    </Tabs>
  );
}

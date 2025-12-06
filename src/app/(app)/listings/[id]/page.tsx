
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Verified, AlertCircle } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type ToolImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

type Owner = {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    geo_location: {
        type: string;
        coordinates: [number, number];
    }
};

type ListingData = {
    listing_id: string;
    owner_id: string;
    listing_type: 'Tool' | 'Service';
    title: string;
    description: string;
    hourly_price: string;
    daily_price: string;
    security_deposit: string;
    is_available: boolean;
    createdAt: string;
    updatedAt: string;
    owner: Owner;
    images: ToolImage[];
};

const ListingDetailSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <Skeleton className="h-10 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>About the owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
);


export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { api, user: authUser } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }
    
    try {
        const response = await api.get(`${backendUrl}/tools/${params.id}`);
        const result = await response.json();

        if(!response.ok){
            throw new Error(result.message || result.error || 'Failed to fetch listing details');
        }

        setListing(result.data);

    } catch (err: any) {
        setError(err.message);
        toast({
            variant: 'destructive',
            title: 'Error fetching listing',
            description: err.message,
        });
    } finally {
        setIsLoading(false);
    }
  }, [api, params.id, toast]);

  useEffect(() => {
    if (params.id) {
        fetchListing();
    } else {
        setError("No listing ID provided.");
        setIsLoading(false);
    }
  }, [params.id, fetchListing]);

  const getPrimaryImage = (images: ToolImage[]) => {
    if (!images || images.length === 0) {
      return '/media/tools/default.png'; // A default placeholder
    }
    const primary = images.find(img => img.is_primary);
    return primary ? primary.image_url : images[0].image_url;
  };

  if (isLoading) {
    return <ListingDetailSkeleton />;
  }

  if (error) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
     );
  }

  if (!listing) {
    notFound();
  }
  
  const owner = listing.owner;
  const ownerName = `${owner.firstname} ${owner.lastname}`;
  const getInitials = (firstname?: string, lastname?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`;
    }
    if (firstname) {
      return firstname.charAt(0);
    }
    return 'U';
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video">
              <AuthenticatedImage
                src={getPrimaryImage(listing.images)}
                alt={listing.title}
                className="object-cover"
              />
            </div>
            <CardHeader>
              <Badge variant={listing.listing_type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.listing_type}</Badge>
              <CardTitle className="text-3xl font-headline">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{listing.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">BDT {parseFloat(listing.daily_price).toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / day</span></CardTitle>
                <CardDescription>Hourly: BDT {parseFloat(listing.hourly_price).toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full" disabled={!listing.is_available}>
                {listing.is_available ? `Request to ${listing.listing_type === 'Tool' ? 'Rent' : 'Book'}` : 'Currently Unavailable'}
                </Button>
              <Button size="lg" variant="outline" className="w-full">Message Owner</Button>
            </CardContent>
          </Card>
          {owner && (
            <Card>
              <CardHeader>
                <CardTitle>About the owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                     <AvatarFallback>{getInitials(owner.firstname, owner.lastname)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold flex items-center gap-1">{ownerName}</div>
                    {/* Placeholder for owner rating. Assuming we don't get this from the API yet. */}
                    {/* <StarRating rating={4.5} starSize={3}/> */}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location available upon booking</div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined in {new Date(listing.createdAt).getFullYear()}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Community Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="text-muted-foreground">Reviews are not available at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
}

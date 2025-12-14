
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AuthenticatedImage from '@/components/shared/authenticated-image';
import type { Tool } from '@/app/(app)/listings/page';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, PackageCheck, PackageX, TrendingUp, Calendar, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';

interface ListingDetailDialogProps {
  listing: Tool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailDialog({ listing, open, onOpenChange }: ListingDetailDialogProps) {
  const [primaryImage, setPrimaryImage] = useState('/media/tools/default.png');
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(primaryImage);

  useEffect(() => {
    if (listing?.images && listing.images.length > 0) {
      const primary = listing.images.find(img => img.is_primary) || listing.images[0];
      const secondaries = listing.images.map(img => img.image_url);
      
      setPrimaryImage(primary.image_url);
      setSelectedImage(primary.image_url);
      setSecondaryImages(secondaries);
    } else {
      const defaultImg = '/media/tools/default.png';
      setPrimaryImage(defaultImg);
      setSelectedImage(defaultImg);
      setSecondaryImages([]);
    }
  }, [listing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                 <div className="relative aspect-video w-full overflow-hidden rounded-md">
                     <AuthenticatedImage
                        src={selectedImage}
                        alt={listing.title}
                        className="object-contain"
                    />
                     <Badge variant={listing.is_approved ? 'default' : 'destructive'} className={cn('absolute top-2 right-2 gap-1 z-10', listing.is_approved ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600')}>
                        {listing.is_approved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {listing.is_approved ? 'Verified' : 'Pending'}
                    </Badge>
                </div>

                {secondaryImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                        {secondaryImages.map((image, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "relative aspect-square w-full overflow-hidden rounded-md cursor-pointer border-2",
                                    selectedImage === image ? "border-primary" : "border-transparent"
                                )}
                                onClick={() => setSelectedImage(image)}
                            >
                                <AuthenticatedImage
                                    src={image}
                                    alt={`${listing.title} thumbnail ${index + 1}`}
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <DialogHeader>
                    <Badge variant={listing.listing_type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.listing_type}</Badge>
                    <DialogTitle className="text-2xl font-headline">{listing.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-base">{listing.description}</DialogDescription>

                <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground flex items-center gap-2">Daily Price:</span>
                        <span className="text-primary font-bold">BDT {parseFloat(listing.daily_price).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground flex items-center gap-2">Hourly Price:</span>
                        <span className="text-primary font-bold">BDT {parseFloat(listing.hourly_price).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-muted-foreground flex items-center gap-2"><KeyRound/> Security Deposit</span>
                        <span className="font-bold text-lg">BDT {parseFloat(listing.security_deposit).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><TrendingUp /> Rental Count</span>
                        <span>{listing.rental_count}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                            {listing.is_available ? <PackageCheck /> : <PackageX />}
                            Availability
                        </span>
                        <Badge variant={listing.is_available ? 'secondary' : 'destructive'}>
                           {listing.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Calendar /> Listed On</span>
                        <span>{format(new Date(listing.createdAt), 'PP')}</span>
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

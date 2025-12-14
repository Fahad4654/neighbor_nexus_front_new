
'use client';

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
import { CheckCircle, XCircle } from 'lucide-react';

interface ListingDetailDialogProps {
  listing: Tool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPrimaryImage = (images: Tool['images']) => {
    if (!images || images.length === 0) {
        return '/media/tools/default.png';
    }
    const primary = images.find(img => img.is_primary);
    return primary ? primary.image_url : images[0].image_url;
};

export function ListingDetailDialog({ listing, open, onOpenChange }: ListingDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-video">
                <AuthenticatedImage
                    src={getPrimaryImage(listing.images)}
                    alt={listing.title}
                    className="object-contain rounded-md"
                />
                <Badge variant={listing.is_approved ? 'default' : 'destructive'} className={cn('absolute top-2 right-2 gap-1', listing.is_approved ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600')}>
                    {listing.is_approved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {listing.is_approved ? 'Verified' : 'Pending'}
                </Badge>
            </div>
            <div className="space-y-4">
                <DialogHeader>
                    <Badge variant={listing.listing_type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.listing_type}</Badge>
                    <DialogTitle className="text-2xl font-headline">{listing.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-base">{listing.description}</DialogDescription>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold">Daily Price:</span>
                        <span className="text-primary font-bold">BDT {parseFloat(listing.daily_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">Hourly Price:</span>
                        <span className="text-primary font-bold">BDT {parseFloat(listing.hourly_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold">Security Deposit:</span>
                        <span className="text-primary font-bold">BDT {parseFloat(listing.security_deposit).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-semibold">Availability:</span>
                        <Badge variant={listing.is_available ? 'secondary' : 'destructive'}>
                           {listing.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

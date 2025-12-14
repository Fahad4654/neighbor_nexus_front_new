'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import type { Tool } from '@/app/(app)/listings/page';
import AuthenticatedImage from '../shared/authenticated-image';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  listing_type: z.enum(['Tool', 'Skill']),
  hourly_price: z.coerce.number().min(0, 'Hourly price must be a positive number'),
  daily_price: z.coerce.number().min(0, 'Daily price must be a positive number'),
  security_deposit: z.coerce.number().min(0, 'Security deposit must be a positive number'),
  is_available: z.boolean().default(true),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface EditListingDialogProps {
    listing: Tool;
    onListingUpdated: () => void;
}

export function EditListingDialog({ listing, onListingUpdated }: EditListingDialogProps) {
  const [open, setOpen] = useState(false);
  const { user, api } = useAuth();
  const { toast } = useToast();
  
  const getPrimaryImage = (images: Tool['images']) => {
    if (!images || images.length === 0) return '/media/tools/default.png';
    const primary = images.find(img => img.is_primary);
    return primary ? primary.image_url : images[0].image_url;
  };

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      listing_type: listing.listing_type,
      hourly_price: parseFloat(listing.hourly_price),
      daily_price: parseFloat(listing.daily_price),
      security_deposit: parseFloat(listing.security_deposit),
      is_available: listing.is_available,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: listing.title,
        description: listing.description,
        listing_type: listing.listing_type,
        hourly_price: parseFloat(listing.hourly_price),
        daily_price: parseFloat(listing.daily_price),
        security_deposit: parseFloat(listing.security_deposit),
        is_available: listing.is_available,
      });
    }
  }, [open, listing, form]);

  const onSubmit = async (values: ListingFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to update a listing.',
      });
      return;
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Backend URL is not configured.',
      });
      return;
    }

    try {
      const response = await api.put(`${backendUrl}/tools`, {
          ...values,
          tool_id: listing.listing_id,
          updatedBy: user.id
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to update listing.');
      }

      toast({
        title: 'Listing Updated',
        description: `Your ${values.listing_type.toLowerCase()} has been successfully updated.`,
      });

      onListingUpdated(); // Refresh the listings on the parent page
      setOpen(false); // Close the dialog
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Updating Listing',
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit className="mr-2 h-4 w-4" />
          Edit Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update the details for your listing below. Note: Image and location changes are not yet supported.
          </DialogDescription>
        </DialogHeader>
        
        {listing.images && listing.images.length > 0 && (
            <div className="space-y-2">
                <FormLabel>Current Images</FormLabel>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {listing.images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square">
                        <AuthenticatedImage
                            src={image.image_url}
                            alt={`${listing.title} image ${index + 1}`}
                            className="object-cover rounded-md"
                        />
                         {image.is_primary && (
                            <Badge className="absolute bottom-1 right-1 text-xs" variant="secondary">Primary</Badge>
                        )}
                    </div>
                ))}
                </div>
            </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electric Power Drill" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your item or service..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="listing_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a listing type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tool">Tool</SelectItem>
                      <SelectItem value="Skill">Skill</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="hourly_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Price (BDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="daily_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Price (BDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="security_deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Deposit (BDT)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available Now</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

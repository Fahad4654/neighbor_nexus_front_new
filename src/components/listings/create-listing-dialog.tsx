'use client';

import { useState } from 'react';
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
  FormDescription,
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
import { PlusCircle, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const LocationPicker = dynamic(() => import('@/components/shared/location-picker'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const MAX_IMAGES = 5;

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  listing_type: z.enum(['Tool', 'Skill']),
  hourly_price: z.coerce.number().min(0, 'Hourly price must be a positive number'),
  daily_price: z.coerce.number().min(0, 'Daily price must be a positive number'),
  security_deposit: z.coerce.number().min(0, 'Security deposit must be a positive number'),
  is_available: z.boolean().default(true),
  useUserLocation: z.boolean().default(true),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable(),
  images: z.array(z.instanceof(File)).max(MAX_IMAGES, `You can only upload up to ${MAX_IMAGES} images.`),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface CreateListingDialogProps {
  onListingCreated: () => void;
}

export function CreateListingDialog({ onListingCreated }: CreateListingDialogProps) {
  const [open, setOpen] = useState(false);
  const { user, api } = useAuth();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      listing_type: 'Tool',
      hourly_price: 0,
      daily_price: 0,
      security_deposit: 0,
      is_available: true,
      useUserLocation: true,
      location: null,
      images: [],
    },
  });

  const watchUseUserLocation = form.watch('useUserLocation');
  const watchImages = form.watch('images');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images');
    const newImages = [...currentImages, ...files].slice(0, MAX_IMAGES);

    form.setValue('images', newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images');
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue('images', newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (values: ListingFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a listing.' });
      return;
    }
    if (!values.useUserLocation && !values.location) {
      toast({ variant: 'destructive', title: 'Location Required', description: 'Please select a location for your listing.' });
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      toast({ variant: 'destructive', title: 'Configuration Error', description: 'Backend URL is not configured.' });
      return;
    }

    const formData = new FormData();
    formData.append('owner_id', user.id);
    formData.append('listing_type', values.listing_type);
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('hourly_price', values.hourly_price.toString());
    formData.append('daily_price', values.daily_price.toString());
    formData.append('security_deposit', values.security_deposit.toString());
    formData.append('is_available', String(values.is_available));
    formData.append('useUserLocation', String(values.useUserLocation));

    if (!values.useUserLocation && values.location) {
      formData.append('location[lat]', values.location.lat.toString());
      formData.append('location[lng]', values.location.lng.toString());
    }

    values.images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await api.postFormData(`${backendUrl}/tools`, formData);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to create listing.');
      }

      toast({
        title: 'Listing Created',
        description: `Your ${values.listing_type.toLowerCase()} has been successfully listed.`,
      });

      form.reset();
      setImagePreviews([]);
      onListingCreated();
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Listing',
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset();
        setImagePreviews([]);
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Listing</DialogTitle>
          <DialogDescription>
            Add a new tool or skill to share with your nexus.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images (up to {MAX_IMAGES})</FormLabel>
                  <FormDescription>The first image will be the primary one.</FormDescription>
                  <FormControl>
                    <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  </FormControl>
                  <label htmlFor="image-upload" className="cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span>Click to upload or drag & drop</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="object-cover rounded-md" />
                        <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && <div className="absolute bottom-0 w-full text-center bg-black/50 text-white text-xs py-0.5 rounded-b-md">Primary</div>}
                      </div>
                    ))}
                  </div>
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
                    <FormDescription>Is this item or service available for rent immediately?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="useUserLocation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Use My Profile Location</FormLabel>
                    <FormDescription>Use the location saved in your user profile.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {!watchUseUserLocation && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Location</FormLabel>
                    <FormDescription>Select a specific location for this listing.</FormDescription>
                    <div className="h-[300px] rounded-md overflow-hidden border relative">
                      <LocationPicker onLocationChange={field.onChange} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Listing'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

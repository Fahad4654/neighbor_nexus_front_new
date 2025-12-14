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
import { Edit, Image as ImageIcon, X, Star, Upload } from 'lucide-react';
import type { Tool } from '@/app/(app)/listings/page';
import AuthenticatedImage from '../shared/authenticated-image';
import { Badge } from '../ui/badge';
import NextImage from 'next/image';

const MAX_IMAGES = 5;

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
  
  // State for image management
  const [existingImages, setExistingImages] = useState(listing.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newPrimaryId, setNewPrimaryId] = useState<string | null>(listing.images.find(img => img.is_primary)?.id || null);
  const [setFirstNewAsPrimary, setSetFirstNewAsPrimary] = useState(false);


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
  
  const resetImageState = () => {
    setExistingImages(listing.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setRemovedImageIds([]);
    setNewPrimaryId(listing.images.find(img => img.is_primary)?.id || null);
    setSetFirstNewAsPrimary(false);
  };

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
      resetImageState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listing, form]);

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setRemovedImageIds(prev => [...prev, id]);
    if (newPrimaryId === id) {
        setNewPrimaryId(null);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSetPrimary = (id: string) => {
    setNewPrimaryId(id);
    setSetFirstNewAsPrimary(false);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = existingImages.length + newImageFiles.length;
    const remainingSlots = MAX_IMAGES - totalImages;

    if (files.length > remainingSlots) {
        toast({
            variant: 'destructive',
            title: 'Too many images',
            description: `You can only add ${remainingSlots} more image(s).`,
        });
    }

    const newFiles = files.slice(0, remainingSlots);
    setNewImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  const onSubmit = async (values: ListingFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        return;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        toast({ variant: 'destructive', title: 'Configuration Error' });
        return;
    }

    const hasPrimaryImage = newPrimaryId || setFirstNewAsPrimary || existingImages.some(img => img.is_primary && !removedImageIds.includes(img.id));
    if (!hasPrimaryImage && (existingImages.length + newImageFiles.length > 0)) {
         toast({ variant: 'destructive', title: 'Primary Image Required', description: 'Please select a primary image for your listing.' });
         return;
    }
    
    // --- Promise 1: Update Text Data ---
    const updateDetailsPromise = api.put(`${backendUrl}/tools`, {
        ...values,
        tool_id: listing.listing_id,
        updatedBy: user.id
    });
    
    // --- Promise 2: Update Image Data ---
    let updateImagesPromise = Promise.resolve(); // Default to a resolved promise
    const imageChangesMade = newImageFiles.length > 0 || removedImageIds.length > 0 || newPrimaryId !== listing.images.find(img => img.is_primary)?.id;
    
    if (imageChangesMade) {
        const imageFormData = new FormData();
        imageFormData.append('listing_id', listing.listing_id);
        
        removedImageIds.forEach(id => imageFormData.append('remove_image_ids', id));
        newImageFiles.forEach(file => imageFormData.append('images', file));
        
        if (newPrimaryId && newPrimaryId !== listing.images.find(img => img.is_primary)?.id) {
            imageFormData.append('new_primary_id', newPrimaryId);
        } else if (setFirstNewAsPrimary) {
            imageFormData.append('set_first_new_file_as_primary', 'true');
        }

        updateImagesPromise = api.putFormData(`${backendUrl}/tools/update-images`, imageFormData);
    }
    
    try {
        const [detailsResponse, imagesResponse] = await Promise.all([updateDetailsPromise, updateImagesPromise]);

        if (!detailsResponse.ok) {
             const result = await detailsResponse.json();
             throw new Error(result.message || result.error || 'Failed to update listing details.');
        }
        if (imageChangesMade && imagesResponse && !imagesResponse.ok) {
            const result = await imagesResponse.json();
            throw new Error(result.message || result.error || 'Failed to update listing images.');
        }

        toast({ title: 'Listing Updated Successfully' });
        onListingUpdated();
        setOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
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
            Update the details for your listing below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <div className="space-y-2">
                <FormLabel>Manage Images</FormLabel>
                 <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {existingImages.map((image) => (
                        <div key={image.id} className="relative group">
                            <AuthenticatedImage src={image.image_url} alt={listing.title} className="object-cover rounded-md aspect-square" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                {newPrimaryId !== image.id && <Button type="button" size="sm" className="h-6 text-xs px-1" onClick={() => handleSetPrimary(image.id)}><Star className="mr-1 h-3 w-3" /> Primary</Button>}
                                <Button type="button" size="sm" variant="destructive" className="h-6 text-xs px-1" onClick={() => handleRemoveExistingImage(image.id)}><X className="mr-1 h-3 w-3" /> Remove</Button>
                            </div>
                            {newPrimaryId === image.id && <Badge className="absolute bottom-1 right-1 text-xs" variant="secondary"><Star className="h-3 w-3 mr-1" />Primary</Badge>}
                        </div>
                    ))}
                    {newImagePreviews.map((src, index) => (
                         <div key={src} className="relative group">
                            <NextImage src={src} alt={`New image ${index + 1}`} width={100} height={100} className="object-cover rounded-md aspect-square" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button type="button" size="sm" variant="destructive" className="h-6 text-xs px-1" onClick={() => handleRemoveNewImage(index)}><X className="mr-1 h-3 w-3" /> Remove</Button>
                            </div>
                         </div>
                    ))}
                 </div>
                 {existingImages.length + newImageFiles.length < MAX_IMAGES && (
                     <label htmlFor="image-upload-edit" className="mt-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50">
                        <Upload className="h-8 w-8 mb-2" />
                        <span>Add more images</span>
                    </label>
                 )}
                <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload-edit" />
            </div>

            {!newPrimaryId && newImageFiles.length > 0 && (
                 <FormField
                    control={form.control}
                    name="is_available" // Re-using a boolean field for the switch, field name doesn't matter here
                    render={() => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Set First New Image as Primary</FormLabel>
                        </div>
                        <FormControl>
                            <Switch checked={setFirstNewAsPrimary} onCheckedChange={setSetFirstNewAsPrimary} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
            )}
            
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

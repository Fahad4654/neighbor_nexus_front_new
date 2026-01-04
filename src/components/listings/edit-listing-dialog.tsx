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
import { Edit, X, Star, Upload } from 'lucide-react';
import type { Tool } from '@/app/(app)/listings/page';
import AuthenticatedImage from '../shared/authenticated-image';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const MAX_IMAGES = 5;

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  listing_type: z.enum(['Tool', 'Skill']),
  hourly_price: z.coerce.number().min(0),
  daily_price: z.coerce.number().min(0),
  security_deposit: z.coerce.number().min(0),
  is_available: z.boolean(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

type ToolImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

interface EditListingDialogProps {
  listing: Tool;
  onListingUpdated: () => void;
}

export function EditListingDialog({
  listing,
  onListingUpdated,
}: EditListingDialogProps) {
  const [open, setOpen] = useState(false);
  const { user, api } = useAuth();
  const { toast } = useToast();

  const [existingImages, setExistingImages] = useState<ToolImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      listing_type: listing.listing_type,
      hourly_price: Number(listing.hourly_price),
      daily_price: Number(listing.daily_price),
      security_deposit: Number(listing.security_deposit),
      is_available: listing.is_available,
    },
  });

  const resetAllState = () => {
    setExistingImages(listing.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setRemovedImageIds([]);
  };

  useEffect(() => {
    if (open) resetAllState();
  }, [open, listing]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining =
      MAX_IMAGES - (existingImages.length + newImageFiles.length);

    if (files.length > remaining) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: `You can only add ${remaining} more image(s).`,
      });
    }

    const validFiles = files.slice(0, remaining);
    setNewImageFiles(prev => [...prev, ...validFiles]);
    setNewImagePreviews(prev => [
      ...prev,
      ...validFiles.map(f => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveExistingImage = (id: string) => {
    const removed = existingImages.find(i => i.id === id);
    setExistingImages(prev => prev.filter(i => i.id !== id));
    setRemovedImageIds(prev => [...prev, id]);

    if (removed?.is_primary) {
      const next = existingImages.find(i => i.id !== id);
      if (next) handleSetPrimary(next.id);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (id: string) => {
    setExistingImages(prev =>
      prev.map(img => ({ ...img, is_primary: img.id === id }))
    );
  };

  const onSubmit = async (values: ListingFormValues) => {
    if (!user) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    try {
      await api.put(`${backendUrl}/tools/update-info`, {
        listing_id: listing.listing_id,
        ...values,
      });

      if (newImageFiles.length || removedImageIds.length) {
        const fd = new FormData();
        fd.append('listing_id', listing.listing_id);
        fd.append('remove_image_ids', JSON.stringify(removedImageIds));
        newImageFiles.forEach(f => fd.append('images', f));

        await api.putFormData(`${backendUrl}/tools/update-images`, fd);
      }

      toast({ title: 'Listing Updated Successfully' });
      onListingUpdated();
      setOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit className="mr-2 h-4 w-4" />
          Edit Tool
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tool</DialogTitle>
          <DialogDescription>
            Update the details for your tool below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">

            {/* IMAGES */}
            <div className="space-y-2">
              <FormLabel>Manage Images</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">

                {existingImages.map(img => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-md group"
                  >
                    <AuthenticatedImage
                      src={img.image_url}
                      alt={listing.title}
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1">
                      {!img.is_primary && (
                        <Button
                          type="button"
                          size="sm"
                          className="h-6 text-xs px-1"
                          onClick={() => handleSetPrimary(img.id)}
                        >
                          <Star className="h-3 w-3 mr-1" /> Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-6 text-xs px-1"
                        onClick={() => handleRemoveExistingImage(img.id)}
                      >
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>

                    {img.is_primary && (
                      <Badge className="absolute bottom-1 right-1 text-xs">
                        <Star className="h-3 w-3 mr-1" /> Primary
                      </Badge>
                    )}
                  </div>
                ))}

                {newImagePreviews.map((src, index) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-md group"
                  >
                    <Image src={src} alt="preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-6 text-xs px-1"
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {existingImages.length + newImageFiles.length < MAX_IMAGES && (
                <label
                  htmlFor="image-upload-edit"
                  className="mt-2 cursor-pointer border-2 border-dashed rounded-md p-4 flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  Add more images
                </label>
              )}
              <Input
                id="image-upload-edit"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* ALL ORIGINAL FORM FIELDS */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="listing_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tool">Tool</SelectItem>
                    <SelectItem value="Skill">Skill</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="hourly_price" render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Price</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="daily_price" render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Price</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="security_deposit" render={({ field }) => (
              <FormItem>
                <FormLabel>Security Deposit</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="is_available" render={({ field }) => (
              <FormItem className="flex items-center justify-between border p-3 rounded-lg">
                <FormLabel>Available Now</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

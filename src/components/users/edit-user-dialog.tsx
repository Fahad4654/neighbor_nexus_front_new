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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDescription } from '../ui/card';
import { Switch } from '../ui/switch';
import type { User } from '@/app/(app)/users/page';

const LocationPicker = dynamic(
  () => import('@/components/shared/location-picker'),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

const editUserSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  isAdmin: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: User;
  onUserUpdated: () => void;
}

export function EditUserDialog({ user, onUserUpdated }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { api, user: adminUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstname: user.firstname,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      location: user.geo_location?.coordinates ? { lat: user.geo_location.coordinates[1], lng: user.geo_location.coordinates[0] } : null,
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        firstname: user.firstname,
        lastname: user.lastname,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        location: user.geo_location?.coordinates ? { lat: user.geo_location.coordinates[1], lng: user.geo_location.coordinates[0] } : null,
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: EditUserFormValues) => {
    if (!values.location) {
        toast({
            variant: 'destructive',
            title: 'Location Required',
            description: 'Please select a location on the map.',
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
        const payload = {
            id: user.id,
            ...values,
            geo_location: values.location,
            updatedBy: adminUser?.id
        };
        
      const response = await api.put(`${backendUrl}/users`, payload);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to update user.');
      }

      toast({
        title: 'User Updated',
        description: `User @${user.username} has been successfully updated.`,
      });

      onUserUpdated();
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Updating User',
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: @{user.username}</DialogTitle>
          <DialogDescription>
            Update the details for this user below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Is Admin</FormLabel>
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
                 <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Is Verified</FormLabel>
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
            </div>
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <CardDescription>Search for or click on the map to set the user's location.</CardDescription>
                        <div className="h-[300px] rounded-md overflow-hidden border relative">
                           <LocationPicker onLocationChange={field.onChange} initialPosition={field.value} />
                        </div>
                        <FormMessage />
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


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import type { Tool } from '@/app/(app)/listings/page';

interface DeleteListingDialogProps {
  listing: Tool;
  onListingDeleted: () => void;
  children?: React.ReactNode;
}

export function DeleteListingDialog({ listing, onListingDeleted, children }: DeleteListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { api } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Backend URL is not configured.',
      });
      setIsDeleting(false);
      return;
    }

    try {
      const response = await api.delete(`${backendUrl}/tools`, { listing_id: listing.listing_id });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to delete listing.');
      }

      toast({
        title: 'Listing Deleted',
        description: `"${listing.title}" has been successfully deleted.`,
      });

      onListingDeleted();
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Deleting Listing',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Listing
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the listing for <strong>"{listing.title}"</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Yes, delete listing'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    
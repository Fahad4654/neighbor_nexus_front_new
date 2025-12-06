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
import type { User } from '@/app/(app)/users/page';

interface DeleteUserDialogProps {
  user: User;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({ user, onUserDeleted }: DeleteUserDialogProps) {
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
      // The custom api.delete method in this app sends the body correctly
      const response = await api.delete(`${backendUrl}/users`, { id: user.id });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to delete user.');
      }

      toast({
        title: 'User Deleted',
        description: `User ${user.username} has been successfully deleted.`,
      });

      onUserDeleted();
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Deleting User',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user account for <strong>{user.username}</strong> and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? 'Deleting...' : 'Yes, delete user'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

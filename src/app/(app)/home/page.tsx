'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { transactions, listings, users } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AuthenticatedImage from '@/components/shared/authenticated-image';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const rentalRequests = useMemo(() => {
    if (!user) return [];
    
    // Find transactions that are pending
    const pendingTransactions = transactions.filter(t => t.status === 'pending');

    // Filter those transactions to find ones where the current user is the item owner
    return pendingTransactions.map(tx => {
      const listing = listings.find(l => l.id === tx.listingId);
      const requester = users.find(u => u.id === tx.renterId);

      if (listing && requester && listing.ownerId === user.id) {
        return {
          transaction: tx,
          listing: listing,
          requester: requester
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries

  }, [user]);

  const getInitials = (firstname?: string, lastname?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`;
    }
    if (firstname) {
      return firstname.charAt(0);
    }
    return 'U';
  };

  if (isLoading || user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Welcome to your Nexus, {user?.firstname}</h1>
            <p className="text-muted-foreground">Here's a quick look at what's happening. You can rent tools from others or list your own.</p>
        </div>

        {rentalRequests.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>New Rental Requests</CardTitle>
                    <CardDescription>Respond to these requests to rent out your items.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {rentalRequests.map((request) => request && (
                     <div key={request.transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AuthenticatedImage src={request.requester.avatarUrl} alt={request.requester.name} />
                                <AvatarFallback>{getInitials(request.requester.firstname, request.requester.lastname)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">
                                    <span className="font-bold">{request.requester.name}</span> wants to rent your <span className="font-bold">{request.listing.title}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total: BDT {request.transaction.total.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline">Deny</Button>
                            <Button size="sm">Approve</Button>
                        </div>
                    </div>
                   ))}
                </CardContent>
            </Card>
        )}
        
        {rentalRequests.length === 0 && (
             <div className="text-center py-12">
                <p className="text-muted-foreground">You have no new rental requests at this time.</p>
            </div>
        )}
    </div>
  );
}

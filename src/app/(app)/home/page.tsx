'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users, listings, transactions } from "@/lib/data";
import { Users, Wrench, Check, X } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from '@/hooks/use-auth';

const nexusUsers = users.filter(u => u.nexus === 'Oakwood');

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  const userListings = listings.filter(l => l.ownerId === user?.id);
  const userListingIds = userListings.map(l => l.id);
  const rentalRequests = transactions.filter(t => userListingIds.includes(t.listingId) && t.status === 'pending');

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Your Nexus: Oakwood</CardTitle>
                <CardDescription>This is your local community zone.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{nexusUsers.length}</div>
                        <p className="text-xs text-muted-foreground">+2 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Available</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground">+5 new listings</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
        
        {rentalRequests.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>New Rental Requests</CardTitle>
                    <CardDescription>Respond to these requests to rent your items.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rentalRequests.map(req => {
                        const renter = users.find(u => u.id === req.renterId);
                        const listing = listings.find(l => l.id === req.listingId);
                        return (
                            <div key={req.id} className="flex items-center gap-4 p-2 rounded-lg border">
                                <Avatar>
                                    <AuthenticatedImage src={renter?.avatarUrl} alt={renter?.name} className="aspect-square h-full w-full" />
                                    <AvatarFallback>{renter?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{renter?.name}</p>
                                    <p className="text-sm text-muted-foreground">Wants to rent <span className='font-medium'>{listing?.title}</span></p>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <Button variant="outline" size="icon" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                     <Button variant="outline" size="icon" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Members in Oakwood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nexusUsers.map(user => (
              <div key={user.id} className="flex items-center gap-4">
                <Avatar>
                  <AuthenticatedImage src={user.avatarUrl} alt={user.name} className="aspect-square h-full w-full" />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">Joined on {new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">View Profile</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Define Your Nexus</CardTitle>
            <CardDescription>Enter your address or zip code to find or create your local nexus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Enter Zip Code (e.g., 90210)" />
            <Button className="w-full">Join or Create Nexus</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

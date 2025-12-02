'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/star-rating";
import { Verified } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = {
    user: {
        id: string;
        username: string;
        firstname: string;
        lastname: string;
        email: string;
        phoneNumber: string;
        isAdmin: boolean;
        isVerified: boolean;
        rating_avg: string;
        createdAt: string;
    };
    profile: {
        id: string;
        bio: string;
        avatarUrl: string;
        address: string;
    };
};

export default function ProfilePage() {
  const { user: authUser, api } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) return;
      
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
          toast({ variant: "destructive", title: "Configuration Error" });
          setIsLoading(false);
          return;
      }

      try {
        const response = await api.get(`${backendUrl}/users/${authUser.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch profile data');
        }
        setProfileData(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: error.message || "An unexpected error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser, api, toast]);

  if (isLoading || !profileData) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-8 w-40 mb-2" />
                  <Skeleton className="h-5 w-24 mb-3" />
                  <Skeleton className="h-6 w-20 mb-4" />
                  <Skeleton className="h-4 w-48" />
              </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Your Nexus</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
                <Separator />
                 <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Label>New Password</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
                <Button disabled>Update Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, profile } = profileData;
  const rating = parseFloat(user.rating_avg);
  const fullName = `${user.firstname} ${user.lastname}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AuthenticatedImage src={profile.avatarUrl} alt={fullName} />
                    <AvatarFallback>{user.firstname.charAt(0)}{user.lastname.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-headline">{fullName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={rating} />
                    <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
                </div>
                <div className="mt-2">
                    {user.isVerified && (
                        <Badge>
                            <Verified className="mr-2 h-4 w-4"/>
                            Verified
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground mt-4">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={fullName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="nexus">Your Address</Label>
                <Input id="nexus" defaultValue={profile.address} />
            </div>
            <Separator />
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

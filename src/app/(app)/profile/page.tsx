'use client';

import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/star-rating";
import { Verified, MapPin } from "lucide-react";
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
        geo_location: {
            type: string;
            coordinates: [number, number];
        }
    };
    profile: {
        id: string;
        bio: string;
        avatarUrl: string;
        address: string;
    };
};

// Helper function to add ordinal suffix to day
const getDayWithOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
        case 1:  return `${day}st`;
        case 2:  return `${day}nd`;
        case 3:  return `${day}rd`;
        default: return `${day}th`;
    }
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
            throw new Error(data.message || data.error || 'Failed to fetch profile data');
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

    if (authUser) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, api]);

  if (isLoading || !profileData) {
    return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-8 w-40 mb-2" />
                  <Skeleton className="h-5 w-24 mb-3" />
                  <Skeleton className="h-6 w-20 mb-4" />
                  <Skeleton className="h-4 w-full px-4 mb-2" />
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
                        <Label htmlFor="firstname">First Name</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastname">Last Name</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Your Address</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Label>Geo Location</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, profile } = profileData;
  const rating = parseFloat(user.rating_avg);
  const fullName = `${user.firstname} ${user.lastname}`;
  const coordinates = user.geo_location?.coordinates ? `[${user.geo_location.coordinates.join(', ')}]` : 'Not available';

  const formattedDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const day = getDayWithOrdinal(date.getDate());
      return format(date, `'${day}' MMMM, yyyy`);
    } catch(e) {
      return "Invalid date"
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
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
                 <div className="text-center w-full mt-4">
                    <p className="font-semibold text-sm">Bio</p>
                    <p className="text-muted-foreground text-sm italic">"{profile.bio}"</p>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">Member since {formattedDate(user.createdAt)}</p>
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
                    <Label htmlFor="firstname">First Name</Label>
                    <Input id="firstname" defaultValue={user.firstname} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input id="lastname" defaultValue={user.lastname} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={user.phoneNumber} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Your Address</Label>
                <Input id="address" defaultValue={profile.address} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="geolocation">Geo Location (Coordinates)</Label>
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input id="geolocation" defaultValue={coordinates} readOnly />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

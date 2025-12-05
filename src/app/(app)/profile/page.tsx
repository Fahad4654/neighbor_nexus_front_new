'use client';

import { useState, useEffect, useRef } from "react";
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/star-rating";
import { Verified, MapPin, Edit, X, Save, Upload } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type User = {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    isAdmin: boolean;
    isVerified: boolean;
    rating_avg: string;
    geo_location: any;
    createdAt: string;
    updatedAt: string;
    profile: {
        id: string;
        bio: string;
        avatarUrl: string;
    };
};

type UserProfileResponse = {
    user: Omit<User, 'profile' | 'geo_location' | 'updatedAt'> & { geo_location: { type: string; coordinates: [number, number]; }};
    profile: {
        id: string;
        bio: string;
        avatarUrl: string;
        address: string;
    };
};

type EditableProfile = {
    firstname: string;
    lastname: string;
    phoneNumber: string;
    address: string;
    bio: string;
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
  const { user: authUser, api, updateUser } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [editableData, setEditableData] = useState<EditableProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async (updateGlobalState = false) => {
    if (!authUser) return;
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        toast({ variant: "destructive", title: "Configuration Error" });
        setIsLoading(false);
        return;
    }

    try {
      const response = await api.get(`${backendUrl}/users/${authUser.id}`);
      const data: UserProfileResponse = await response.json();

      if (!response.ok) {
          throw new Error((data as any).message || (data as any).error || 'Failed to fetch profile data');
      }
      setProfileData(data);
      setEditableData({
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        phoneNumber: data.user.phoneNumber,
        address: data.profile.address,
        bio: data.profile.bio,
      });

      if (updateGlobalState) {
        // Construct the full User object that matches the type in useAuth
        const fullUserObject: User = {
            ...(authUser as User), // Start with the existing auth user to preserve fields
            ...data.user, // Overwrite with fresh user data
            profile: data.profile, // Add the fresh profile data
        };
        updateUser(fullUserObject);
      }

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

  useEffect(() => {
    if (authUser) {
      setIsLoading(true);
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditableData(prev => prev ? { ...prev, [id]: value } : null);
  };
  
  const handleCancel = () => {
    if (profileData) {
        setEditableData({
            firstname: profileData.user.firstname,
            lastname: profileData.user.lastname,
            phoneNumber: profileData.user.phoneNumber,
            address: profileData.profile.address,
            bio: profileData.profile.bio,
        });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!authUser || !editableData) return;
    
    setIsSaving(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
     if (!backendUrl) {
        toast({ variant: "destructive", title: "Configuration Error" });
        setIsSaving(false);
        return;
    }
    
    try {
        const { firstname, lastname, phoneNumber, bio, address } = editableData;

        // API call to update user details
        const userPromise = api.put(`${backendUrl}/users/${authUser.id}`, {
            id: authUser.id,
            firstname,
            lastname,
            phoneNumber,
            updatedBy: authUser.id
        });

        // API call to update profile details
        const profilePromise = api.put(`${backendUrl}/profile`, {
            userId: authUser.id,
            bio,
            address,
        });

        const [userResponse, profileResponse] = await Promise.all([userPromise, profilePromise]);

        if(!userResponse.ok || !profileResponse.ok) {
             const userResult = !userResponse.ok ? await userResponse.json() : null;
             const profileResult = !profileResponse.ok ? await profileResponse.json() : null;
             throw new Error(userResult?.message || profileResult?.message || "Failed to update profile.");
        }
        
        // Refetch profile data to show updated info, and update global state
        await fetchProfile(true);
        
        toast({
            title: "Profile Updated",
            description: "Your information has been saved successfully.",
        });
        setIsEditing(false);
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        toast({ variant: "destructive", title: "Configuration Error" });
        return;
    }

    const formData = new FormData();
    formData.append('userId', authUser.id);
    formData.append('profile_pic', file);

    try {
        const response = await api.postFormData(`${backendUrl}/profile/upload-avatar`, formData);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || result.error || 'Failed to upload avatar.');
        }

        toast({
            title: "Avatar Updated",
            description: "Your profile picture has been changed.",
        });

        // Refetch profile to display the new avatar and update global state
        await fetchProfile(true);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error.message,
        });
    }
  };


  if (isLoading || !profileData || !editableData) {
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
                <div className="relative">
                    <Avatar className="h-24 w-24 mb-4" onClick={handleAvatarClick}>
                        <AuthenticatedImage src={profile.avatarUrl} alt={fullName} />
                        <AvatarFallback>{user.firstname.charAt(0)}{user.lastname.charAt(0)}</AvatarFallback>
                    </Avatar>
                     {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                            <Upload className="text-white h-8 w-8" />
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
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
                    {isEditing ? (
                        <Textarea id="bio" value={editableData.bio} onChange={handleInputChange} className="mt-1 text-sm min-h-[80px]" />
                    ) : (
                        <p className="text-muted-foreground text-sm italic">"{profile.bio}"</p>
                    )}
                </div>
                <p className="text-muted-foreground mt-4 text-sm">Member since {formattedDate(user.createdAt)}</p>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
                {isEditing ? 'You can now edit your profile details below.' : 'View your personal details here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input id="firstname" value={editableData.firstname} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input id="lastname" value={editableData.lastname} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" type="tel" value={editableData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Your Address</Label>
                <Input id="address" value={editableData.address} onChange={handleInputChange} disabled={!isEditing} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="geolocation">Geo Location (Coordinates)</Label>
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input id="geolocation" defaultValue={coordinates} disabled />
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
             <div className="flex justify-end gap-2 w-full">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="mr-2" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2" /> Edit Profile
                    </Button>
                )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    
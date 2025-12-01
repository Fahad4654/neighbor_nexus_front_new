import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/shared/star-rating";
import { users } from "@/lib/data";
import { Verified } from "lucide-react";

export default function ProfilePage() {
  const user = users[0]; // Using Alice as the sample user

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-headline">{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={user.rating} />
                    <span className="text-sm text-muted-foreground">({user.rating.toFixed(1)})</span>
                </div>
                <div className="mt-2">
                    {user.isVerified && (
                        <Badge>
                            <Verified className="mr-2 h-4 w-4"/>
                            Verified
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground mt-4">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
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
                    <Input id="fullName" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="nexus">Your Nexus</Label>
                <Input id="nexus" defaultValue={user.nexus} />
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

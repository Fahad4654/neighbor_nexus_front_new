
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users } from "@/lib/data";
import { Users, Wrench } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";

const nexusUsers = users.filter(u => u.nexus === 'Oakwood');

export default function HomePage() {
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

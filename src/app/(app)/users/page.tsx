import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import AuthenticatedImage from "@/components/shared/authenticated-image";

export default function UsersPage() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage the users in your nexus.</CardDescription>
      </CardHeader>
      {/* Modification 1: Remove flex-1 and overflow-hidden from CardContent to allow scroll containers to manage it */}
      <CardContent className="p-0">
        {/* Modification 2: Outer div for vertical scrolling (if needed) and to fill space */}
        <div className="h-full overflow-y-auto">
          {/* Modification 3: Add a wrapper for horizontal scrolling! */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Verified</TableHead>
                  <TableHead className="hidden sm:table-cell">Admin</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AuthenticatedImage src={user.avatarUrl} alt={user.name} className="aspect-square h-full w-full" />
                          <AvatarFallback>{user.firstname.charAt(0)}{user.lastname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.firstname} {user.lastname}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.phoneNumber}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                        {user.isVerified ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                            {user.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.rating_avg.toFixed(1)}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.geo_location}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

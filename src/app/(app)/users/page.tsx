'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Users as UsersIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CreateUserDialog } from '@/components/users/create-user-dialog';

type UserProfile = {
  id: string;
  bio: string;
  avatarUrl: string;
  address: string;
};

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
  geo_location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  profile: UserProfile | null;
};

type PaginationState = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function UsersPage() {
  const { api, user: authUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(`${backendUrl}/users/all`, {
        order: 'createdAt',
        asc: 'DESC',
        page: page,
        pageSize: 10,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch users.');
      }
      
      setUsers(result.usersList?.data || []);
      setPagination(result.usersList?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);
  
  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.charAt(0) ?? ''}${lastname?.charAt(0) ?? ''}`.toUpperCase();
  };

  const formatCoordinates = (geo?: { coordinates: [number, number] }) => {
    if (!geo || !geo.coordinates) return 'N/A';
    return `[${geo.coordinates[0]}, ${geo.coordinates[1]}]`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage the users in your nexus.</CardDescription>
        </div>
        {authUser?.isAdmin && <CreateUserDialog onUserCreated={() => fetchUsers(pagination.page)} />}
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
            <Alert variant="destructive" className="m-4">
              <UsersIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : users.length === 0 ? (
             <Alert className="m-4">
                <UsersIcon className="h-4 w-4" />
                <AlertTitle>No Users Found</AlertTitle>
                <AlertDescription>There are no users to display at this time.</AlertDescription>
            </Alert>
        ) : (
          <div className="h-full overflow-y-auto">
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
                            <AuthenticatedImage src={user.profile?.avatarUrl} alt={`${user.firstname} ${user.lastname}`} />
                            <AvatarFallback>{getInitials(user.firstname, user.lastname)}</AvatarFallback>
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
                      <TableCell className="hidden md:table-cell">{parseFloat(user.rating_avg).toFixed(1)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatCoordinates(user.geo_location)}</TableCell>
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
        )}
      </CardContent>
       <CardFooter className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

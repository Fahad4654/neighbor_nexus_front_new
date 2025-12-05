'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Users as UsersIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/shared/data-table';
import { Skeleton } from '@/components/ui/skeleton';

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

const formatCoordinates = (geo?: { coordinates: [number, number] }) => {
    if (!geo || !geo.coordinates) return 'N/A';
    // Assuming coordinates are [longitude, latitude]
    const longitude = geo.coordinates[0];
    const latitude = geo.coordinates[1];
    return (
      <div className='text-xs'>
        <div>Lat: {latitude.toFixed(4)}</div>
        <div>Lon: {longitude.toFixed(4)}</div>
      </div>
    );
};

const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.charAt(0) ?? ''}${lastname?.charAt(0) ?? ''}`.toUpperCase();
};

const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
              <Avatar>
                <AuthenticatedImage src={row.original.profile?.avatarUrl} alt={`${row.original.firstname} ${row.original.lastname}`} />
                <AvatarFallback>{getInitials(row.original.firstname, row.original.lastname)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{row.original.username}</div>
            </div>
        )
    },
    {
        accessorKey: 'firstname',
        header: 'Full Name',
        cell: ({row}) => `${row.original.firstname} ${row.original.lastname}`
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phoneNumber',
        header: 'Phone',
    },
    {
        accessorKey: 'isVerified',
        header: 'Verified',
        cell: ({ row }) => (
             <Badge variant={row.original.isVerified ? 'default' : 'secondary'}>
                {row.original.isVerified ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {row.original.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
        )
    },
    {
        accessorKey: 'isAdmin',
        header: 'Admin',
        cell: ({ row }) => (
             <Badge variant={row.original.isAdmin ? 'default' : 'secondary'}>
                {row.original.isAdmin ? 'Admin' : 'User'}
            </Badge>
        )
    },
    {
        accessorKey: 'rating_avg',
        header: 'Rating',
        cell: ({row}) => parseFloat(row.original.rating_avg).toFixed(1)
    },
    {
        accessorKey: 'geo_location',
        header: 'Location',
        cell: ({row}) => formatCoordinates(row.original.geo_location),
        enableSorting: false,
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({row}) => new Date(row.original.createdAt).toLocaleDateString()
    },
     {
        id: 'actions',
        cell: ({ row }) => (
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
        ),
    },
];


export default function UsersPage() {
  const { api, user: authUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const [{ pageIndex, pageSize }, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  
  const [pageCount, setPageCount] = useState(0);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  
  const fetchUsers = useCallback(async (page: number, size: number, sort: SortingState) => {
    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const sortColumn = sort[0]?.id || 'createdAt';
      const sortDirection = sort[0]?.desc ? 'DESC' : 'ASC';

      const response = await api.post(`${backendUrl}/users/all`, {
        order: sortColumn,
        asc: sortDirection,
        page: page + 1, // API is 1-based, tanstack-table is 0-based
        pageSize: size,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch users.');
      }
      
      setUsers(result.usersList?.data || []);
      setPageCount(result.usersList?.pagination?.totalPages || 0);

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
    fetchUsers(pageIndex, pageSize, sorting);
  }, [fetchUsers, pageIndex, pageSize, sorting]);
  
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage the users in your nexus.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                 {authUser?.isAdmin && <CreateUserDialog onUserCreated={() => fetchUsers(pageIndex, pageSize, sorting)} />}
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-auto">
         <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            error={error}
            NoDataIcon={UsersIcon}
            noDataTitle="No Users Found"
            noDataDescription="There are no users to display at this time."
            pagination={{ ...pagination, pageCount }}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
         />
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Users as UsersIcon } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
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

const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.charAt(0) ?? ''}${lastname?.charAt(0) ?? ''}`.toUpperCase();
};

const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AuthenticatedImage src={row.original.profile?.avatarUrl} alt={`${row.original.firstname} ${row.original.lastname}`} />
                <AvatarFallback>{getInitials(row.original.firstname, row.original.lastname)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{row.original.username}</div>
            </div>
        )
    },
    {
        accessorKey: 'firstname',
        header: 'First Name',
    },
     {
        accessorKey: 'lastname',
        header: 'Last Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        enableSorting: false,
    },
    {
        accessorKey: 'geo_location',
        header: 'Location',
        cell: ({row}) => {
            if (!row.original.geo_location?.coordinates) return 'N/A';
            // Placeholder for city/state lookup
            return "New York, NY";
        },
        enableSorting: false,
    },
    {
        accessorKey: 'rating_avg',
        header: 'Rating',
        cell: ({row}) => `${parseFloat(row.original.rating_avg).toFixed(1)}/5`
    },
     {
        accessorKey: 'isAdmin',
        header: 'Admin',
        cell: ({ row }) => (
             <Badge variant={row.original.isAdmin ? 'default' : 'secondary'} className={row.original.isAdmin ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'}>
                {row.original.isAdmin ? 'Yes' : 'No'}
            </Badge>
        )
    },
    {
        accessorKey: 'isVerified',
        header: 'Verified',
        cell: ({ row }) => (
             <Badge variant={row.original.isVerified ? 'default' : 'destructive'} className={row.original.isVerified ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                {row.original.isVerified ? 'Yes' : 'No'}
            </Badge>
        )
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({row}) => new Date(row.original.createdAt).toLocaleDateString()
    },
     {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
             <Button variant="outline" size="sm">Edit</Button>
        ),
        enableSorting: false,
    },
];


export default function UsersPage() {
  const { api, user } = useAuth();
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
    <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Users</h1>
            {user && user.isAdmin && <CreateUserDialog onUserCreated={() => fetchUsers(pageIndex, pageSize, sorting)} />}
        </div>
        <div className="flex-1 w-full overflow-hidden">
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
        </div>
    </div>
  );
}

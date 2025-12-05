'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LucideIcon } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  error: string | null;
  NoDataIcon: LucideIcon;
  noDataTitle: string;
  noDataDescription: string;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
  };
  onPaginationChange: (updater: any) => void;
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
  NoDataIcon,
  noDataTitle,
  noDataDescription,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: pagination.pageCount,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className='flex flex-col h-full w-full'>
       <div className="flex-1 overflow-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                 <TableRow key={i}>
                    {columns.map((col, j) => (
                        <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                 </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                    <Alert variant="destructive" className="m-4">
                        <NoDataIcon className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={columns.length}>
                        <Alert className="m-4">
                            <NoDataIcon className="h-4 w-4" />
                            <AlertTitle>{noDataTitle}</AlertTitle>
                            <AlertDescription>{noDataDescription}</AlertDescription>
                        </Alert>
                    </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
       </div>
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

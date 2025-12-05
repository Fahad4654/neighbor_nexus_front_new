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
import { LucideIcon, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

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
          <TableHeader className="sticky top-0 z-10 bg-primary text-primary-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-0 hover:bg-primary">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap text-primary-foreground">
                      {header.isPlaceholder
                        ? null
                        : (
                            <div
                                className={cn(
                                    'flex items-center gap-2',
                                    header.column.getCanSort() && 'cursor-pointer select-none'
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                                >
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                    <ArrowUpDown className="h-3 w-3" />
                                )}
                            </div>
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
                  className="even:bg-muted/50"
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
      <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div>
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

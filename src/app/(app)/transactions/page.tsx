import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { transactions, listings, users } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Transactions</CardTitle>
        <CardDescription>A record of your rentals and services.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item / Service</TableHead>
              <TableHead>With</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const listing = listings.find(l => l.id === tx.listingId);
              const otherUser = users.find(u => u.id === (listing?.ownerId === 'u1' ? tx.renterId : tx.providerId)); // Mock logic for demo
              return (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-medium">{listing?.title}</div>
                    <div className="text-sm text-muted-foreground">{listing?.type}</div>
                  </TableCell>
                  <TableCell>{otherUser?.name}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{tx.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">BDT {tx.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {tx.status === 'completed' && <DropdownMenuItem>Leave a Review</DropdownMenuItem>}
                        <DropdownMenuItem>Message User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

'use client';

import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionChart } from "@/components/dashboard/transaction-chart";
import { PenetrationChart } from "@/components/dashboard/penetration-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, listings, transactions } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";

import { Activity, Users, DollarSign, Ratio } from "lucide-react";

export default function DashboardPage() {
    const recentTransactions = transactions.slice(0, 5);
    const { user } = useAuth();

  return (
    <div className="flex-1 space-y-4">
      {user && (
        <h1 className="text-2xl font-bold">Welcome back, {user.firstname}!</h1>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Activation Rate"
            value="72.5%"
            icon={Users}
            change="+5.2%"
            changeType="increase"
        />
        <StatCard 
            title="Transaction Volume"
            value="BDT 12,450"
            icon={DollarSign}
            change="+18.7%"
            changeType="increase"
        />
        <StatCard 
            title="Commission Earned"
            value="BDT 1,245"
            icon={Activity}
            change="+18.7%"
            changeType="increase"
        />
        <StatCard 
            title="CAC/CLV Ratio"
            value="1:3.2"
            icon={Ratio}
            change="-0.5"
            changeType="decrease"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <TransactionChart />
        </div>
        <div className="lg:col-span-3">
            <PenetrationChart />
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of the most recent exchanges in the nexus.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentTransactions.map((tx) => {
                        const renter = users.find(u => u.id === tx.renterId);
                        const listing = listings.find(l => l.id === tx.listingId);
                        return (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="font-medium">{renter?.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {renter?.email}
                                    </div>
                                </TableCell>
                                <TableCell>{listing?.title}</TableCell>
                                <TableCell>
                                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{tx.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">BDT {tx.total.toFixed(2)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

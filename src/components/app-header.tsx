'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, MessageSquare } from 'lucide-react';

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-sidebar text-sidebar-foreground px-4 sm:px-6 z-10 sticky top-0">
      <SidebarTrigger className="sm:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
      <div className="relative ml-auto flex-1 md:grow-0">
        {pathname === '/listings' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search listings..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] text-foreground"
            />
          </div>
        )}
      </div>
      <div className="flex-1" />
      <Button asChild variant="ghost" size="icon" className="rounded-full relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Link href="/chat">
          <MessageSquare className="h-8 w-8" />
          <span className="sr-only">Chat</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Bell className="h-8 w-8" />
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          3
        </span>
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </header>
  );
}

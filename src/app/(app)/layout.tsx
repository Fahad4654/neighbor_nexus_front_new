'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Home,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthenticatedImage from '@/components/shared/authenticated-image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

function Header() {
  const { user, logout } = useAuth();

  const getInitials = (firstname?: string, lastname?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`;
    }
    if (firstname) {
      return firstname.charAt(0);
    }
    return 'U';
  };

  return (
    <div className="flex w-full items-center justify-end px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <span>Welcome {user?.email}</span>
            <Avatar className="h-8 w-8">
              <AuthenticatedImage src={user?.profile?.avatarUrl} />
              <AvatarFallback>
                {getInitials(user?.firstname, user?.lastname)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (window.location.href = '/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col p-4 space-y-2 bg-sidebar text-sidebar-foreground h-full">
      <div className="px-2 pb-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          pathname.startsWith('/dashboard') &&
            'bg-sidebar-accent text-sidebar-accent-foreground'
        )}
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          pathname.startsWith('/dashboard') &&
            'bg-sidebar-accent text-sidebar-accent-foreground'
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/users"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          pathname.startsWith('/users') &&
            'bg-sidebar-accent text-sidebar-accent-foreground'
        )}
      >
        <Users className="h-4 w-4" />
        Users
      </Link>
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const toggleNav = () => {
    // For now, let's just toggle the desktop nav. Mobile is not fully implemented in the image.
    setNavOpen(!navOpen);
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AppLogo />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center bg-primary text-primary-foreground shadow-md z-10">
        <div className="flex items-center gap-2 px-4">
          <button onClick={toggleNav} className="rounded-md p-1.5 hover:bg-primary/80">
            {navOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div className="text-lg font-semibold">Neighbor Nexus</div>
        </div>
        <Header />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'shrink-0 h-full overflow-y-auto bg-sidebar transition-all duration-300 ease-in-out',
            navOpen ? 'w-64' : 'w-0'
          )}
        >
          <Navbar />
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6 md:p-8">
          <div className="flex-1 rounded-lg bg-card p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

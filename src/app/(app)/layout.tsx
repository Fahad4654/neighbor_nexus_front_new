'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Home,
  LayoutDashboard,
  Users,
  MessageSquare,
  History,
  FolderKanban,
  Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function Header({ onToggleNav, navOpen }: { onToggleNav: () => void; navOpen: boolean; }) {
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
    <div className="flex w-full h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <button onClick={onToggleNav} className="rounded-md p-1.5 hover:bg-sidebar-accent">
                {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <div className="hidden md:block">
                <AppLogo />
            </div>
        </div>

        <div className="md:hidden">
            <AppLogo />
        </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-foreground">
            <span className='hidden sm:inline'>Welcome {user?.firstname}</span>
            <Avatar className="h-8 w-8">
              <AuthenticatedImage src={user?.profile?.avatarUrl} alt={user?.username} />
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
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Navbar({ navOpen }: { navOpen: boolean }) {
  const pathname = usePathname();
  const navLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/nexus', icon: Home, label: 'Nexus' },
    { href: '/listings', icon: FolderKanban, label: 'Listings' },
    { href: '/transactions', icon: History, label: 'Transactions' },
    { href: '/chat', icon: MessageSquare, label: 'Messages' },
    { href: '/users', icon: Users, label: 'Users' },
  ];

  return (
    <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col p-2 space-y-2 bg-sidebar text-sidebar-foreground h-full">
        {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
            <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                <Link
                    href={link.href}
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                >
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span className={cn('overflow-hidden transition-all duration-200', navOpen ? 'w-full' : 'w-0')}>{link.label}</span>
                </Link>
                </TooltipTrigger>
                {!navOpen && (
                    <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
                        <p>{link.label}</p>
                    </TooltipContent>
                )}
            </Tooltip>
            );
        })}
        <div className="flex-grow"></div>
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    href="/profile"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        pathname.startsWith('/profile') && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                    >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span className={cn('overflow-hidden transition-all duration-200', navOpen ? 'w-full' : 'w-0')}>Settings</span>
                </Link>
            </TooltipTrigger>
            {!navOpen && (
                <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
                    <p>Settings</p>
                </TooltipContent>
            )}
        </Tooltip>
        </nav>
    </TooltipProvider>
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
      <header className="flex h-16 shrink-0 items-center bg-sidebar text-sidebar-foreground shadow-md z-10">
        <Header onToggleNav={toggleNav} navOpen={navOpen} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'shrink-0 h-full overflow-y-auto bg-sidebar transition-all duration-300 ease-in-out',
            navOpen ? 'w-64' : 'w-20'
          )}
        >
          <Navbar navOpen={navOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}

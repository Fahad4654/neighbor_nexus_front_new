import { Home } from 'lucide-react';

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Home className="h-6 w-6" />
      <span className="text-xl font-semibold font-headline">Neighbor Nexus</span>
    </div>
  );
}

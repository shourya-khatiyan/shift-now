import { Home, Search, PlusCircle, Briefcase, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();
  
  const isWorker = profile?.role === 'worker';
  
  const workerNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/jobs', icon: Search, label: 'Jobs' },
    { href: '/my-jobs', icon: Briefcase, label: 'My Jobs' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const employerNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/post-job', icon: PlusCircle, label: 'Post Job' },
    { href: '/my-jobs', icon: Briefcase, label: 'My Jobs' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const navItems = isWorker ? workerNavItems : employerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

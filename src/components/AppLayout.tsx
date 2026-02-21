import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Route, Wrench, Receipt, Users, BarChart3,
  Bell, LogOut, ChevronLeft, Menu, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, UserRole } from '@/store/useStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['fleet_manager', 'dispatcher'] },
  { label: 'Vehicle Registry', icon: Truck, path: '/vehicles', roles: ['fleet_manager'] },
  { label: 'Trip Dispatcher', icon: Route, path: '/trips', roles: ['fleet_manager', 'dispatcher'] },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['fleet_manager'] },
  { label: 'Trip & Expense', icon: Receipt, path: '/expenses', roles: ['fleet_manager', 'financial_analyst'] },
  { label: 'Driver Performance', icon: Users, path: '/drivers', roles: ['fleet_manager', 'safety_officer'] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['fleet_manager', 'financial_analyst'] },
];

const roleLabels: Record<UserRole, string> = {
  fleet_manager: 'Fleet Manager',
  dispatcher: 'Dispatcher',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-30 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
          <Zap className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Main */}
      <div className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-16' : 'ml-60')}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(!collapsed)} className="md:hidden text-muted-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold capitalize">
              {filteredNav.find((n) => n.path === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user ? roleLabels[user.role] : ''}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Palette, Users, Settings, Send, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'themes', label: 'Tema', icon: Palette },
  { id: 'users', label: 'Users', icon: Users, adminOnly: true }, // Admin only
  { id: 'guests', label: 'Daftar Tamu', icon: Users, hideForAdmin: true },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

function SidebarContent({ activeTab, onTabChange, onItemClick }: SidebarProps & { onItemClick?: () => void }) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Berhasil logout');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const getUserInitial = () => {
    const fullName = profile?.full_name || user?.user_metadata?.full_name;
    if (fullName) {
      return fullName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark">
          <Send className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-sidebar-foreground">
            Undangan
          </h1>
          <p className="text-xs text-muted-foreground">Digital Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.filter(item =>
          (!item.adminOnly || isAdmin) &&
          (!item.hideForAdmin || !isAdmin)
        ).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onItemClick?.();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-gold shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-gold"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-gold")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer - User Profile */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 flex-shrink-0">
            <span className="text-sm font-semibold text-gold">
              {getUserInitial()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email || 'user@email.com'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Logout
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-sidebar px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark">
            <Send className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-sidebar-foreground">
              Undangan
            </h1>
          </div>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <SidebarContent
              activeTab={activeTab}
              onTabChange={onTabChange}
              onItemClick={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar lg:block">
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
      </aside>
    </>
  );
}

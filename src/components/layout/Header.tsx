import { LogOut, Plane, Shield, UserCog, User } from 'lucide-react';
import { User as UserType } from '@/types';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps { user: UserType; }

const roleConfig = {
  admin: { label: 'Admin', Icon: Shield, color: 'text-amber-400' },
  manager: { label: 'Manager', Icon: UserCog, color: 'text-cyan-400' },
  employee: { label: 'Employee', Icon: User, color: 'text-emerald-400' },
};

export default function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const { label, Icon, color } = roleConfig[user.role];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Plane className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-base">
            <span className="text-primary">Aero</span>
            <span className="text-foreground">Assist</span>
          </span>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-medium text-foreground hidden sm:block">{user.name}</span>
            <span className={`text-xs ${color} hidden sm:block`}>{label}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

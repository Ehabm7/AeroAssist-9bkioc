import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, UserCog, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '@/types';
import { getStoredUsers, createUser, deleteUser } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [showPw, setShowPw] = useState(false);
  const currentUser = getCurrentUser();

  function refresh() { setUsers(getStoredUsers()); }
  useEffect(() => { refresh(); }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      toast.error('All fields are required.');
      return;
    }
    const { user, error } = createUser(name.trim(), username.trim(), password, role);
    if (error) { toast.error(error); return; }
    toast.success(`User "${user!.name}" created.`);
    setName(''); setUsername(''); setPassword('');
    refresh();
  }

  function handleDelete(u: User) {
    if (u.id === currentUser?.id) { toast.error('Cannot delete your own account.'); return; }
    if (!confirm(`Delete user "${u.name}"?`)) return;
    deleteUser(u.id);
    toast.success('User deleted.');
    refresh();
  }

  const roleIcon: Record<UserRole, React.ElementType> = { admin: Shield, manager: UserCog, employee: UserIcon };
  const roleColor: Record<UserRole, string> = { admin: 'text-amber-400', manager: 'text-cyan-400', employee: 'text-emerald-400' };
  const roleBadge: Record<UserRole, string> = {
    admin: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    manager: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    employee: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Create Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          New Account
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ahmed Hassan"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. ahmed.hassan"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <div className="flex gap-2">
              {(['manager', 'employee'] as UserRole[]).map(r => {
                const Icon = roleIcon[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      role === r ? roleBadge[r] : 'bg-secondary border-border text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Account
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">All Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map(u => {
            const Icon = roleIcon[u.role];
            return (
              <div key={u.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-xl border border-border/60">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center ${roleColor[u.role]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{u.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge[u.role]}`}>
                    {u.role}
                  </span>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

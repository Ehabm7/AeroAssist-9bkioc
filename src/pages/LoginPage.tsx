import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Eye, EyeOff, LogIn } from 'lucide-react';
import { login, getCurrentUser, initializeAdmin } from '@/lib/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeAdmin();
    const user = getCurrentUser();
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = login(username.trim(), password);
      setLoading(false);
      if (user) {
        toast.success(`Welcome, ${user.name}`);
        navigate(`/${user.role}`, { replace: true });
      } else {
        toast.error('Invalid username or password.');
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 glow-gold">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Aero</span>
            <span className="text-foreground">Assist</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Flight Operations Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-foreground mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Sign In
            </button>
          </form>

          {/* Demo accounts info */}
          <div className="mt-6 p-4 bg-secondary/60 rounded-xl border border-border/60 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Demo Accounts</p>
            <div className="grid gap-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-semibold">Admin</span>
                <span className="text-muted-foreground">admin / admin123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyan-400 font-semibold">Manager</span>
                <span className="text-muted-foreground">manager / manager123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-semibold">Employee</span>
                <span className="text-muted-foreground">employee / employee123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

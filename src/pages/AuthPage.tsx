import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const roles: { value: UserRole; label: string }[] = [
  { value: 'fleet_manager', label: 'Fleet Manager' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'financial_analyst', label: 'Financial Analyst' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!email || !password) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await login(email, password, role);
        if (error) {
          toast({ title: 'Login failed', description: error, variant: 'destructive' });
          return;
        }
      } else {
        const { error } = await register(name, email, password, role);
        if (error) {
          toast({ title: 'Registration failed', description: error, variant: 'destructive' });
          return;
        }
        toast({ title: 'Account created!', description: 'Confirm your email to get started.' });
        setMode('login');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        return;
      }
      toast({ title: '✓ Welcome to FleetFlow!', description: 'Redirecting to your dashboard...' });
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Navigation Header */}
      <nav className="border-b border-border/30 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8 shadow-2xl backdrop-blur-xl border border-primary/10 animate-scale-in opacity-0" style={{ animationDelay: '150ms' }}>
          {/* Auth Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-bold">Authentication</span>
            </div>
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' ? 'Sign in to your dashboard' : 'Create your fleet account'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 gap-2 bg-secondary/50 border-border hover:bg-secondary transition-all h-10"
            onClick={handleGoogleLogin}
            disabled={submitting}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
              or
            </span>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Your Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="mt-1.5 bg-secondary/50 border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1.5 bg-secondary/50 border-border focus:border-primary"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 bg-secondary/50 border-border focus:border-primary"
                disabled={submitting}
              />
            </div>

            {mode === 'register' && (
              <div>
                <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 bg-secondary/50 border-border focus:border-primary"
                  disabled={submitting}
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground">
                  <Checkbox /> Remember me
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-10 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </div>
              ) : mode === 'login' ? (
                '✓ Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Form Toggle */}
          <div className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setEmail('');
                setPassword('');
                setName('');
                setConfirmPassword('');
              }}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              🔒 <span className="font-medium">SSL encrypted</span> - Your data is secure
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/50 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 FleetFlow. Modular Fleet & Logistics Management System.</p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap } from 'lucide-react';
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
        toast({ title: 'Check your email', description: 'We sent you a confirmation link.' });
        return;
      }
      toast({ title: 'Welcome to FleetFlow!' });
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-secondary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Zap className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold tracking-tight">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          </div>
          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
            Modular Fleet & Logistics Management System. Streamline operations, optimize routes, and drive efficiency.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { val: '2.4K+', label: 'Vehicles Managed' },
              { val: '99.7%', label: 'Uptime' },
              { val: '35%', label: 'Cost Reduction' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="glass-card w-full max-w-md p-8 animate-scale-in opacity-0" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'login' ? 'Sign in to your dashboard' : 'Register for a new account'}
          </p>

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 gap-2 bg-secondary border-border hover:bg-secondary/80"
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1.5 bg-secondary border-border" />
              </div>
            )}
            {mode === 'register' && (
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="mt-1.5 bg-secondary border-border">
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
            </div>
            {mode === 'register' && (
              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
              </div>
            )}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox /> Remember me
                </label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary hover:underline font-medium">
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

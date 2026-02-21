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
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!email || !password) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (mode === 'login') {
      login(email, password, role);
    } else {
      register(name, email, password, role);
    }
    toast({ title: `Welcome to FleetFlow!` });
    navigate('/dashboard');
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1.5 bg-secondary border-border" />
              </div>
            )}
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
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

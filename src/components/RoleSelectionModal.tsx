import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: 'fleet_manager', label: 'Fleet Manager', desc: 'Full access to all modules' },
  { value: 'dispatcher', label: 'Dispatcher', desc: 'Trips and dashboard access' },
  { value: 'safety_officer', label: 'Safety Officer', desc: 'Drivers and compliance' },
  { value: 'financial_analyst', label: 'Financial Analyst', desc: 'Analytics and reports' },
];

export function RoleSelectionModal() {
  const navigate = useNavigate();
  const { needsRoleSelection, setNeedsRoleSelection, updateRoleInSupabase } = useAuthStore();
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateRoleInSupabase(role);
      toast({ title: 'Role set successfully! Redirecting to dashboard...' });
      // First close the modal
      setNeedsRoleSelection(false);
      // Small delay to let the toast show before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      toast({ title: 'Failed to set role', variant: 'destructive' });
      setSaving(false);
    }
  };

  return (
    <Dialog open={needsRoleSelection} onOpenChange={setNeedsRoleSelection}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/80 border-primary/30 shadow-2xl shadow-primary/20 animate-scale-in" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg shadow-lg animate-pulse">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          </div>
          <DialogTitle className="text-2xl">Select Your Role</DialogTitle>
          <DialogDescription className="text-base">
            Choose the role that best matches your responsibilities in managing your fleet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div>
            <Label className="text-sm font-semibold mb-2 block">Your Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="mt-2 bg-secondary/50 border-border hover:border-primary focus:border-primary transition-all h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="py-3">
                    <div>
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">— {r.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleConfirm} 
              disabled={saving} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 h-11 font-semibold group"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : (
                <span className="group-hover:translate-x-1 transition-transform">Confirm & Continue to Dashboard</span>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">You can change your role anytime in settings</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

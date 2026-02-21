import { useState } from 'react';
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
  const { needsRoleSelection, updateRoleInSupabase } = useAuthStore();
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateRoleInSupabase(role);
      toast({ title: 'Role set successfully!' });
    } catch {
      toast({ title: 'Failed to set role', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={needsRoleSelection}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              FLEET<span className="text-primary">FLOW</span>
            </span>
          </div>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>
            Choose the role that best matches your responsibilities. This determines which modules you can access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div>
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">— {r.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConfirm} disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Saving...' : 'Confirm & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

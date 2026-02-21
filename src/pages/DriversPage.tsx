import { useState } from 'react';
import { Plus, Pencil, Trash2, Award, ShieldCheck, AlertTriangle, TrendingUp, Star, Search, UserCheck } from 'lucide-react';
import { useFleetStore, Driver, DriverStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    completionRate: 90,
    safetyScore: 85,
    complaints: 0,
    status: 'On Duty' as DriverStatus,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      licenseNumber: '',
      licenseExpiry: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
      completionRate: 90,
      safetyScore: 85,
      complaints: 0,
      status: 'On Duty',
    });
    setModalOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setForm({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      completionRate: driver.completionRate,
      safetyScore: driver.safetyScore,
      complaints: driver.complaints,
      status: driver.status,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editing) {
      updateDriver(editing.id, form);
      toast({ title: '✓ Driver Lifecycle Updated', description: `${form.name}'s profile re-qualified.` });
    } else {
      if (drivers.some((d) => d.licenseNumber === form.licenseNumber)) {
        toast({ title: 'License number must be unique', variant: 'destructive' });
        return;
      }
      addDriver(form);
      toast({ title: '✓ New Personnel Registered', description: `${form.name} cleared for duty.` });
    }
    setModalOpen(false);
  };

  const filtered = drivers.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const topPerformer = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">Personnel Center</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Monitoring safety compliance and performance for {drivers.length} operators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5 transition-all text-xs font-black uppercase tracking-tighter h-11">
            <TrendingUp className="h-4 w-4 mr-2" /> Training Hub
          </Button>
          <Button onClick={openCreate} className="px-6 h-11 shadow-lg hover:shadow-primary/30 transition-all font-black uppercase tracking-tighter">
            <Plus className="h-5 w-5 mr-1" /> Register Driver
          </Button>
        </div>
      </div>

      {/* Top Performer Spotlight (FUN/PREMIUM ELEMENT) */}
      {topPerformer && (
        <Card className="p-1 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/10 to-transparent animate-shimmer" />
          <div className="p-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl ring-4 ring-primary/10">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary mb-1">Elite Operator Tier</Badge>
                <h3 className="font-black text-xl uppercase tracking-tighter">{topPerformer.name}</h3>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 justify-end text-yellow-500 mb-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Safety Score: {topPerformer.safetyScore}%</p>
            </div>
          </div>
        </Card>
      )}

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search active personnel, CDL refs, or tags..."
        filters={[{
          label: 'Ops Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'All Personal', value: 'all' },
            { label: 'Active Duty', value: 'On Duty' },
            { label: 'Off Cycle', value: 'Off Duty' },
            { label: 'Compliance Hold', value: 'Suspended' },
          ],
        }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {filtered.map((d, i) => {
          const expired = isLicenseExpired(d.licenseExpiry);
          const daysUntilExpiry = Math.ceil((new Date(d.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

          return (
            <Card key={d.id} className={cn(
              "group hover:border-primary/40 transition-all duration-300 relative overflow-hidden",
              expired ? "border-destructive/30" : isExpiringSoon ? "border-status-maintenance/30" : "border-border/50"
            )}>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-base uppercase tracking-tight">{d.name}</h4>
                      <p className="text-[10px] font-mono text-muted-foreground -mt-0.5">{d.licenseNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Safety Index</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-black",
                        d.safetyScore >= 90 ? "text-status-available" : d.safetyScore >= 75 ? "text-primary" : "text-destructive"
                      )}>{d.safetyScore}%</span>
                      {d.safetyScore >= 95 && <ShieldCheck className="h-4 w-4 text-status-available" />}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Completeness</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black">{d.completionRate}%</span>
                      <TrendingUp className="h-4 w-4 text-primary opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>License Expiration</span>
                    <span className={cn(expired ? "text-destructive" : isExpiringSoon ? "text-status-maintenance" : "text-primary")}>
                      {d.licenseExpiry}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", expired ? "bg-destructive w-full" : isExpiringSoon ? "bg-status-maintenance w-1/4" : "bg-primary w-full opacity-30")}
                      style={!expired && !isExpiringSoon ? {} : undefined}
                    />
                  </div>
                  {expired && <p className="text-[10px] text-destructive font-black uppercase tracking-tighter">* COMPLIANCE VIOLATION: LICENSE EXPIRED</p>}
                </div>

                <div className="pt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[9px] text-muted-foreground uppercase font-black">Complaints</p>
                      <p className="text-sm font-black">{d.complaints}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8 text-primary hover:bg-primary/20">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-20 text-center glass-card border-dashed">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">No personnel matching current filters</p>
          </div>
        )}
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Revise Personnel File' : 'Onboard New Operator'}>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Operator Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Marcus Johnson" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">CDL / License Ref</Label>
              <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })} className="mt-1 font-mono uppercase" placeholder="CDL-XXXXX" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Registry Expiration</Label>
              <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Performance Sliders</Label>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground">Complaints: {form.complaints}</span>
                <input type="range" min="0" max="10" value={form.complaints} onChange={(e) => setForm({ ...form, complaints: Number(e.target.value) })} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Operations Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Duty">Active Duty</SelectItem>
                  <SelectItem value="Off Duty">Off Cycle</SelectItem>
                  <SelectItem value="Suspended">Compliance Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 font-black uppercase tracking-tighter">
              {editing ? 'Update File' : 'Authorize Personnel'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

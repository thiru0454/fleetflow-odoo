import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, History, X, MapPin, Calendar, Package, Award, ShieldCheck, TrendingUp, Star, Search, UserCheck } from 'lucide-react';
import { useFleetStore, Driver, DriverStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const { drivers, trips, vehicles, addDriver, updateDriver, deleteDriver, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [historyDriver, setHistoryDriver] = useState<Driver | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Driver | null>(null);
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

  const handleDelete = (driver: Driver) => {
    setDeleteConfirm(driver);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteDriver(deleteConfirm.id);
    toast({ title: '🗑 Driver removed', description: `${deleteConfirm.name} has been removed from the fleet.` });
    setDeleteConfirm(null);
  };

  const getDriverTrips = (driverId: string) =>
    trips.filter((t) => t.driverId === driverId).sort((a, b) => b.date.localeCompare(a.date));

  // Computed completion rate from actual trip data
  const getRealCompletionRate = (driverId: string) => {
    const driverTrips = trips.filter((t) => t.driverId === driverId);
    if (!driverTrips.length) return null;
    const completed = driverTrips.filter((t) => t.status === 'Completed').length;
    return Math.round((completed / driverTrips.length) * 100);
  };

  const filtered = drivers.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const topPerformer = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore)[0];

  const tripStatusColor: Record<string, string> = {
    Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    Dispatched: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Draft: 'bg-muted text-muted-foreground border-border',
    Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'On Duty', count: drivers.filter(d => d.status === 'On Duty').length, color: 'text-green-400' },
          { label: 'Off Duty', count: drivers.filter(d => d.status === 'Off Duty').length, color: 'text-muted-foreground' },
          { label: 'Suspended', count: drivers.filter(d => d.status === 'Suspended').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className={cn('text-2xl font-black', s.color)}>{s.count}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Performer Spotlight */}
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

      {/* Driver Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="align-left">Driver Name</th>
                <th className="align-left">License #</th>
                <th className="align-left">License Expiry</th>
                <th className="align-right">Completion</th>
                <th className="align-center">Safety Score</th>
                <th className="align-right">Complaints</th>
                <th className="align-center">Status</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const expired = isLicenseExpired(d.licenseExpiry);
                const daysUntilExpiry = Math.ceil((new Date(d.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                const realRate = getRealCompletionRate(d.id);
                const driverTripsCount = getDriverTrips(d.id).length;

                return (
                  <tr
                    key={d.id}
                    className={cn(
                      'opacity-0 animate-fade-in hover:bg-secondary/50 transition-colors',
                      expired && 'bg-destructive/5 border-l-2 border-destructive',
                      isExpiringSoon && !expired && 'bg-status-maintenance/5 border-l-2 border-status-maintenance'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="align-left">
                      <button
                        className="font-medium text-left hover:text-primary transition-colors flex items-center gap-1.5 group"
                        onClick={() => setHistoryDriver(d)}
                        title="View trip history"
                      >
                        {d.name}
                        {driverTripsCount > 0 && (
                          <span className="text-[10px] font-bold text-primary/60 group-hover:text-primary transition-colors">
                            ({driverTripsCount} trips)
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="align-left text-muted-foreground font-mono">{d.licenseNumber}</td>
                    <td className={cn('align-left font-medium', expired && 'text-destructive', isExpiringSoon && !expired && 'text-status-maintenance')}>
                      <div className="flex items-center gap-2">
                        {d.licenseExpiry}
                        {expired && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {isExpiringSoon && !expired && <AlertTriangle className="h-4 w-4 text-status-maintenance" />}
                      </div>
                      {expired && <span className="text-xs">(EXPIRED)</span>}
                      {isExpiringSoon && !expired && <span className="text-xs text-status-maintenance">({daysUntilExpiry} days)</span>}
                    </td>
                    <td className="align-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-status-available" style={{ width: `${realRate ?? d.completionRate}%` }} />
                        </div>
                        <span className="text-sm font-medium">
                          {realRate !== null ? (
                            <span title="Calculated from actual trips">{realRate}%</span>
                          ) : (
                            <span className="text-muted-foreground">{d.completionRate}%</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="align-center">
                      <span className={cn('font-medium px-2.5 py-1 rounded-full text-sm',
                        d.safetyScore >= 90 ? 'bg-status-available/20 text-status-available' :
                          d.safetyScore >= 75 ? 'bg-status-on-trip/20 text-status-on-trip' :
                            'bg-destructive/20 text-destructive'
                      )}>
                        {d.safetyScore}
                      </span>
                    </td>
                    <td className="align-right font-medium">{d.complaints}</td>
                    <td className="align-center"><StatusBadge status={d.status} /></td>
                    <td className="align-center">
                      <div className="cell-actions">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setHistoryDriver(d)}
                          title="Trip History"
                          className="h-8 w-8 text-muted-foreground hover:bg-primary/20 hover:text-primary hover:scale-110 transition-all duration-200"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => openEdit(d)}
                          title="Edit Driver"
                          className="h-8 w-8 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleDelete(d)}
                          title="Delete Driver"
                          className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs opacity-50">No personnel matching current filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add New Driver'}>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Operator Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Marcus Johnson" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">CDL / License Ref</Label>
              <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })} className="mt-1 font-mono uppercase" placeholder="CDL-XXXXX" disabled={!!editing} />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Registry Expiration</Label>
              <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} className="mt-1" />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Safety Score (%)', key: 'safetyScore' as const, max: 100 },
              { label: 'Complaints', key: 'complaints' as const, max: 10 },
            ].map(({ label, key, max }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">{label}</Label>
                  <span className={cn('text-sm font-medium',
                    key === 'safetyScore'
                      ? form.safetyScore >= 90 ? 'text-status-available' : form.safetyScore >= 75 ? 'text-status-on-trip' : 'text-destructive'
                      : 'text-primary'
                  )}>{form[key]}{key === 'safetyScore' ? '%' : ''}</span>
                </div>
                <input
                  type="range" min="0" max={max} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}
          </div>

          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Operations Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="On Duty">On Duty</SelectItem>
                <SelectItem value="Off Duty">Off Duty</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 font-black uppercase tracking-tighter">
              {editing ? 'Update File' : 'Authorize Personnel'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </ModalForm>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm glass-card border-destructive/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong className="text-foreground">{deleteConfirm?.name}</strong> from the fleet? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="destructive" className="flex-1" onClick={confirmDelete}>Yes, Delete</Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trip History Modal */}
      <Dialog open={!!historyDriver} onOpenChange={(o) => !o && setHistoryDriver(null)}>
        <DialogContent className="sm:max-w-2xl glass-card border-primary/20 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {historyDriver?.name} — Trip History
            </DialogTitle>
          </DialogHeader>

          {historyDriver && (() => {
            const driverTrips = getDriverTrips(historyDriver.id);
            const realRate = getRealCompletionRate(historyDriver.id);
            const totalCargo = driverTrips.reduce((a, t) => a + t.cargoWeight, 0);

            return (
              <div className="space-y-4 mt-2">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="text-xl font-black text-primary">{driverTrips.length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Trips</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-xl font-black text-green-400">{realRate !== null ? `${realRate}%` : `${historyDriver.completionRate}%`}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Completion</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border text-center">
                    <p className="text-xl font-black">{(totalCargo / 1000).toFixed(1)}t</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Cargo</p>
                  </div>
                </div>

                {/* Trip List */}
                {driverTrips.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No trips recorded for this driver yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driverTrips.map((trip) => {
                      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                      return (
                        <div key={trip.id} className="p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-primary font-bold">{trip.id}</span>
                                <Badge variant="outline" className={cn('text-[9px] font-black uppercase', tripStatusColor[trip.status])}>
                                  {trip.status}
                                </Badge>
                                {vehicle && (
                                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                    {vehicle.model}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {trip.origin} → {trip.destination}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{trip.date}</span>
                                <span className="flex items-center gap-1"><Package className="h-3 w-3" />{trip.cargoWeight.toLocaleString()} kg</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-primary">${trip.estimatedFuelCost}</p>
                              <p className="text-[10px] text-muted-foreground">Est. Fuel</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

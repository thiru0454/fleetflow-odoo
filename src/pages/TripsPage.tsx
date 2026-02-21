import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, CheckCircle, Navigation, MapPin, Package, Clock, Activity, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useFleetStore, TripStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTrip, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    vehicleId: '', driverId: '', cargoWeight: '' as string | number, origin: '', destination: '', estimatedFuelCost: '' as string | number,
  });
  const [cargoError, setCargoError] = useState('');
  const [licenseError, setLicenseError] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'On Duty' && !isLicenseExpired(d.licenseExpiry));

  const openCreate = () => {
    setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', estimatedFuelCost: '' });
    setCargoError('');
    setLicenseError('');
    setModalOpen(true);
  };

  const handleCargoChange = (val: string) => {
    setForm({ ...form, cargoWeight: val });
    const numVal = Number(val) || 0;
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (vehicle && numVal > vehicle.capacity) {
      setCargoError(`Cargo exceeds capacity: ${vehicle.capacity}kg max`);
    } else {
      setCargoError('');
    }
  };

  const handleVehicleChange = (vid: string) => {
    setForm({ ...form, vehicleId: vid });
    const vehicle = vehicles.find((v) => v.id === vid);
    if (vehicle && Number(form.cargoWeight) > vehicle.capacity) {
      setCargoError(`Cargo exceeds capacity: ${vehicle.capacity}kg max`);
    } else {
      setCargoError('');
    }
  };

  const handleDriverChange = (did: string) => {
    setForm({ ...form, driverId: did });
    const driver = drivers.find((d) => d.id === did);
    if (driver && isLicenseExpired(driver.licenseExpiry)) {
      setLicenseError(`License expired on ${driver.licenseExpiry}`);
    } else {
      setLicenseError('');
    }
  };

  const handleSave = () => {
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (cargoError) {
      toast({ title: cargoError, variant: 'destructive' });
      return;
    }
    if (licenseError) {
      toast({ title: licenseError, variant: 'destructive' });
      return;
    }
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    addTrip({
      ...form,
      cargoWeight: Number(form.cargoWeight) || 0,
      estimatedFuelCost: Number(form.estimatedFuelCost) || 0,
      vehicleType: vehicle?.type || '',
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      region: vehicle?.region || '',
    });
    toast({ title: '✓ Mission Vector Locked', description: 'Logistics packet generated and queued.' });
    setModalOpen(false);
  };

  const handleDispatch = (id: string) => {
    setDispatchingId(id);
    setTimeout(() => {
      updateTrip(id, { status: 'Dispatched' });
      toast({ title: '🚀 DISPATCH ACTIVE', description: 'Live tracking stream established.' });
      setDispatchingId(null);
    }, 800);
  };

  const handleComplete = (id: string) => {
    setDispatchingId(id);
    setTimeout(() => {
      updateTrip(id, { status: 'Completed' });
      toast({ title: '✅ ARCHIVAL SUCCESS', description: 'Mission data migrated to historical logs.' });
      setDispatchingId(null);
    }, 800);
  };

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filtered = trips.filter((t) => {
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) || t.origin.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">Mission Dispatch</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time vector tracking and cargo orchestration</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:shadow-xl transition-all font-black uppercase tracking-tighter h-11 px-8">
          <Plus className="h-5 w-5 mr-1" /> Initialize Trip
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Analyze mission IDs, locations, or status..."
        filters={[{
          label: 'Lifecycle', value: statusFilter, onChange: setStatusFilter,
          options: [{ label: 'All Lifecycle', value: 'all' }, { label: 'Drafting', value: 'Draft' }, { label: 'In Transit', value: 'Dispatched' }, { label: 'Completed', value: 'Completed' }, { label: 'Aborted', value: 'Cancelled' }],
        }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {filtered.map((t, i) => {
          const vehicle = getVehicle(t.vehicleId);
          const driver = getDriver(t.driverId);
          const isLoading = dispatchingId === t.id;

          return (
            <Card key={t.id} className={cn(
              "glass-card p-6 hover:border-primary/40 transition-all group overflow-hidden relative",
              t.status === 'Dispatched' && "bg-gradient-to-br from-status-on-trip/5 to-transparent border-status-on-trip/30"
            )}>
              {t.status === 'Dispatched' && (
                <div className="absolute top-0 right-0 p-1 bg-status-on-trip text-slate-900 text-[10px] font-black uppercase flex items-center gap-1 px-3 rounded-bl-xl shadow-lg animate-pulse">
                  <Zap className="h-3 w-3 fill-current" /> Live Signal Active
                </div>
              )}

              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest text-primary border-primary/20 mb-2 uppercase">{t.id}</Badge>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      <h3 className="font-black text-lg uppercase tracking-tight">{t.origin} <ArrowRight className="h-4 w-4 inline text-muted-foreground mx-1" /> {t.destination}</h3>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Asset</p>
                      <p className="text-xs font-bold truncate max-w-[100px]">{vehicle?.model || 'UNSPECIFIED'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-status-available shadow-sm">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Operator</p>
                      <p className="text-xs font-bold truncate max-w-[100px]">{driver?.name || 'UNSPECIFIED'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{t.cargoWeight.toLocaleString()} KG</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{t.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {t.status === 'Draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleDispatch(t.id)}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 font-black uppercase tracking-tighter text-[10px] h-8 shadow-md"
                      >
                        {isLoading ? 'SYNCING...' : 'Dispatch Vector'}
                      </Button>
                    )}
                    {t.status === 'Dispatched' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleComplete(t.id)}
                        disabled={isLoading}
                        className="border-status-available text-status-available hover:bg-status-available/10 font-black uppercase tracking-tighter text-[10px] h-8"
                      >
                        {isLoading ? 'ARCHIVING...' : 'Archive Mission'}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/20">
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-20 text-center glass-card border-dashed">
            <Navigation className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">No mission clusters detected in current search sector</p>
          </div>
        )}
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Initialize Mission Vector">
        <div className="space-y-4">
          {cargoError && <Alert className="border-destructive/50 bg-destructive/5 text-destructive py-2"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px] font-black uppercase">{cargoError}</AlertDescription></Alert>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Origin Hub</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1" placeholder="City, State" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Destination Hub</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1" placeholder="City, State" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Available Asset</Label>
              <Select value={form.vehicleId} onValueChange={handleVehicleChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.model} ({v.licensePlate})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Personnel Assignment</Label>
              <Select value={form.driverId} onValueChange={handleDriverChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} (Safety: {d.safetyScore}%)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Payload Weight (KG)</Label>
              <Input type="number" value={form.cargoWeight} onChange={(e) => handleCargoChange(e.target.value)} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Est. Operational Cost ($)</Label>
              <Input type="number" value={form.estimatedFuelCost} onChange={(e) => setForm({ ...form, estimatedFuelCost: Number(e.target.value) })} className="mt-1" placeholder="0" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 font-black uppercase tracking-tighter shadow-lg shadow-primary/20">
              Initialize & Vector Lock
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

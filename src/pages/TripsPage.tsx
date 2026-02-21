import { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';
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

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTrip, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    vehicleId: '', driverId: '', cargoWeight: 0, origin: '', destination: '', estimatedFuelCost: 0,
  });
  const [cargoError, setCargoError] = useState('');
  const [licenseError, setLicenseError] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'On Duty' && !isLicenseExpired(d.licenseExpiry));

  const openCreate = () => {
    setForm({ vehicleId: '', driverId: '', cargoWeight: 0, origin: '', destination: '', estimatedFuelCost: 0 });
    setCargoError('');
    setLicenseError('');
    setModalOpen(true);
  };

  const handleCargoChange = (val: number) => {
    setForm({ ...form, cargoWeight: val });
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (vehicle && val > vehicle.capacity) {
      setCargoError(`Cargo exceeds capacity: ${vehicle.capacity}kg max`);
    } else {
      setCargoError('');
    }
  };

  const handleVehicleChange = (vid: string) => {
    setForm({ ...form, vehicleId: vid });
    const vehicle = vehicles.find((v) => v.id === vid);
    if (vehicle && form.cargoWeight > vehicle.capacity) {
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
      vehicleType: vehicle?.type || '',
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
    });
    toast({ title: '✓ Trip created successfully', variant: 'default' });
    setModalOpen(false);
  };

  const handleDispatch = (id: string) => {
    const trip = trips.find(t => t.id === id);
    const driver = trip ? drivers.find(d => d.id === trip.driverId) : null;

    if (driver && isLicenseExpired(driver.licenseExpiry)) {
      toast({ title: 'Cannot dispatch: driver license expired', variant: 'destructive' });
      return;
    }

    setDispatchingId(id);
    setTimeout(() => {
      updateTrip(id, { status: 'Dispatched' });
      toast({ title: '🚀 Trip dispatched successfully', description: 'Vehicle & driver status updated to On Trip' });
      setDispatchingId(null);
    }, 500);
  };

  const handleComplete = (id: string) => {
    setDispatchingId(id);
    setTimeout(() => {
      updateTrip(id, { status: 'Completed' });
      toast({ title: '✅ Trip completed', description: 'Vehicle & driver returned to available status' });
      setDispatchingId(null);
    }, 500);
  };

  const handleCancel = (id: string) => {
    updateTrip(id, { status: 'Cancelled' });
    toast({ title: 'Trip cancelled', variant: 'destructive' });
  };

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filtered = trips.filter((t) => {
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) || t.origin.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Trip Dispatcher</h2>
          <p className="text-sm text-muted-foreground">Manage and dispatch fleet trips with real-time status tracking</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 group">
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> New Trip
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search trips by ID or location..."
        filters={[{
          label: 'Status', value: statusFilter, onChange: setStatusFilter,
          options: (['Draft', 'Dispatched', 'Completed', 'Cancelled'] as TripStatus[]).map((s) => ({ label: s, value: s })),
        }]}
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th className="align-left">Trip ID</th><th className="align-left">Vehicle</th><th className="align-left">Driver</th><th className="align-left">Origin</th><th className="align-left">Destination</th><th className="align-right">Cargo (kg)</th><th className="align-center">Status</th><th className="align-center">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const vehicle = getVehicle(t.vehicleId);
                const driver = getDriver(t.driverId);
                const isLoading = dispatchingId === t.id;
                return (
                  <tr key={t.id} className="opacity-0 animate-fade-in hover:bg-secondary/50 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="align-left font-medium text-primary">{t.id}</td>
                    <td className="align-left">
                      <div className="flex items-center gap-2">
                        <span>{vehicle?.model || '—'}</span>
                        <StatusBadge status={vehicle?.status || 'Available'} />
                      </div>
                    </td>
                    <td className="align-left">
                      <div className="flex items-center gap-2">
                        <span>{driver?.name || '—'}</span>
                        {driver && isLicenseExpired(driver.licenseExpiry) && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                    </td>
                    <td className="align-left text-muted-foreground">{t.origin}</td>
                    <td className="align-left text-muted-foreground">{t.destination}</td>
                    <td className="align-right font-medium">{t.cargoWeight.toLocaleString()}</td>
                    <td className="align-center"><StatusBadge status={t.status} /></td>
                    <td className="align-center">
                      <div className="cell-actions gap-1">
                        {t.status === 'Draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDispatch(t.id)}
                              disabled={isLoading}
                              title="Dispatch Trip"
                              className="h-8 w-8 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                            >
                              {isLoading ? '...' : <Plus className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancel(t.id)}
                              title="Cancel Trip"
                              className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {t.status === 'Dispatched' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleComplete(t.id)}
                            disabled={isLoading}
                            title="Complete Trip"
                            className="h-8 w-8 text-status-available hover:bg-status-available/20 hover:scale-110 transition-all duration-200"
                          >
                            {isLoading ? '...' : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No trips found</div>
          )}
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Trip">
        <div className="space-y-4">
          {cargoError && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{cargoError}</AlertDescription>
            </Alert>
          )}
          {licenseError && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{licenseError}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label>Vehicle (Available) *</Label>
            <Select value={form.vehicleId} onValueChange={handleVehicleChange}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableVehicles.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No available vehicles</div>
                ) : (
                  availableVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.model} — {v.licensePlate} (Capacity: {v.capacity}kg)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Driver (On Duty & Valid License) *</Label>
            <Select value={form.driverId} onValueChange={handleDriverChange}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableDrivers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No drivers available with valid license</div>
                ) : (
                  availableDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} (Safety: {d.safetyScore}%)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cargo Weight (kg) *</Label>
            <Input
              type="number"
              value={form.cargoWeight}
              onChange={(e) => handleCargoChange(Number(e.target.value))}
              className={`mt-1.5 bg-secondary border-border ${cargoError ? 'border-destructive' : ''}`}
              placeholder="0"
            />
            {form.vehicleId && (
              <p className="text-xs text-muted-foreground mt-1">
                Max capacity: {getVehicle(form.vehicleId)?.capacity || '—'}kg
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origin Address *</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="City, State" />
            </div>
            <div>
              <Label>Destination Address *</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="City, State" />
            </div>
          </div>
          <div>
            <Label>Estimated Fuel Cost ($)</Label>
            <Input type="number" value={form.estimatedFuelCost} onChange={(e) => setForm({ ...form, estimatedFuelCost: Number(e.target.value) })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              <CheckCircle className="h-4 w-4 mr-2" />Confirm & Create Trip
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border hover:bg-secondary">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

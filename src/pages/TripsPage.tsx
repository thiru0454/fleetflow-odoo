import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFleetStore, TripStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTrip } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    vehicleId: '', driverId: '', cargoWeight: '' as string | number, origin: '', destination: '', estimatedFuelCost: '' as string | number,
  });
  const [cargoError, setCargoError] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'On Duty');

  const openCreate = () => {
    setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', estimatedFuelCost: '' });
    setCargoError('');
    setModalOpen(true);
  };

  const handleCargoChange = (val: string) => {
    setForm({ ...form, cargoWeight: val });
    const numVal = Number(val) || 0;
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (vehicle && numVal > vehicle.capacity) {
      setCargoError('Cargo exceeds maximum vehicle capacity');
    } else {
      setCargoError('');
    }
  };

  const handleVehicleChange = (vid: string) => {
    setForm({ ...form, vehicleId: vid });
    const vehicle = vehicles.find((v) => v.id === vid);
    if (vehicle && Number(form.cargoWeight) > vehicle.capacity) {
      setCargoError('Cargo exceeds maximum vehicle capacity');
    } else {
      setCargoError('');
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
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    addTrip({
      ...form,
      cargoWeight: Number(form.cargoWeight) || 0,
      estimatedFuelCost: Number(form.estimatedFuelCost) || 0,
      vehicleType: vehicle?.type || '',
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
    });
    toast({ title: 'Trip created' });
    setModalOpen(false);
  };

  const handleDispatch = (id: string) => {
    updateTrip(id, { status: 'Dispatched' });
    toast({ title: 'Trip dispatched' });
  };

  const handleCancel = (id: string) => {
    updateTrip(id, { status: 'Cancelled' });
    toast({ title: 'Trip cancelled' });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trip Dispatcher</h2>
          <p className="text-sm text-muted-foreground">Manage and dispatch fleet trips</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Trip
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search trips..."
        filters={[{
          label: 'Status', value: statusFilter, onChange: setStatusFilter,
          options: (['Draft', 'Dispatched', 'Completed', 'Cancelled'] as TripStatus[]).map((s) => ({ label: s, value: s })),
        }]}
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Cargo (kg)</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="font-medium text-primary">{t.id}</td>
                  <td>{getVehicle(t.vehicleId)?.model || '—'}</td>
                  <td>{getDriver(t.driverId)?.name || '—'}</td>
                  <td className="text-muted-foreground">{t.origin}</td>
                  <td className="text-muted-foreground">{t.destination}</td>
                  <td>{t.cargoWeight.toLocaleString()}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      {t.status === 'Draft' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleDispatch(t.id)} className="text-xs text-primary hover:bg-primary/10">Dispatch</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(t.id)} className="text-xs text-destructive hover:bg-destructive/10">Cancel</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip">
        <div className="space-y-4">
          <div>
            <Label>Vehicle (Available only)</Label>
            <Select value={form.vehicleId} onValueChange={handleVehicleChange}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.model} — {v.licensePlate}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Driver (Available only)</Label>
            <Select value={form.driverId} onValueChange={(v) => setForm({ ...form, driverId: v })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableDrivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cargo Weight (kg)</Label>
            <Input type="number" value={form.cargoWeight} onChange={(e) => handleCargoChange(e.target.value)} className="mt-1.5 bg-secondary border-border" placeholder="0" />
            {cargoError && <p className="text-xs text-destructive mt-1">{cargoError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origin Address</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>Destination Address</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>
          <div>
            <Label>Estimated Fuel Cost ($)</Label>
            <Input type="number" value={form.estimatedFuelCost} onChange={(e) => setForm({ ...form, estimatedFuelCost: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Confirm & Create Trip</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

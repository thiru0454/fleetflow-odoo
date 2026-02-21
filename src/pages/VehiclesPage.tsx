import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useFleetStore, Vehicle, VehicleStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const statuses: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    licensePlate: '', model: '', type: '', capacity: '' as string | number, odometer: '' as string | number, status: 'Available' as VehicleStatus, region: '',
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ licensePlate: '', model: '', type: '', capacity: '', odometer: '', status: 'Available', region: '' });
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      licensePlate: v.licensePlate,
      model: v.model,
      type: v.type,
      capacity: v.capacity,
      odometer: v.odometer,
      status: v.status,
      region: v.region
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.licensePlate || !form.model) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    if (editing) {
      updateVehicle(editing.id, {
        ...form,
        capacity: Number(form.capacity) || 0,
        odometer: Number(form.odometer) || 0,
      });
      toast({ title: 'Vehicle updated' });
    } else {
      if (vehicles.some((v) => v.licensePlate === form.licensePlate)) {
        toast({ title: 'License plate must be unique', variant: 'destructive' });
        return;
      }
      addVehicle({
        ...form,
        capacity: Number(form.capacity) || 0,
        odometer: Number(form.odometer) || 0,
      });
      toast({ title: 'Vehicle created' });
    }
    setModalOpen(false);
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch = !search || v.licensePlate.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Vehicle Registry</h2>
          <p className="text-sm text-muted-foreground">Manage your fleet assets</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 group">
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Add Vehicle
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search by plate or model..."
        filters={[{
          label: 'Status', value: statusFilter, onChange: setStatusFilter,
          options: statuses.map((s) => ({ label: s, value: s })),
        }]}
      />

      <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="align-left">License Plate</th>
                <th className="align-left">Model</th>
                <th className="align-left">Type</th>
                <th className="align-right">Capacity (kg)</th>
                <th className="align-right">Odometer</th>
                <th className="align-center">Status</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} className="opacity-0 animate-fade-in hover:bg-primary/10 hover:scale-y-105 transition-all duration-200 group" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="align-left font-medium group-hover:text-primary transition-colors">{v.licensePlate}</td>
                  <td className="align-left group-hover:text-primary transition-colors">{v.model}</td>
                  <td className="align-left text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{v.type}</td>
                  <td className="align-right group-hover:text-primary transition-colors">{v.capacity.toLocaleString()}</td>
                  <td className="align-right text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{v.odometer.toLocaleString()} km</td>
                  <td className="align-center"><StatusBadge status={v.status} /></td>
                  <td className="align-center">
                    <div className="cell-actions gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(v)}
                        title="Edit Vehicle"
                        className="h-8 w-8 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { deleteVehicle(v.id); toast({ title: 'Vehicle deleted' }); }}
                        title="Delete Vehicle"
                        className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Create Vehicle'}>
        <div className="space-y-4">
          <div>
            <Label>License Plate</Label>
            <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <Label>Model</Label>
            <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="mt-1.5 bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Payload (kg)</Label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Heavy Truck, Van, etc." className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Initial Odometer</Label>
              <Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
            </div>
            <div>
              <Label>Region</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="North, South, East, West" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300">
              {editing ? 'Update' : 'Create'} Vehicle
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

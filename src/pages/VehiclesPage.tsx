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
    licensePlate: '', model: '', type: '', capacity: '' as string | number, odometer: '' as string | number, status: 'Available' as VehicleStatus, acquisitionCost: '' as string | number,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ licensePlate: '', model: '', type: '', capacity: '', odometer: '', status: 'Available', acquisitionCost: '' });
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
      acquisitionCost: v.acquisitionCost
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
        acquisitionCost: Number(form.acquisitionCost) || 0
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
        acquisitionCost: Number(form.acquisitionCost) || 0
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Registry</h2>
          <p className="text-sm text-muted-foreground">Manage your fleet assets</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Vehicle
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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Model</th>
                <th>Type</th>
                <th>Capacity (kg)</th>
                <th>Odometer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="font-medium">{v.licensePlate}</td>
                  <td>{v.model}</td>
                  <td className="text-muted-foreground">{v.type}</td>
                  <td>{v.capacity.toLocaleString()}</td>
                  <td className="text-muted-foreground">{v.odometer.toLocaleString()} km</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="text-muted-foreground hover:text-foreground h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteVehicle(v.id); toast({ title: 'Vehicle deleted' }); }} className="text-muted-foreground hover:text-destructive h-8 w-8">
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
              <Label>Acquisition Cost ($)</Label>
              <Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
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
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {editing ? 'Update' : 'Create'} Vehicle
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

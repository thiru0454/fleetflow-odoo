import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useFleetStore, Vehicle, VehicleStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { useToast } from '@/hooks/use-toast';

const statuses: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Vehicle, 'id'>) => {
    if (editing) {
      updateVehicle(editing.id, data);
      toast({ title: 'Vehicle updated' });
    } else {
      addVehicle(data);
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
                  <td className="font-medium group-hover:text-primary transition-colors">{v.licensePlate}</td>
                  <td className="group-hover:text-primary transition-colors">{v.model}</td>
                  <td className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{v.type}</td>
                  <td className="align-right group-hover:text-primary transition-colors">{v.capacity.toLocaleString()}</td>
                  <td className="align-right text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{v.odometer.toLocaleString()} km</td>
                  <td className="align-center"><StatusBadge status={v.status} /></td>
                  <td className="align-center">
                    <div className="cell-actions gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(v)}
                        className="h-8 w-8 text-primary hover:bg-primary/20"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('Delete this vehicle?')) {
                            deleteVehicle(v.id);
                            toast({ title: 'Vehicle deleted' });
                          }
                        }}
                        className="h-8 w-8 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <VehicleForm
          initialData={editing || undefined}
          onCancel={() => setModalOpen(false)}
          onSave={handleSave}
          isUniquePlate={(plate) => !vehicles.some(v => v.licensePlate === plate)}
        />
      </ModalForm>
    </div>
  );
}

import { useState } from 'react';
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useFleetStore, TripStatus, Trip } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { TripForm } from '@/components/forms/TripForm';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TripsPage() {
  const { trips, vehicles, drivers, addTrip, updateTrip, deleteTrip, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const { toast } = useToast();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Trip, 'id'>) => {
    if (editing) {
      updateTrip(editing.id, data);
      toast({ title: '✓ Trip updated' });
    } else {
      addTrip(data);
      toast({ title: '✓ Trip created successfully' });
    }
    setModalOpen(false);
    setEditing(null);
  };





  const openEdit = (trip: Trip) => {
    setEditing(trip);
    setModalOpen(true);
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
              <tr><th className="align-left">Trip ID</th><th className="align-left">Vehicle</th><th className="align-left">Vehicle Type</th><th className="align-left">Driver</th><th className="align-left">Origin</th><th className="align-left">Destination</th><th className="align-right">Cargo (kg)</th><th className="align-right">Fuel Cost</th><th className="align-center">Status</th><th className="align-center">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const vehicle = getVehicle(t.vehicleId);
                const driver = getDriver(t.driverId);
                return (
                  <tr key={t.id} className="opacity-0 animate-fade-in hover:bg-secondary/50 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="align-left font-medium text-primary">{t.id}</td>
                    <td className="align-left">
                      <div className="flex items-center gap-2">
                        <span>{vehicle?.model || '—'}</span>
                        <StatusBadge status={vehicle?.status || 'Available'} />
                      </div>
                    </td>
                    <td className="align-left text-sm text-muted-foreground">{t.vehicleType}</td>
                    <td className="align-left">
                      <div className="flex items-center gap-2">
                        <span>{driver?.name || '—'}</span>
                        {driver && isLicenseExpired(driver.licenseExpiry) && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                    </td>
                    <td className="align-left text-muted-foreground">{t.origin}</td>
                    <td className="align-left text-muted-foreground">{t.destination}</td>
                    <td className="align-right font-medium">{t.cargoWeight.toLocaleString()}</td>
                    <td className="align-right text-muted-foreground">${t.estimatedFuelCost.toLocaleString()}</td>
                    <td className="align-center">
                      <Select
                        value={t.status}
                        onValueChange={(val: TripStatus) => {
                          updateTrip(t.id, { status: val });
                          toast({ title: `Status updated to ${val}` });
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-8 bg-transparent border-none p-0 focus:ring-0">
                          <StatusBadge status={t.status} className="cursor-pointer hover:opacity-80 transition-opacity w-full justify-center" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Dispatched">Dispatched</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="align-center">
                      <div className="cell-actions gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                          className="h-8 w-8 text-primary hover:bg-primary/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm('Delete this trip history?')) {
                              deleteTrip(t.id);
                              toast({ title: 'Trip deleted' });
                            }
                          }}
                          className="h-8 w-8 text-destructive hover:bg-destructive/20"
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
            <div className="p-8 text-center text-muted-foreground">No trips found</div>
          )}
        </div>
      </div>

      <ModalForm
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Trip' : 'Create New Trip'}
      >
        <TripForm
          initialData={editing || undefined}
          vehicles={vehicles}
          drivers={drivers}
          isLicenseExpired={isLicenseExpired}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      </ModalForm>
    </div >
  );
}

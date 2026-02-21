import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFleetStore, MaintenanceStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, addMaintenanceLog, updateMaintenanceLog } = useFleetStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ vehicleId: '', issue: '', date: '', cost: 0 });

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);

  const handleSave = () => {
    if (!form.vehicleId || !form.issue) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addMaintenanceLog({ ...form, status: 'New' });
    toast({ title: 'Maintenance log created — vehicle moved to In Shop' });
    setModalOpen(false);
    setForm({ vehicleId: '', issue: '', date: '', cost: 0 });
  };

  const filtered = maintenanceLogs.filter((m) => {
    return !search || m.issue.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance & Service</h2>
          <p className="text-sm text-muted-foreground">Track vehicle maintenance and repairs</p>
        </div>
        <Button onClick={() => { setForm({ vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: 0 }); setModalOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Log Service
        </Button>
      </div>

      <FilterBar searchValue={search} onSearch={setSearch} searchPlaceholder="Search logs..." />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Log ID</th><th>Vehicle</th><th>Issue/Service</th><th>Date</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="font-medium">{m.id}</td>
                  <td>{getVehicle(m.vehicleId)?.model || '—'} ({getVehicle(m.vehicleId)?.licensePlate})</td>
                  <td>{m.issue}</td>
                  <td className="text-muted-foreground">{m.date}</td>
                  <td>${m.cost.toLocaleString()}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>
                    {m.status !== 'Completed' && (
                      <Button variant="ghost" size="sm" onClick={() => { updateMaintenanceLog(m.id, { status: m.status === 'New' ? 'In Progress' : 'Completed' }); toast({ title: 'Status updated' }); }} className="text-xs text-primary">
                        {m.status === 'New' ? 'Start' : 'Complete'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Create Service Log">
        <div className="space-y-4">
          <div>
            <Label>Vehicle</Label>
            <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.model} — {v.licensePlate}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Issue/Service</Label>
            <Input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="Describe the issue..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>Cost ($)</Label>
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Create Log</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

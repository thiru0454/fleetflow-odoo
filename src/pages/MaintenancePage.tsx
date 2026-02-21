import { useState } from 'react';
import { Plus, Pencil, Trash2, Tool, Wrench, CheckCircle, Clock, AlertTriangle, Hammer, DollarSign, Calendar } from 'lucide-react';
import { useFleetStore, MaintenanceLog, MaintenanceStatus } from '@/store/useStore';
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

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, addMaintenanceLog, updateMaintenanceLog } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceLog | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: '' as string | number, status: 'Scheduled' as MaintenanceStatus,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: '', status: 'Scheduled' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.vehicleId || !form.issue) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    const data = { ...form, cost: Number(form.cost) || 0 };
    if (editing) {
      updateMaintenanceLog(editing.id, data);
      toast({ title: '✓ Maintenance Log Updated', description: 'Lifecycle data re-synced.' });
    } else {
      addMaintenanceLog(data);
      toast({ title: '✓ Service Scheduled', description: 'Vehicle status updated to In Shop.' });
    }
    setModalOpen(false);
  };

  const getVehicle = (id: string) => vehicles.find(v => v.id === id);

  const filtered = maintenanceLogs.filter((m) => {
    const vehicle = getVehicle(m.vehicleId);
    const matchSearch = !search || m.issue.toLowerCase().includes(search.toLowerCase()) || vehicle?.licensePlate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">Maintenance Lab</h2>
          <p className="text-sm text-muted-foreground mt-1">Preventive maintenance tracking and asset remediation logs</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:shadow-xl transition-all font-black uppercase tracking-tighter h-11 px-8">
          <Wrench className="h-5 w-5 mr-1" /> Schedule Service
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search issue logs or asset IDs..."
        filters={[{
          label: 'Service Status', value: statusFilter, onChange: setStatusFilter,
          options: [{ label: 'All Jobs', value: 'all' }, { label: 'Scheduled', value: 'Scheduled' }, { label: 'In Progress', value: 'In Progress' }, { label: 'Completed', value: 'Completed' }],
        }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {filtered.map((m, i) => {
          const vehicle = getVehicle(m.vehicleId);
          return (
            <Card key={m.id} className="p-5 glass-card hover:border-primary/40 transition-all group overflow-hidden relative">
              {m.status === 'In Progress' && (
                <div className="absolute top-0 right-0 p-1 bg-status-maintenance text-slate-900 text-[9px] font-black uppercase px-3 rounded-bl-xl shadow-lg animate-pulse">
                  Active Remediation
                </div>
              )}

              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Hammer className="h-5 w-5" />
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-secondary/30 border-primary/20">{m.id}</Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{m.date}</span>
                  </div>
                  <h4 className="font-black text-base uppercase tracking-tight line-clamp-1">{m.issue}</h4>
                  <p className="text-xs font-medium text-primary/80 mt-1 flex items-center gap-1">
                    <Truck className="h-3 w-3" /> {vehicle?.model || 'Unknown'} ({vehicle?.licensePlate || 'N/A'})
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center mt-auto border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <DollarSign className="h-3.5 w-3.5 text-status-available" />
                    <span className="text-sm font-black">{m.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setForm({ ...m, cost: String(m.cost) }); setModalOpen(true); }} className="h-8 w-8 text-primary hover:bg-primary/20">
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
            <Tool className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">No maintenance records detected</p>
          </div>
        )}
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Revise Service Record' : 'Log Maintenance Event'}>
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Affected Asset</Label>
            <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.model} ({v.licensePlate})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Issue Diagnostic / Task</Label>
            <Input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1" placeholder="Describe the service task..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Service Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Total Cost ($)</Label>
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="mt-1" placeholder="0" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Service Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MaintenanceStatus })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">Active Remediation</SelectItem>
                <SelectItem value="Completed">Service Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 font-black uppercase tracking-tighter">
              {editing ? 'Update Record' : 'Commit Service'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

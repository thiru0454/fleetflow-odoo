import { useState } from 'react';
import { Plus, Wrench, AlertCircle } from 'lucide-react';
import { useFleetStore, MaintenanceStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, addMaintenanceLog, updateMaintenanceLog } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: 0 });

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getVehicleStatus = (id: string) => getVehicle(id)?.status;

  const handleSave = () => {
    if (!form.vehicleId || !form.issue) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const vehicle = getVehicle(form.vehicleId);
    addMaintenanceLog({ ...form, status: 'New' });
    toast({
      title: '🔧 Service log created',
      description: `${vehicle?.model} moved to In Shop status automatically`,
    });
    setModalOpen(false);
    setForm({ vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: 0 });
  };

  const handleStatusUpdate = (id: string, currentStatus: MaintenanceStatus) => {
    setSavingId(id);
    setTimeout(() => {
      const nextStatus = currentStatus === 'New' ? 'In Progress' : 'Completed';
      updateMaintenanceLog(id, { status: nextStatus });
      toast({
        title: `✓ Status updated to ${nextStatus}`,
        description: currentStatus === 'New' ? 'Service in progress' : 'Service completed',
      });
      setSavingId(null);
    }, 300);
  };

  const filtered = maintenanceLogs.filter((m) => {
    const matchSearch = !search || m.issue.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const vehiclesInShop = vehicles.filter((v) => v.status === 'In Shop').length;
  const activeServices = maintenanceLogs.filter((m) => m.status === 'In Progress').length;
  const totalCost = maintenanceLogs.reduce((a, m) => a + m.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Maintenance &amp; Service</h2>
          <p className="text-sm text-muted-foreground">Preventative and reactive vehicle health tracking</p>
        </div>
        <Button
          onClick={() => {
            setForm({ vehicleId: '', issue: '', date: new Date().toISOString().split('T')[0], cost: 0 });
            setModalOpen(true);
          }}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 group"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Log Service
        </Button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 border-l-4 border-status-maintenance">
          <p className="text-xs text-muted-foreground mb-1">Vehicles In Shop</p>
          <p className="text-2xl font-bold text-status-maintenance">{vehiclesInShop}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-status-on-trip">
          <p className="text-xs text-muted-foreground mb-1">Active Services</p>
          <p className="text-2xl font-bold text-status-on-trip">{activeServices}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-primary">
          <p className="text-xs text-muted-foreground mb-1">Total Maintenance Cost</p>
          <p className="text-2xl font-bold text-primary">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      <Alert className="border-status-maintenance/50 bg-status-maintenance/10">
        <AlertCircle className="h-4 w-4 text-status-maintenance" />
        <AlertDescription className="text-status-maintenance">
          When you log service for a vehicle, its status automatically changes to "In Shop" and is hidden from the dispatcher's selection pool.
        </AlertDescription>
      </Alert>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search by issue or log ID..."
        filters={[{
          label: 'Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'New', value: 'New' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
          ],
        }]}
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="align-left">Log ID</th>
                <th className="align-left">Vehicle</th>
                <th className="align-left">Issue/Service</th>
                <th className="align-left">Date</th>
                <th className="align-right">Cost</th>
                <th className="align-center">Log Status</th>
                <th className="align-center">Vehicle Status</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const vehicle = getVehicle(m.vehicleId);
                const isLoading = savingId === m.id;
                return (
                  <tr
                    key={m.id}
                    className={cn(
                      'opacity-0 animate-fade-in hover:bg-secondary/50 transition-colors',
                      vehicle?.status === 'In Shop' && 'border-l-4 border-status-maintenance bg-status-maintenance/5'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="align-left font-mono font-medium">{m.id}</td>
                    <td className="align-left">
                      <div>
                        <p className="font-medium">{vehicle?.model || '—'}</p>
                        <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                      </div>
                    </td>
                    <td className="align-left max-w-xs">
                      <p className="font-medium text-sm">{m.issue}</p>
                    </td>
                    <td className="align-left text-muted-foreground">{m.date}</td>
                    <td className="align-right font-medium text-primary">${m.cost.toLocaleString()}</td>
                    <td className="align-center">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="align-center">
                      <StatusBadge status={vehicle?.status || 'Available'} />
                    </td>
                    <td className="align-center">
                      {m.status !== 'Completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(m.id, m.status)}
                          disabled={isLoading}
                          className="text-xs text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                        >
                          {isLoading ? '...' : m.status === 'New' ? 'Start' : 'Finish'}
                        </Button>
                      )}
                      {m.status === 'Completed' && (
                        <span className="text-xs text-status-available font-medium">✓ Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No maintenance logs found</div>
          )}
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Log Vehicle Service">
        <div className="space-y-4">
          <Alert className="border-primary/50 bg-primary/10">
            <Wrench className="h-4 w-4" />
            <AlertDescription>
              This vehicle will automatically move to <span className="font-semibold">In Shop</span> status
            </AlertDescription>
          </Alert>

          <div>
            <Label>Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border">
                <SelectValue placeholder="Select vehicle to service" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.model} — {v.licensePlate} (Status: {v.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Issue or Service Description *</Label>
            <Input
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              className="mt-1.5 bg-secondary border-border"
              placeholder="e.g., Engine oil change, brake inspection..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Service Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Cost ($)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="mt-1.5 bg-secondary border-border"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              Log Service
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border hover:bg-secondary">
              Cancel
            </Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

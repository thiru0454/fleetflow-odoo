import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useFleetStore, Driver, DriverStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    completionRate: 90,
    safetyScore: 85,
    complaints: 0,
    status: 'On Duty' as DriverStatus,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      licenseNumber: '',
      licenseExpiry: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
      completionRate: 90,
      safetyScore: 85,
      complaints: 0,
      status: 'On Duty',
    });
    setModalOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setForm({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      completionRate: driver.completionRate,
      safetyScore: driver.safetyScore,
      complaints: driver.complaints,
      status: driver.status,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editing) {
      updateDriver(editing.id, form);
      toast({ title: '✓ Driver updated successfully', description: `${form.name} profile saved` });
    } else {
      if (drivers.some((d) => d.licenseNumber === form.licenseNumber)) {
        toast({ title: 'License number must be unique', variant: 'destructive' });
        return;
      }
      addDriver(form);
      toast({ title: '✓ Driver added successfully', description: `${form.name} added to fleet` });
    }
    setModalOpen(false);
  };

  const handleDelete = (driver: Driver) => {
    // In a real app, this would call deleteDriver
    toast({ title: 'Delete driver', description: 'Feature coming soon', variant: 'default' });
  };

  const filtered = drivers.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Driver Performance & Safety</h2>
          <p className="text-sm text-muted-foreground">Monitor driver compliance, safety scores, and performance metrics</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 group">
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Add Driver
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search by name or license number..."
        filters={[{
          label: 'Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'On Duty', value: 'On Duty' },
            { label: 'Off Duty', value: 'Off Duty' },
            { label: 'Suspended', value: 'Suspended' },
          ],
        }]}
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="align-left">Driver Name</th>
                <th className="align-left">License #</th>
                <th className="align-left">License Expiry</th>
                <th className="align-right">Completion Rate</th>
                <th className="align-center">Safety Score</th>
                <th className="align-right">Complaints</th>
                <th className="align-center">Status</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const expired = isLicenseExpired(d.licenseExpiry);
                const daysUntilExpiry = Math.ceil((new Date(d.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

                return (
                  <tr
                    key={d.id}
                    className={cn(
                      'opacity-0 animate-fade-in hover:bg-secondary/50 transition-colors',
                      expired && 'bg-destructive/5 border-l-2 border-destructive',
                      isExpiringSoon && !expired && 'bg-status-maintenance/5 border-l-2 border-status-maintenance'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="align-left font-medium">{d.name}</td>
                    <td className="align-left text-muted-foreground font-mono">{d.licenseNumber}</td>
                    <td className={cn(
                      'align-left font-medium',
                      expired && 'text-destructive',
                      isExpiringSoon && !expired && 'text-status-maintenance'
                    )}>
                      <div className="flex items-center gap-2">
                        {d.licenseExpiry}
                        {expired && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {isExpiringSoon && !expired && <AlertTriangle className="h-4 w-4 text-status-maintenance" />}
                      </div>
                      {expired && <span className="text-xs">(EXPIRED)</span>}
                      {isExpiringSoon && !expired && <span className="text-xs text-status-maintenance">({daysUntilExpiry} days)</span>}
                    </td>
                    <td className="align-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-available"
                            style={{ width: `${d.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{d.completionRate}%</span>
                      </div>
                    </td>
                    <td className="align-center">
                      <span className={cn(
                        'font-medium px-2.5 py-1 rounded-full text-sm',
                        d.safetyScore >= 90 ? 'bg-status-available/20 text-status-available' :
                          d.safetyScore >= 75 ? 'bg-status-on-trip/20 text-status-on-trip' :
                            'bg-destructive/20 text-destructive'
                      )}>
                        {d.safetyScore}
                      </span>
                    </td>
                    <td className="align-right font-medium">{d.complaints}</td>
                    <td className="align-center"><StatusBadge status={d.status} /></td>
                    <td className="align-center">
                      <div className="cell-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(d)}
                          title="Edit Driver"
                          className="h-8 w-8 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No drivers found</div>
          )}
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add New Driver'}>
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 bg-secondary border-border"
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label>License Number *</Label>
            <Input
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              className="mt-1.5 bg-secondary border-border font-mono"
              placeholder="CDL-88421"
              disabled={editing ? true : false}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>License Expiry *</Label>
              <Input
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="On Duty">On Duty</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Completion Rate (%)</Label>
                <span className="text-sm font-medium text-primary">{form.completionRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.completionRate}
                onChange={(e) => setForm({ ...form, completionRate: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Safety Score (%)</Label>
                <span className={cn(
                  'text-sm font-medium',
                  form.safetyScore >= 90 ? 'text-status-available' :
                    form.safetyScore >= 75 ? 'text-status-on-trip' :
                      'text-destructive'
                )}>
                  {form.safetyScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.safetyScore}
                onChange={(e) => setForm({ ...form, safetyScore: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Complaints</Label>
                <span className="text-sm font-medium text-primary">{form.complaints}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={form.complaints}
                onChange={(e) => setForm({ ...form, complaints: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              {editing ? 'Save Changes' : 'Add Driver'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border hover:bg-secondary">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

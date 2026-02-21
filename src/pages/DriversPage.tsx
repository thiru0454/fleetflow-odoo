import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useFleetStore, Driver, DriverStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { DriverForm } from '@/components/forms/DriverForm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver, isLicenseExpired } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const { toast } = useToast();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Driver, 'id'>) => {
    if (editing) {
      updateDriver(editing.id, data);
      toast({ title: '✓ Driver updated successfully', description: `${data.name} profile saved` });
    } else {
      addDriver(data);
      toast({ title: '✓ Driver added successfully', description: `${data.name} added to fleet` });
    }
    setModalOpen(false);
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
                    <td className="font-medium">{d.name}</td>
                    <td className="text-muted-foreground font-mono">{d.licenseNumber}</td>
                    <td className={cn(
                      'font-medium',
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
                          className="h-8 w-8 text-primary hover:bg-primary/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm('Delete this driver registration?')) {
                              deleteDriver(d.id);
                              toast({ title: 'Driver removed' });
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
            <div className="p-8 text-center text-muted-foreground">No drivers found</div>
          )}
        </div>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add New Driver'}>
        <DriverForm
          initialData={editing || undefined}
          onCancel={() => setModalOpen(false)}
          onSave={handleSave}
          isUniqueLicense={(license) => !drivers.some(d => d.licenseNumber === license)}
        />
      </ModalForm>
    </div>
  );
}

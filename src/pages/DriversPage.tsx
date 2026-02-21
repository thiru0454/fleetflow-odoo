import { useState } from 'react';
import { useFleetStore } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const { drivers } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isExpired = (date: string) => new Date(date) < new Date();

  const filtered = drivers.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Driver Performance & Safety</h2>
        <p className="text-sm text-muted-foreground">Monitor driver safety and compliance</p>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search by name or license..."
        filters={[{
          label: 'Status', value: statusFilter, onChange: setStatusFilter,
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
            <thead><tr><th>Driver Name</th><th>License #</th><th>License Expiry</th><th>Completion Rate</th><th>Safety Score</th><th>Complaints</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((d, i) => {
                const expired = isExpired(d.licenseExpiry);
                return (
                  <tr
                    key={d.id}
                    className={cn(
                      'opacity-0 animate-fade-in',
                      expired && 'bg-destructive/5'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="font-medium">{d.name}</td>
                    <td className="text-muted-foreground">{d.licenseNumber}</td>
                    <td className={cn(expired && 'text-destructive font-medium')}>
                      {d.licenseExpiry} {expired && '(EXPIRED)'}
                    </td>
                    <td>{d.completionRate}%</td>
                    <td>
                      <span className={cn(
                        'font-medium',
                        d.safetyScore >= 90 ? 'text-status-available' : d.safetyScore >= 75 ? 'text-status-on-trip' : 'text-destructive'
                      )}>
                        {d.safetyScore}
                      </span>
                    </td>
                    <td>{d.complaints}</td>
                    <td><StatusBadge status={d.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Truck, AlertTriangle, BarChart3, Package, Plus } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { vehicles, trips, maintenanceLogs, drivers } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const activeFleet = vehicles.filter((v) => v.status !== 'Retired').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
  const utilization = vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100) : 0;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filteredTrips = trips.filter((t) => {
    const v = getVehicle(t.vehicleId);
    const d = getDriver(t.driverId);
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      d?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Fleet" value={activeFleet} icon={<Truck className="h-5 w-5" />} trend="+2 this month" delay={0} />
        <KpiCard title="Maintenance Alerts" value={maintenanceAlerts} icon={<AlertTriangle className="h-5 w-5" />} colorClass="text-status-maintenance" trend="1 critical" delay={100} />
        <KpiCard title="Utilization Rate" value={`${utilization}%`} icon={<BarChart3 className="h-5 w-5" />} colorClass="text-status-available" trend="↑ 5% vs last week" delay={200} />
        <KpiCard title="Pending Cargo" value={pendingTrips} icon={<Package className="h-5 w-5" />} colorClass="text-status-on-trip" trend="Awaiting dispatch" delay={300} />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search trips, vehicles, drivers..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Dispatched', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
        ]}
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/trips')} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Trip
        </Button>
        <Button onClick={() => navigate('/vehicles')} variant="outline" className="border-border hover:bg-secondary">
          <Plus className="h-4 w-4 mr-2" /> New Vehicle
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip, i) => {
                const v = getVehicle(trip.vehicleId);
                const d = getDriver(trip.driverId);
                return (
                  <tr key={trip.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="font-medium text-primary">{trip.id}</td>
                    <td>{v?.model || '—'}</td>
                    <td>{d?.name || '—'}</td>
                    <td className="text-muted-foreground">{trip.origin}</td>
                    <td className="text-muted-foreground">{trip.destination}</td>
                    <td><StatusBadge status={trip.status} /></td>
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No trips found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

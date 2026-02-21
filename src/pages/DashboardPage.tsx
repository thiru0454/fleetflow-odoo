import { useState } from 'react';
import { Truck, AlertTriangle, BarChart3, Package, Plus, Activity } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { vehicles, trips, maintenanceLogs, drivers, expenses } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const navigate = useNavigate();

  const activeFleetCount = vehicles.filter((v) => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
  const onTrip = vehicles.filter((v) => v.status === 'On Trip').length;
  const utilization = vehicles.length ? Math.round((onTrip / vehicles.length) * 100) : 0;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const dispatchedTrips = trips.filter((t) => t.status === 'Dispatched').length;

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filteredTrips = trips
    .filter((t) => {
      const v = getVehicle(t.vehicleId);
      const d = getDriver(t.driverId);
      const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
        v?.model.toLowerCase().includes(search.toLowerCase()) ||
        d?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .slice(0, 8); // Show only 8 recent trips

  return (
    <div className="space-y-6">
      {/* Header with live status */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">Real-time fleet oversight and operational intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-status-available/20 to-status-available/10 border border-status-available/50 rounded-lg hover:border-status-available hover:shadow-lg hover:shadow-status-available/30 transition-all duration-300 group">
          <Activity className="h-4 w-4 text-status-available animate-pulse group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-status-available">System Live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Fleet"
          value={activeFleetCount}
          icon={<Truck className="h-5 w-5" />}
          trend={`${onTrip} on trip`}
          delay={0}
        />
        <KpiCard
          title="Maintenance Alerts"
          value={maintenanceAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          colorClass="text-status-maintenance"
          trend={`${maintenanceAlerts > 0 ? maintenanceAlerts + ' critical' : 'All clear'}`}
          delay={100}
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          colorClass="text-status-available"
          trend={`${onTrip}/${vehicles.length} vehicles in use`}
          delay={200}
        />
        <KpiCard
          title="Pending Dispatch"
          value={pendingTrips}
          icon={<Package className="h-5 w-5" />}
          colorClass="text-status-on-trip"
          trend={`${dispatchedTrips} trips active`}
          delay={300}
        />
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Button
          onClick={() => navigate('/trips')}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> New Trip
        </Button>
        <Button
          onClick={() => navigate('/vehicles')}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Add Vehicle
        </Button>
        <Button
          onClick={() => navigate('/drivers')}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Register Driver
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search trips, vehicles, or drivers..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All', value: 'all' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Dispatched', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
          {
            label: 'Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Truck', value: 'Truck' },
              { label: 'Van', value: 'Van' },
              { label: 'Bike', value: 'Bike' },
            ],
          },
          {
            label: 'Region',
            value: regionFilter,
            onChange: setRegionFilter,
            options: [
              { label: 'All Regions', value: 'all' },
              { label: 'North', value: 'North' },
              { label: 'South', value: 'South' },
              { label: 'East', value: 'East' },
              { label: 'West', value: 'West' },
            ],
          },
        ]}
      />

      {/* Trips Table */}
      <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: '450ms' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map((t, i) => {
                  const vehicle = getVehicle(t.vehicleId);
                  const driver = getDriver(t.driverId);
                  return (
                    <tr
                      key={t.id}
                      className={cn(
                        'opacity-0 animate-fade-in hover:bg-primary/10 hover:scale-y-105 transition-all duration-200 group',
                        t.status === 'Dispatched' && 'border-l-4 border-status-on-trip bg-status-on-trip/5 hover:bg-status-on-trip/15'
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="font-mono font-medium text-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 transition-all">{t.id}</td>
                      <td>
                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                          <span className="font-medium group-hover:text-primary transition-colors">{vehicle?.model || '—'}</span>
                          <StatusBadge status={vehicle?.status || 'Available'} />
                        </div>
                      </td>
                      <td className="font-medium group-hover:text-primary transition-colors">{driver?.name || '—'}</td>
                      <td className="text-sm text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
                        <div className="truncate">{t.origin} → {t.destination}</div>
                      </td>
                      <td className="font-medium group-hover:text-primary transition-colors">{t.cargoWeight}kg</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/trips')}
                          className="text-xs text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No trips found. Create a new trip to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="glass-card p-4 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group" style={{ animationDelay: '500ms' }}>
          <p className="text-muted-foreground mb-2 group-hover:text-primary/80 transition-colors">Fleet Size</p>
          <p className="text-2xl font-bold text-primary group-hover:text-3xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 transition-all">{vehicles.length}</p>
        </div>
        <div className="glass-card p-4 text-center hover:border-status-available/50 hover:shadow-lg hover:shadow-status-available/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group" style={{ animationDelay: '550ms' }}>
          <p className="text-muted-foreground mb-2 group-hover:text-status-available/80 transition-colors">Total Drivers</p>
          <p className="text-2xl font-bold text-status-available group-hover:text-3xl transition-all">{drivers.length}</p>
        </div>
        <div className="glass-card p-4 text-center hover:border-status-on-trip/50 hover:shadow-lg hover:shadow-status-on-trip/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group" style={{ animationDelay: '600ms' }}>
          <p className="text-muted-foreground mb-2 group-hover:text-status-on-trip/80 transition-colors">Total Trips</p>
          <p className="text-2xl font-bold text-status-on-trip group-hover:text-3xl transition-all">{trips.length}</p>
        </div>
        <div className="glass-card p-4 text-center hover:border-status-maintenance/50 hover:shadow-lg hover:shadow-status-maintenance/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group" style={{ animationDelay: '650ms' }}>
          <p className="text-muted-foreground mb-2 group-hover:text-status-maintenance/80 transition-colors">Maintenance Logs</p>
          <p className="text-2xl font-bold text-status-maintenance group-hover:text-3xl transition-all">{maintenanceLogs.length}</p>
        </div>
      </div>
    </div>
  );
}

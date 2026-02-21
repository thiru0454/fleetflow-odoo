import { useState } from 'react';
import { Truck, AlertTriangle, BarChart3, Package, Plus, Activity, Map, DollarSign, Fuel, Receipt } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useAuthStore, useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { vehicles, drivers, trips, maintenanceLogs, expenses } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const navigate = useNavigate();

  // KPI Calculations
  const activeFleetCount = vehicles.filter((v) => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
  const utilization = vehicles.length ? Math.round((activeFleetCount / vehicles.length) * 100) : 0;
  const pendingCargo = trips.filter((t) => t.status === 'Draft').length;
  const activeTripsCount = trips.filter((t) => t.status === 'Dispatched').length;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.fuelExpense + curr.miscExpense, 0);
  const totalLiters = expenses.reduce((acc, curr) => acc + curr.fuelLiters, 0);

  const regionDistribution = vehicles.reduce((acc: Record<string, number>, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1;
    return acc;
  }, {});

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
      const matchType = typeFilter === 'all' || v?.type === typeFilter;
      const matchRegion = regionFilter === 'all' || v?.region === regionFilter;
      return matchSearch && matchStatus && matchType && matchRegion;
    })
    .slice(0, 10); // Show up to 10 recent trips

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setRegionFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header with live status */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1 text-primary/80">Real-time operational intelligence and fleet oversight</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg shadow-inner group">
          <Activity className="h-4 w-4 text-primary animate-pulse group-hover:scale-110" />
          <span className="text-sm font-medium text-primary">Live Store Feed</span>
        </div>
      </div>

      {/* KPI Cards Grid - Interactive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => { clearFilters(); setStatusFilter('Dispatched'); }}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <KpiCard
            title="Active Fleet"
            value={activeFleetCount}
            icon={<Truck className="h-5 w-5" />}
            trend={`${activeFleetCount} vehicles "On Trip"`}
            delay={0}
          />
        </div>
        <div
          onClick={() => { clearFilters(); setSearch('In Shop'); }}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <KpiCard
            title="Maintenance Alerts"
            value={maintenanceAlerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            colorClass="text-status-maintenance"
            trend={`${maintenanceAlerts > 0 ? maintenanceAlerts + ' in shop' : 'All clear'}`}
            delay={100}
          />
        </div>
        <div className="cursor-default">
          <KpiCard
            title="Utilization Rate"
            value={`${utilization}%`}
            icon={<BarChart3 className="h-5 w-5" />}
            colorClass="text-status-available"
            trend={`${activeFleetCount}/${vehicles.length} vehicles assigned`}
            delay={200}
          />
        </div>
        <div
          onClick={() => { clearFilters(); setStatusFilter('Draft'); }}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <KpiCard
            title="Pending Cargo"
            value={pendingCargo}
            icon={<Package className="h-5 w-5" />}
            colorClass="text-status-on-trip"
            trend={`${activeTripsCount} active shipments`}
            delay={300}
          />
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Button
          onClick={() => navigate('/trips')}
          className="bg-primary text-primary-foreground hover:shadow-lg shadow-md transition-all group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> New Trip
        </Button>
        <Button onClick={() => navigate('/vehicles')} variant="outline" className="border-primary/30 hover:border-primary transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Vehicle
        </Button>
        {(statusFilter !== 'all' || typeFilter !== 'all' || regionFilter !== 'all' || search !== '') && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground transition-all"
          >
            Clear Filters
          </Button>
        )}
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
              { label: 'All Status', value: 'all' },
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

      {/* Oversight Grid: Financials & Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '480ms' }}>
        {/* Regional Snapshot */}
        <div className="glass-card p-6 border-l-4 border-l-primary/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Regional Fleet Distribution</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(regionDistribution).map(([region, count]) => (
              <div key={region} className="group cursor-pointer" onClick={() => setRegionFilter(region)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{region} Region</span>
                  <span className="text-sm text-muted-foreground">{count} Vehicles</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:brightness-125"
                    style={{ width: `${(count / vehicles.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="glass-card p-6 border-l-4 border-l-status-on-trip/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-status-on-trip/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-status-on-trip" />
            </div>
            <h3 className="text-lg font-bold">Operational Financial Snapshot</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Fuel className="h-4 w-4" />
                <span className="text-xs uppercase font-semibold">Fuel Consumed</span>
              </div>
              <p className="text-2xl font-bold">{totalLiters.toLocaleString()} L</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Receipt className="h-4 w-4" />
                <span className="text-xs uppercase font-semibold">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Avg. Trip Cost</span>
            <span className="text-lg font-bold text-primary">
              ${trips.length ? Math.round(totalExpenses / trips.length).toLocaleString() : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="glass-card overflow-hidden transition-all duration-300 animate-fade-in" style={{ animationDelay: '550ms' }}>
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/20">
          <h3 className="font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity Log
          </h3>
          <span className="text-xs text-muted-foreground">{filteredTrips.length} active entries</span>
        </div>
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
                    <tr key={t.id} className="opacity-0 animate-fade-in hover:bg-primary/5 transition-all" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="font-mono font-medium text-primary">{t.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vehicle?.model || '—'}</span>
                          <StatusBadge status={vehicle?.status || 'Available'} />
                        </div>
                      </td>
                      <td className="font-medium">{driver?.name || '—'}</td>
                      <td className="text-sm text-muted-foreground">
                        <div className="truncate">{t.origin} → {t.destination}</div>
                      </td>
                      <td className="font-medium">{t.cargoWeight}kg</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="text-xs text-primary">
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                    No matching activity found in current filter view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

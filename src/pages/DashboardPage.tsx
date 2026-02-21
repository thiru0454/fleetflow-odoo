import { useState } from 'react';
<<<<<<< Updated upstream
import { Truck, AlertTriangle, BarChart3, Package, Plus } from 'lucide-react';
=======
import { Truck, AlertTriangle, BarChart3, Package, Plus, Activity, Map, DollarSign, Fuel, Receipt } from 'lucide-react';
>>>>>>> Stashed changes
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { vehicles, trips, maintenanceLogs, drivers, expenses } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const navigate = useNavigate();

  const activeFleetCount = vehicles.filter((v) => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
<<<<<<< Updated upstream
  const utilization = vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100) : 0;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
=======
  const utilization = vehicles.length ? Math.round((activeFleetCount / vehicles.length) * 100) : 0;
  const pendingCargo = trips.filter((t) => t.status === 'Draft').length;
  const activeTripsCount = trips.filter((t) => t.status === 'Dispatched').length;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.fuelExpense + curr.miscExpense, 0);
  const totalLiters = expenses.reduce((acc, curr) => acc + curr.fuelLiters, 0);

  const regionDistribution = vehicles.reduce((acc: Record<string, number>, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1;
    return acc;
  }, {});
>>>>>>> Stashed changes

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

<<<<<<< Updated upstream
  const filteredTrips = trips.filter((t) => {
    const v = getVehicle(t.vehicleId);
    const d = getDriver(t.driverId);
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
      v?.model.toLowerCase().includes(search.toLowerCase()) ||
      d?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });
=======
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
    .slice(0, 8); // Show only 8 recent trips
>>>>>>> Stashed changes

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< Updated upstream
        <KpiCard title="Active Fleet" value={activeFleet} icon={<Truck className="h-5 w-5" />} trend="+2 this month" delay={0} />
        <KpiCard title="Maintenance Alerts" value={maintenanceAlerts} icon={<AlertTriangle className="h-5 w-5" />} colorClass="text-status-maintenance" trend="1 critical" delay={100} />
        <KpiCard title="Utilization Rate" value={`${utilization}%`} icon={<BarChart3 className="h-5 w-5" />} colorClass="text-status-available" trend="↑ 5% vs last week" delay={200} />
        <KpiCard title="Pending Cargo" value={pendingTrips} icon={<Package className="h-5 w-5" />} colorClass="text-status-on-trip" trend="Awaiting dispatch" delay={300} />
=======
        <KpiCard
          title="Active Fleet"
          value={activeFleetCount}
          icon={<Truck className="h-5 w-5" />}
          trend={`${activeFleetCount} vehicles "On Trip"`}
          delay={0}
        />
        <KpiCard
          title="Maintenance Alerts"
          value={maintenanceAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          colorClass="text-status-maintenance"
          trend={`${maintenanceAlerts > 0 ? maintenanceAlerts + ' in shop' : 'All clear'}`}
          delay={100}
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          colorClass="text-status-available"
          trend={`${activeFleetCount}/${vehicles.length} vehicles assigned`}
          delay={200}
        />
        <KpiCard
          title="Pending Cargo"
          value={pendingCargo}
          icon={<Package className="h-5 w-5" />}
          colorClass="text-status-on-trip"
          trend={`${activeTripsCount} active shipments`}
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
              { label: 'All Status', value: 'all' },
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
      {/* Oversight Grid: Financials & Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '480ms' }}>
        {/* Regional Snapshot */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-status-available/10 rounded-lg">
              <Map className="h-5 w-5 text-status-available" />
            </div>
            <h3 className="text-lg font-bold">Regional Fleet Distribution</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(regionDistribution).map(([region, count]) => (
              <div key={region} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{region} Region</span>
                  <span className="text-sm text-muted-foreground">{count} Vehicles</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-status-available rounded-full transition-all duration-1000 group-hover:bg-primary"
                    style={{ width: `${(count / vehicles.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="glass-card p-6">
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
      <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: '550ms' }}>
>>>>>>> Stashed changes
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

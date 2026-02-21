import { useState, useEffect } from 'react';
import { Truck, AlertTriangle, BarChart3, Package, Plus, Activity, Map, DollarSign, Fuel, Receipt, Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useAuthStore, useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { vehicles, drivers, trips, maintenanceLogs, expenses } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [telemetry, setTelemetry] = useState<Record<string, { lat: number, lon: number, speed: number }>>({});
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

  // Live Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newTelemetry: any = {};
      vehicles.forEach(v => {
        if (v.status === 'On Trip') {
          newTelemetry[v.id] = {
            lat: 34 + Math.random() * 5,
            lon: -118 + Math.random() * 5,
            speed: 45 + Math.random() * 25
          };
        }
      });
      setTelemetry(newTelemetry);
    }, 3000);
    return () => clearInterval(interval);
  }, [vehicles]);

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filteredTrips = trips
    .filter((t) => {
      const v = getVehicle(t.vehicleId);
      const d = getDriver(t.driverId);
      const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
        v?.model.toLowerCase().includes(search.toLowerCase()) ||
        d?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all'
        || t.status === statusFilter
        || v?.status === statusFilter;
      const matchType = typeFilter === 'all' || v?.type === typeFilter;
      const matchRegion = regionFilter === 'all' || v?.region === regionFilter;
      return matchSearch && matchStatus && matchType && matchRegion;
    })
    .slice(0, 10);

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setRegionFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Optimization Overlay (Dynamic Side Panel) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-xl border-l border-primary/20 shadow-2xl z-50 transition-transform duration-500 transform p-6 flex flex-col gap-6",
        showOptimizer ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-base">
            <Sparkles className="h-5 w-5 animate-pulse" /> Fleet Optimizer
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowOptimizer(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto">
          {[
            { title: "Route Efficiency", desc: "Vehicle V-002 can save 12L fuel by re-routing through the Southern Toll.", icon: <Zap className="h-4 w-4 text-yellow-500" /> },
            { title: "Region Balance", desc: "High demand detected in North. Re-allocate 2 Vans from South to optimize SLAs.", icon: <Map className="h-4 w-4 text-blue-500" /> },
            { title: "Maintenance Risk", desc: "Volvo FH16 (ABC-1234) shows vibration anomalies. Schedule inspection prior to TR-770.", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> }
          ].map((opt, i) => (
            <Card key={i} className="p-4 border-primary/10 bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                {opt.icon}
                <span className="text-xs font-bold uppercase">{opt.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</p>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="ghost" className="h-6 text-[10px] font-bold gap-1 group-hover:text-primary transition-colors">
                  APPLY FIX <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
          <p className="text-[10px] font-black uppercase text-primary mb-1">Impact Analysis</p>
          <p className="text-2xl font-black text-foreground">+$2.4k <span className="text-xs font-normal text-muted-foreground">/mo potential</span></p>
        </div>
      </div>

      {/* Header with live status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1 text-primary/80 italic font-medium">Global operational oversight & real-time telemetry stream</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowOptimizer(true)}
            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-4 animate-pulse-subtle"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Optimize Fleet
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg shadow-inner">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary tracking-tighter uppercase">Live Network</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Interactive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => { clearFilters(); setStatusFilter('Dispatched'); }}
          className="cursor-pointer transition-transform hover:rotate-1 active:scale-95"
        >
          <KpiCard
            title="Active Fleet"
            value={activeFleetCount}
            icon={<Truck className="h-5 w-5" />}
            trend={`${activeFleetCount} active units`}
            delay={0}
          />
        </div>
        <div
          onClick={() => { clearFilters(); setStatusFilter('In Shop'); }}
          className="cursor-pointer transition-transform hover:-rotate-1 active:scale-95"
        >
          <KpiCard
            title="System Health"
            value={maintenanceAlerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            colorClass="text-status-maintenance"
            trend={`${maintenanceAlerts > 0 ? maintenanceAlerts + ' shop alerts' : 'System nominal'}`}
            delay={100}
          />
        </div>
        <div className="cursor-default">
          <KpiCard
            title="Fleet Load"
            value={`${utilization}%`}
            icon={<BarChart3 className="h-5 w-5" />}
            colorClass="text-status-available"
            trend={`${activeFleetCount}/${vehicles.length} in transit`}
            delay={200}
          />
        </div>
        <div
          onClick={() => { clearFilters(); setStatusFilter('Draft'); }}
          className="cursor-pointer transition-transform hover:rotate-1 active:scale-95"
        >
          <KpiCard
            title="Cargo Queue"
            value={pendingCargo}
            icon={<Package className="h-5 w-5" />}
            colorClass="text-status-on-trip"
            trend={`${activeTripsCount} shipments live`}
            delay={300}
          />
        </div>
      </div>

      {/* Live Telemetry Banner (FUN ELEMENT) */}
      <div className="glass-card p-3 overflow-hidden bg-primary/5 group border border-primary/10 hover:border-primary/20 transition-all">
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
          {vehicles.filter(v => v.status === 'On Trip').map(v => (
            <div key={v.id} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors cursor-crosshair">
              <Zap className="h-3 w-3" /> {v.id}: {telemetry[v.id]?.speed.toFixed(0) || 0} KM/H
              <span className="text-muted-foreground font-normal">LAT: {telemetry[v.id]?.lat.toFixed(4) || '--'} LON: {telemetry[v.id]?.lon.toFixed(4) || '--'}</span>
            </div>
          ))}
          {/* Repeat for continuous marquee */}
          {vehicles.filter(v => v.status === 'On Trip').map(v => (
            <div key={v.id + '_dup'} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/60">
              <Zap className="h-3 w-3" /> {v.id}: {telemetry[v.id]?.speed.toFixed(0) || 0} KM/H
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar with extra polish */}
      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Analyze fleet assets, cargo, or personnel..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Operations', value: 'all' },
              { label: 'Drafting', value: 'Draft' },
              { label: 'In Transit', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
              { label: 'In Shop', value: 'In Shop' },
            ],
          },
          {
            label: 'Asset',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Units', value: 'all' },
              { label: 'Heavy Truck', value: 'Truck' },
              { label: 'Logistics Van', value: 'Van' },
              { label: 'Courier Bike', value: 'Bike' },
            ],
          },
          {
            label: 'Pivot Region',
            value: regionFilter,
            onChange: setRegionFilter,
            options: [
              { label: 'Global', value: 'all' },
              { label: 'North Hub', value: 'North' },
              { label: 'South Hub', value: 'South' },
              { label: 'East Hub', value: 'East' },
              { label: 'West Hub', value: 'West' },
            ],
          },
        ]}
      />

      {/* Oversight Grid: Financials & Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '480ms' }}>
        {/* Regional Snapshot */}
        <div className="glass-card p-6 border-l-4 border-l-primary/50 group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:rotate-12 transition-transform">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Network Distribution</h3>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(regionDistribution).map(([region, count]) => (
              <div key={region} className="group/item cursor-pointer" onClick={() => setRegionFilter(region)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground group-hover/item:text-primary transition-colors">{region} Pivot</span>
                  <span className="text-xs font-black">{count} Units</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 group-hover/item:brightness-150"
                    style={{ width: `${(count / vehicles.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="glass-card p-6 border-l-4 border-l-status-on-trip/50 bg-gradient-to-br from-status-on-trip/5 to-transparent">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-status-on-trip/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-status-on-trip" />
            </div>
            <h3 className="text-lg font-bold">Logistics Financials</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/40 border border-primary/10 hover:border-primary/40 transition-all hover:translate-y-[-2px]">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Fuel className="h-3 w-3" />
                <span className="text-[10px] uppercase font-black tracking-widest">Fuel Burn</span>
              </div>
              <p className="text-2xl font-black">{totalLiters.toLocaleString()} L</p>
            </div>
            <div className="p-4 rounded-xl bg-background/40 border border-primary/10 hover:border-primary/40 transition-all hover:translate-y-[-2px]">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Receipt className="h-3 w-3" />
                <span className="text-[10px] uppercase font-black tracking-widest">Burn Rate</span>
              </div>
              <p className="text-2xl font-black">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-status-on-trip/10 border border-status-on-trip/30 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-status-on-trip">Efficiency Score</span>
            <span className="text-base font-black text-status-on-trip">
              {trips.length > 0 ? (totalExpenses / trips.length / 500).toFixed(2) : 0}x ROI
            </span>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="glass-card overflow-hidden transition-all duration-300 animate-fade-in" style={{ animationDelay: '550ms' }}>
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/20">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-tighter">
            <Activity className="h-4 w-4 text-primary" />
            Live Dispatch Stream
          </h3>
          <span className="text-[10px] font-bold border border-primary/20 text-primary px-2 py-1 rounded-full">{filteredTrips.length} ASSETS LOGGED</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-secondary/10">
                <th className="text-[10px] uppercase font-black">Trip Index</th>
                <th className="text-[10px] uppercase font-black">Asset Config</th>
                <th className="text-[10px] uppercase font-black">Operator</th>
                <th className="text-[10px] uppercase font-black">Vector</th>
                <th className="text-[10px] uppercase font-black">Payload</th>
                <th className="text-[10px] uppercase font-black text-center">Status</th>
                <th className="text-[10px] uppercase font-black text-center">Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map((t, i) => {
                  const vehicle = getVehicle(t.vehicleId);
                  const driver = getDriver(t.driverId);
                  return (
                    <tr key={t.id} className="opacity-0 animate-fade-in hover:bg-primary/5 transition-all group" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="font-mono font-bold text-primary text-xs tracking-tighter">{t.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs uppercase">{vehicle?.model || '—'}</span>
                          <StatusBadge status={vehicle?.status || 'Available'} />
                        </div>
                      </td>
                      <td className="font-bold text-xs">{driver?.name || '—'}</td>
                      <td className="text-[11px] text-muted-foreground">
                        <div className="truncate font-medium">{t.origin} <ArrowRight className="h-2 w-2 inline" /> {t.destination}</div>
                      </td>
                      <td className="font-black text-xs">{t.cargoWeight} KG</td>
                      <td className="text-center"><StatusBadge status={t.status} /></td>
                      <td className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/trips')} className="h-7 w-7 text-primary hover:bg-primary/20 hover:scale-110 transition-all">
                          <Activity className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground italic text-xs uppercase tracking-widest opacity-50">
                    No active telemetry found for current search parameters.
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

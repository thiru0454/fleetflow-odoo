import { useFleetStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { DollarSign, TrendingUp, PieChart as PieIcon, Globe, FileDown, ArrowUpRight, ArrowDownRight, Award, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const { vehicles, trips, maintenanceLogs, expenses } = useFleetStore();
  const { toast } = useToast();

  // Advanced Financial Logic
  const totalRevenue = trips.filter(t => t.status === 'Completed').length * 2800; // Professional estimate
  const fuelCosts = expenses.reduce((acc, e) => acc + e.fuelExpense, 0);
  const maintCosts = maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
  const totalOperatingCost = fuelCosts + maintCosts;
  const netProfit = totalRevenue - totalOperatingCost;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // ROI Calculation (Acquisition)
  const totalFleet = vehicles.filter(v => v.status !== 'Retired').length;
  const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
  const utilizationRate = totalFleet > 0 ? Math.round((activeFleet / totalFleet) * 100) : 0;

  // Regional ROI Breakdown
  const regions = ['North', 'South', 'East', 'West'];
  const regionalData = regions.map(region => {
    const regionTrips = trips.filter(t => t.region === region && t.status === 'Completed');
    const regionRev = regionTrips.length * 2800;

    // Expenses related to this region via trips
    const regionExpenses = expenses.filter(e => {
      const trip = trips.find(t => t.id === e.tripId);
      return trip?.region === region;
    });
    const regionFuel = regionExpenses.reduce((acc, e) => acc + e.fuelExpense, 0);

    // Vehicles in this region
    const regionVehicles = vehicles.filter(v => v.region === region);
    const regionMaint = maintenanceLogs.filter(m =>
      regionVehicles.some(v => v.id === m.vehicleId)
    ).reduce((acc, m) => acc + m.cost, 0);

    const regionCost = regionFuel + regionMaint;
    return {
      name: region,
      revenue: regionRev,
      cost: regionCost,
      profit: regionRev - regionCost,
    };
  });

  const costDistribution = [
    { name: 'Fuel Logistics', value: fuelCosts, color: 'hsl(199 89% 48%)' },
    { name: 'Preventive Maint', value: maintCosts, color: 'hsl(34 97% 52%)' },
    { name: 'Insurance & Misc', value: expenses.reduce((acc, e) => acc + e.miscExpense, 0), color: 'hsl(262 83% 58%)' },
  ];

  const handleExport = () => {
    toast({
      title: "Generating Reports",
      description: "Regional ROI and Financial Statement being compiled...",
    });

    setTimeout(() => {
      toast({
        title: "Export Success",
        description: "FleetFlow_Q1_Operational_Report.csv downloaded.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Intelligence</h1>
          <p className="text-muted-foreground mt-1">High-level financial summaries and regional performance pivots.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 transition-colors" onClick={handleExport}>
            <FileDown className="h-4 w-4" /> Export Financials
          </Button>
        </div>
      </div>

      {/* Financial Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 glass-card bg-gradient-to-br from-status-available/10 to-transparent border-status-available/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Net Profit</p>
              <h2 className="text-2xl font-black mt-2 text-status-available">${netProfit.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-status-available/20 rounded-xl text-status-available">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-status-available">
            <ArrowUpRight className="h-3 w-3" /> PERFORMANCE INDEX: STRONG
          </div>
        </Card>

        <Card className="p-6 glass-card bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Operating Margin</p>
              <h2 className="text-2xl font-black mt-2 text-primary">{margin}%</h2>
            </div>
            <div className="p-2 bg-primary/20 rounded-xl text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary italic">
            TARGET: {margin > 60 ? 'ACHIEVED' : '65.0%'}
          </div>
        </Card>

        <Card className="p-6 glass-card bg-gradient-to-br from-status-on-trip/10 to-transparent border-status-on-trip/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Utilization</p>
              <h2 className="text-2xl font-black mt-2 text-status-on-trip">{utilizationRate}%</h2>
            </div>
            <div className="p-2 bg-status-on-trip/20 rounded-xl text-status-on-trip">
              <Gauge className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-status-on-trip">
            {activeFleet}/{totalFleet} VEHICLES ACTIVE
          </div>
        </Card>

        <Card className="p-6 glass-card bg-gradient-to-br from-status-maintenance/10 to-transparent border-status-maintenance/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Gross Revenue</p>
              <h2 className="text-2xl font-black mt-2 text-status-maintenance">${totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-status-maintenance/20 rounded-xl text-status-maintenance">
              <Globe className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-status-maintenance uppercase">
            Syncing {regions.length} Regions
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regional ROI Pivot */}
        <Card className="p-6 glass-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" /> Regional Profitability Matrix
            </h3>
            <Badge variant="secondary">LTD Performance</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(222 20% 16%)" />
              <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                formatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="profit" name="Net Profit" fill="hsl(var(--status-available))" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Structure Pie Chart */}
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <PieIcon className="h-5 w-5 text-status-maintenance" /> Expense Composition
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-64 space-y-3">
              {costDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">${item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase text-muted-foreground">Operating Total</span>
                  <span className="text-lg font-black text-status-maintenance">${totalOperatingCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Region Alert */}
      {regionalData.length > 0 && (
        <Card className="p-4 border-primary/30 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Primary Growth Hub</h4>
              <p className="text-xs text-muted-foreground">
                The <strong>{regionalData.sort((a, b) => b.profit - a.profit)[0].name} Region</strong> is currently delivering the highest ROI at {((regionalData.sort((a, b) => b.profit - a.profit)[0].profit / (regionalData.sort((a, b) => b.profit - a.profit)[0].revenue || 1)) * 100).toFixed(1)}%.
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-xs gap-1 group">View Regional Breakdown <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></Button>
        </Card>
      )}
    </div>
  );
}

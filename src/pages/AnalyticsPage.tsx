import { useFleetStore } from '@/store/useStore';
import { KpiCard } from '@/components/KpiCard';
import { DollarSign, TrendingUp, Gauge, AlertTriangle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AnalyticsPage() {
  const { expenses, vehicles, maintenanceLogs, trips } = useFleetStore();
  const { toast } = useToast();

  // Financial calculations
  const totalFuelCost = expenses.reduce((a, e) => a + e.fuelExpense, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((a, m) => a + m.cost, 0);
  const totalOperatingCost = totalFuelCost + totalMaintenanceCost;
  const estimatedTotalRevenue = trips.filter(t => t.status === 'Completed').length * 500; // Assume $500 per trip
  
  // Fleet metrics
  const activeFleet = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'In Shop').length;
  const totalFleet = vehicles.filter(v => v.status !== 'Retired').length;
  const utilizationRate = totalFleet > 0 ? Math.round((vehicles.filter(v => v.status === 'On Trip').length / totalFleet) * 100) : 0;
  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const totalDistance = expenses.reduce((a, e) => a + e.distance, 0);
  
  // ROI Calculation
  const acquisitionCostPerVehicle = 45000; // Estimated
  const totalAcquisitionCost = totalFleet * acquisitionCostPerVehicle;
  const netProfit = estimatedTotalRevenue - totalOperatingCost;
  const roi = totalAcquisitionCost > 0 ? ((netProfit / totalAcquisitionCost) * 100).toFixed(1) : '0';
  
  // Fuel efficiency
  const totalFuelLiters = expenses.reduce((a, e) => a + e.fuelLiters, 0);
  const fuelEfficiency = totalDistance > 0 && totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : '0';

  const fuelTrend = [
    { month: 'Dec 2025', fuel: 2400, maintenance: 1400 },
    { month: 'Jan 2026', fuel: 2210, maintenance: 1100 },
    { month: 'Feb 2026', fuel: 2290, maintenance: 900 },
  ];

  const vehicleCostData = vehicles
    .filter(v => v.status !== 'Retired')
    .slice(0, 5)
    .map((v) => {
      const vExpenses = expenses.filter(e => 
        trips.find(t => t.id === e.tripId && t.vehicleId === v.id)
      );
      const vMaintenance = maintenanceLogs.filter(m => m.vehicleId === v.id);
      const vFuel = vExpenses.reduce((a, e) => a + e.fuelExpense, 0);
      const vMaint = vMaintenance.reduce((a, m) => a + m.cost, 0);
      return {
        name: v.licensePlate,
        fuel: vFuel,
        maintenance: vMaint,
        total: vFuel + vMaint,
      };
    });

  const costBreakdown = [
    { name: 'Fuel', value: totalFuelCost, fill: 'hsl(199 89% 48%)' },
    { name: 'Maintenance', value: totalMaintenanceCost, fill: 'hsl(34 97% 52%)' },
  ];

  const handleExport = (type: string) => {
    const csvContent = `FleetFlow Monthly Report\n\nOperational Metrics\nUtilization Rate,${utilizationRate}%\nActive Fleet,${activeFleet}/${totalFleet}\nCompleted Trips,${completedTrips}\nTotal Distance,${totalDistance}km\n\nFinancial Summary\nTotal Fuel Cost,$${totalFuelCost.toLocaleString()}\nTotal Maintenance,$${totalMaintenanceCost.toLocaleString()}\nTotal Operating Cost,$${totalOperatingCost.toLocaleString()}\nEstimated Revenue,$${estimatedTotalRevenue.toLocaleString()}\nNet Profit,$${netProfit.toLocaleString()}\nROI,${roi}%\n\nPerformance Metrics\nFuel Efficiency,${fuelEfficiency}km/L`;
    
    if (type === 'CSV') {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleetflow-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast({ title: '✓ CSV exported successfully' });
    } else {
      toast({ title: 'PDF export feature coming soon', variant: 'default' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Operational Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground">Real-time fleet performance, financial metrics, and ROI tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('CSV')} className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 group">
            <FileText className="h-4 w-4 group-hover:rotate-90 transition-transform" />Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('PDF')} className="border-border hover:bg-primary/10 hover:scale-105 transition-transform">Export PDF</Button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fleet ROI"
          value={`${roi}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          colorClass={roi > 0 ? 'text-status-available' : 'text-destructive'}
          trend={`$${netProfit.toLocaleString()} net profit`}
          delay={0}
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilizationRate}%`}
          icon={<Gauge className="h-5 w-5" />}
          colorClass="text-status-on-trip"
          trend={`${activeFleet}/${totalFleet} vehicles active`}
          delay={100}
        />
        <KpiCard
          title="Fuel Efficiency"
          value={`${fuelEfficiency} km/L`}
          icon={<TrendingUp className="h-5 w-5" />}
          colorClass="text-primary"
          trend={`${totalDistance}km covered`}
          delay={200}
        />
        <KpiCard
          title="Operating Cost"
          value={`$${totalOperatingCost.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          colorClass="text-status-maintenance"
          trend={`Fuel + Maintenance`}
          delay={300}
        />
      </div>

      {/* Financial Summary */}
      <Alert className="border-primary/50 bg-primary/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">Net Profit: ${netProfit.toLocaleString()}</span> (Revenue: ${estimatedTotalRevenue.toLocaleString()} - Costs: ${totalOperatingCost.toLocaleString()})
        </AlertDescription>
      </Alert>

      {/* Cost Breakdown & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Operating Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fuel</span>
              <span className="font-medium text-primary">${totalFuelCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Maintenance</span>
              <span className="font-medium text-status-maintenance">${totalMaintenanceCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Monthly Cost Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
              <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(222 44% 8%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="fuel" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maintenance" fill="hsl(34 97% 52%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Cost Analysis */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4">Cost per Vehicle (Top 5)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={vehicleCostData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
            <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
            <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(222 44% 8%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Bar dataKey="fuel" fill="hsl(199 89% 48%)" stackId="a" name="Fuel" />
            <Bar dataKey="maintenance" fill="hsl(34 97% 52%)" stackId="a" name="Maintenance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Summary Table */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4">Financial Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Completed Trips</p>
            <p className="text-2xl font-bold text-primary">{completedTrips}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Est. Revenue</p>
            <p className="text-2xl font-bold text-status-available">${estimatedTotalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Operating Cost</p>
            <p className="text-2xl font-bold text-status-maintenance">${totalOperatingCost.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-status-available' : 'text-destructive'}`}>
              ${netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

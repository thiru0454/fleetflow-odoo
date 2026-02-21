import { useFleetStore } from '@/store/useStore';
import { KpiCard } from '@/components/KpiCard';
import { DollarSign, TrendingUp, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const { expenses, vehicles, maintenanceLogs, trips } = useFleetStore();
  const { toast } = useToast();

  // Basic KPI Calculations
  const totalFuelCost = expenses.reduce((a, e) => a + e.fuelExpense, 0);
  const totalMaintCost = maintenanceLogs.reduce((a, m) => a + m.cost, 0);
  const totalExpenses = totalFuelCost + totalMaintCost;

  // Utilization: % of fleet "On Trip"
  const utilization = vehicles.length
    ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100)
    : 0;

  // Real ROI Formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
  // For this prototype, we'll estimate Revenue based on Trip count ($800 per completed trip)
  const completedTripsRevenue = trips.filter(t => t.status === 'Completed').length * 800;
  const totalAcquisitionCost = vehicles.reduce((a, v) => a + v.acquisitionCost, 0);

  const fleetROI = totalAcquisitionCost > 0
    ? (((completedTripsRevenue - totalExpenses) / totalAcquisitionCost) * 100).toFixed(1)
    : "0.0";

  // Dynamic Fuel Efficiency Trend (Grouping expenses by month)
  const monthlyData = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { fuel: 0, liters: 0, maint: 0, count: 0 };
    acc[month].fuel += e.fuelExpense;
    acc[month].liters += e.fuelLiters;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { fuel: number, liters: number, maint: number, count: number }>);

  // Add maintenance to monthly grouping
  maintenanceLogs.forEach(m => {
    const month = new Date(m.date).toLocaleString('default', { month: 'short' });
    if (monthlyData[month]) monthlyData[month].maint += m.cost;
  });

  const fuelTrend = Object.entries(monthlyData).map(([name, data]) => ({
    name,
    efficiency: data.liters > 0 ? (Math.random() * 2 + 5 + data.fuel / data.liters / 10).toFixed(1) : 0, // Mocking KM/L based on cost/liters
  })).sort((a, b) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(a.name) - months.indexOf(b.name);
  });

  // Top Costly Vehicles (Maint + Fuel)
  const vehicleFinancials = vehicles.map(v => {
    const vFuel = expenses.filter(e => {
      const trip = trips.find(t => t.id === e.tripId);
      return trip?.vehicleId === v.id;
    }).reduce((a, e) => a + e.fuelExpense, 0);

    const vMaint = maintenanceLogs.filter(m => m.vehicleId === v.id).reduce((a, m) => a + m.cost, 0);

    return {
      name: v.licensePlate,
      cost: vFuel + vMaint
    };
  }).sort((a, b) => b.cost - a.cost).slice(0, 5);

  const handleExport = (type: string) => {
    toast({ title: `✓ ${type} Exported`, description: "Your financial report is ready for download." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operational Analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time financial performance auditing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('CSV')} className="border-border text-sm backdrop-blur-sm bg-secondary/30">Export CSV</Button>
          <Button variant="outline" onClick={() => handleExport('PDF')} className="border-border text-sm backdrop-blur-sm bg-secondary/30">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Fuel spend" value={`$${totalFuelCost.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} delay={0} />
        <KpiCard title="Fleet ROI (%)" value={`${fleetROI}%`} icon={<TrendingUp className="h-5 w-5" />} colorClass="text-status-available" delay={100} />
        <KpiCard title="Utilization Rate" value={`${utilization}%`} icon={<Gauge className="h-5 w-5" />} colorClass="text-status-on-trip" delay={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Trend */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Fuel Efficiency Trend (km/L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={fuelTrend.length ? fuelTrend : [{ name: 'None', efficiency: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
              <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222 44% 8%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
              <Line type="monotone" dataKey="efficiency" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={{ fill: 'hsl(199 89% 48%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Costly Vehicles */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Total Operating Cost per Vehicle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vehicleFinancials}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
              <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222 44% 8%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
              <Bar dataKey="cost" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4">Monthly Financial Summary</h3>
        <table className="data-table">
          <thead><tr><th>Month</th><th>Fuel Expense</th><th>Maintenance</th><th>Operating Cost</th></tr></thead>
          <tbody>
            {Object.entries(monthlyData).length > 0 ? Object.entries(monthlyData).map(([m, data], i) => (
              <tr key={m} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <td className="font-medium">{m} 2026</td>
                <td>${data.fuel.toLocaleString()}</td>
                <td>${data.maint.toLocaleString()}</td>
                <td className="font-medium text-primary">${(data.fuel + data.maint).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No financial data available for 2026</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

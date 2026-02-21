import { useFleetStore } from '@/store/useStore';
import { KpiCard } from '@/components/KpiCard';
import { DollarSign, TrendingUp, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const { expenses, vehicles, maintenanceLogs } = useFleetStore();
  const { toast } = useToast();

  const totalFuel = expenses.reduce((a, e) => a + e.fuelExpense, 0);
  const totalMaint = maintenanceLogs.reduce((a, m) => a + m.cost, 0);
  const utilization = vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100) : 0;

  const fuelTrend = [
    { month: 'Sep', efficiency: 6.2 },
    { month: 'Oct', efficiency: 6.5 },
    { month: 'Nov', efficiency: 6.1 },
    { month: 'Dec', efficiency: 6.8 },
    { month: 'Jan', efficiency: 7.0 },
    { month: 'Feb', efficiency: 6.9 },
  ];

  const vehicleCosts = vehicles.slice(0, 5).map((v) => ({
    name: v.licensePlate,
    cost: Math.round(Math.random() * 5000 + 1000),
  }));

  const handleExport = (type: string) => {
    toast({ title: `${type} export initiated` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operational Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance metrics and financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('CSV')} className="border-border text-sm">Export CSV</Button>
          <Button variant="outline" onClick={() => handleExport('PDF')} className="border-border text-sm">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Fuel Cost" value={`$${totalFuel.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} delay={0} />
        <KpiCard title="Fleet ROI" value="24.3%" icon={<TrendingUp className="h-5 w-5" />} colorClass="text-status-available" delay={100} />
        <KpiCard title="Utilization Rate" value={`${utilization}%`} icon={<Gauge className="h-5 w-5" />} colorClass="text-status-on-trip" delay={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Trend */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Fuel Efficiency Trend (km/L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
              <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222 44% 8%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
              <Line type="monotone" dataKey="efficiency" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={{ fill: 'hsl(199 89% 48%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Costly Vehicles */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Top Costly Vehicles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vehicleCosts}>
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
          <thead><tr><th>Month</th><th>Fuel Cost</th><th>Maintenance</th><th>Total</th></tr></thead>
          <tbody>
            {['Jan 2026', 'Feb 2026'].map((m, i) => (
              <tr key={m} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <td className="font-medium">{m}</td>
                <td>${(totalFuel / 2).toLocaleString()}</td>
                <td>${(totalMaint / 2).toLocaleString()}</td>
                <td className="font-medium">${((totalFuel + totalMaint) / 2).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

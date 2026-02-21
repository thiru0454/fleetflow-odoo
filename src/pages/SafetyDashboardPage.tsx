import { useFleetStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, UserCheck, Calendar, Activity, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { cn } from '@/lib/utils';

export default function SafetyDashboardPage() {
    const { vehicles, trips, incidents, inspections, drivers } = useFleetStore();

    // Safety KPIs
    const avgSafetyScore = Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length);
    const activeAlerts = drivers.filter(d => d.safetyScore < 85 || d.complaints > 2).length;
    const criticalIncidents = incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length;

    const getDaysUntilExpiry = (date: string) => {
        return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    };
    const pendingExpirations = drivers.filter(d => getDaysUntilExpiry(d.licenseExpiry) <= 30).length;

    const severityData = [
        { name: 'Low', value: incidents.filter(i => i.severity === 'Low').length, color: 'hsl(var(--status-available))' },
        { name: 'Medium', value: incidents.filter(i => i.severity === 'Medium').length, color: 'hsl(var(--primary))' },
        { name: 'High', value: incidents.filter(i => i.severity === 'High').length, color: 'hsl(var(--status-maintenance))' },
        { name: 'Critical', value: incidents.filter(i => i.severity === 'Critical').length, color: 'hsl(var(--destructive))' },
    ];

    const safetyDistribution = [
        { range: '90-100%', count: drivers.filter(d => d.safetyScore >= 90).length },
        { range: '80-89%', count: drivers.filter(d => d.safetyScore >= 80 && d.safetyScore < 90).length },
        { range: '70-79%', count: drivers.filter(d => d.safetyScore >= 70 && d.safetyScore < 80).length },
        { range: '<70%', count: drivers.filter(d => d.safetyScore < 70).length },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Safety Command Center</h1>
                    <p className="text-muted-foreground mt-1">High-level safety performance and compliance metrics.</p>
                </div>
            </div>

            {/* Safety KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 glass-card border-l-4 border-l-status-available">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-status-available/10">
                            <ShieldCheck className="h-5 w-5 text-status-available" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Fleet Safety Avg</p>
                            <p className="text-xl font-bold text-status-available">{avgSafetyScore}%</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-destructive">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-destructive/10">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Alerts</p>
                            <p className="text-xl font-bold text-destructive">{activeAlerts}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-status-maintenance">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-status-maintenance/10">
                            <Activity className="h-5 w-5 text-status-maintenance" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">High Severity Incidents</p>
                            <p className="text-xl font-bold text-status-maintenance">{criticalIncidents}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-primary">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">License Expiries (30d)</p>
                            <p className="text-xl font-bold text-primary">{pendingExpirations}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Safety Score Distribution */}
                <Card className="p-6 glass-card">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-primary" /> Safety Score Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={safetyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(222 20% 16%)" />
                            <XAxis dataKey="range" stroke="hsl(215 20% 55%)" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="hsl(215 20% 55%)" fontSize={11} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Incident Severity Breakdown */}
                <Card className="p-6 glass-card">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-status-maintenance" /> Incident Severity Matrix
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 w-full md:w-48">
                            {severityData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Intervention Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 glass-card">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                        <UserCheck className="h-5 w-5 text-status-available" /> Priority Compliance Watch
                    </h3>
                    <div className="space-y-4">
                        {drivers.filter(d => d.safetyScore < 90).slice(0, 4).map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                                        {d.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{d.name}</span>
                                        <span className="text-[10px] text-muted-foreground">Oversight Reason: {d.safetyScore < 85 ? 'Low Safety Score' : 'Safety Dip Detected'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] h-5",
                                        d.safetyScore >= 85 ? "text-primary border-primary/30" : "text-destructive border-destructive/30"
                                    )}>
                                        {d.safetyScore}% SCORE
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Weekly Safety Report</h3>
                        <p className="text-xs text-muted-foreground">Compliance review for the period of Feb 14 - Feb 21.</p>
                    </div>
                    <div className="py-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-status-available" />
                            <span className="text-xs font-medium">100% License Compliance</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-status-available" />
                            <span className="text-xs font-medium">2 New Audits Completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4 text-status-maintenance" />
                            <span className="text-xs font-medium">1 Open High-Severity Case</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                        Safety protocols were maintained. No critical fleet grounds reported today.
                    </p>
                </Card>
            </div>
        </div>
    );
}

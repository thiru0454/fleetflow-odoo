import { useState } from 'react';
import { useFleetStoreEnhanced, MaintenanceLog, Vehicle } from '@/store/useStoreEnhanced';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Wrench, AlertCircle, History, Gauge, DollarSign, Calendar, ArrowUpRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function MaintenanceEnhancedPage() {
    const { maintenanceLogs, vehicles } = useFleetStoreEnhanced();
    const [search, setSearch] = useState('');

    // Safety rule: Flag vehicles > 150,000km
    const highMileageVehicles = vehicles.filter(v => v.odometer > 150000 && v.status !== 'Retired');
    const totalMaintCost = maintenanceLogs.reduce((acc, log) => acc + log.cost, 0);

    const filteredLogs = maintenanceLogs.filter(log => {
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        return (
            log.issue.toLowerCase().includes(search.toLowerCase()) ||
            vehicle?.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
            vehicle?.model.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart Maintenance</h1>
                    <p className="text-muted-foreground mt-1">Predictive monitoring and detailed service history.</p>
                </div>
            </div>

            {/* Safety Alerts Section */}
            {highMileageVehicles.length > 0 && (
                <Card className="p-6 border-status-maintenance/30 bg-status-maintenance/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wrench className="h-24 w-24 text-status-maintenance" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-14 w-14 rounded-full bg-status-maintenance/20 flex items-center justify-center border border-status-maintenance/30 animate-pulse">
                            <AlertCircle className="h-8 w-8 text-status-maintenance" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-bold text-status-maintenance">Predictive Safety Alerts</h2>
                            <p className="text-sm text-status-maintenance/80 mt-1 max-w-2xl">
                                The following {highMileageVehicles.length} vehicles have exceeded 150,000km and require mandatory engine and brake inspections.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {highMileageVehicles.map(v => (
                                    <Badge key={v.id} variant="outline" className="bg-background/50 border-status-maintenance/30 text-status-maintenance px-3 py-1 font-mono">
                                        {v.licensePlate} • {v.odometer.toLocaleString()}km
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Maintenance Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 glass-card border-l-4 border-l-primary flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Life-to-Date Spend</p>
                        <p className="text-xl font-bold">${totalMaintCost.toLocaleString()}</p>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-status-available flex items-center gap-4">
                    <div className="p-3 bg-status-available/10 rounded-xl">
                        <History className="h-5 w-5 text-status-available" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Logs</p>
                        <p className="text-xl font-bold">{maintenanceLogs.length}</p>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-status-maintenance flex items-center gap-4">
                    <div className="p-3 bg-status-maintenance/10 rounded-xl">
                        <Wrench className="h-5 w-5 text-status-maintenance" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Planned Next Week</p>
                        <p className="text-xl font-bold">3</p>
                    </div>
                </Card>
                <Card className="p-4 glass-card border-l-4 border-l-status-on-trip flex items-center gap-4">
                    <div className="p-3 bg-status-on-trip/10 rounded-xl">
                        <Gauge className="h-5 w-5 text-status-on-trip" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Fleet Reliability</p>
                        <p className="text-xl font-bold">94.2%</p>
                    </div>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/10">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-bold">Service Log Repository</h3>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs by plate or issue..."
                            className="pl-10 bg-background/50 h-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="font-semibold text-xs uppercase tracking-wider">Vehicle</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Service Detail</th>
                                <th className="font-semibold text-xs uppercase tracking-wider text-right">Costing</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Date</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, i) => {
                                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id} className="hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{vehicle?.model || "Unassigned"}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase">{vehicle?.licensePlate || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{log.issue}</span>
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                                                    <AlertCircle className="h-2 w-2" /> Routine Lifecycle Maintenance
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-bold text-primary text-sm">${log.cost.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" /> {log.date}
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={log.status} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

import { useState } from 'react';
import { useFleetStoreEnhanced, Driver } from '@/store/useStoreEnhanced';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Award, Search, TrendingUp, TrendingDown, User, AlertTriangle, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DriversEnhancedPage() {
    const { drivers } = useFleetStoreEnhanced();
    const [search, setSearch] = useState('');

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting for leaderboard: Highest safety score first
    const topDrivers = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 3);
    const avgSafetyScore = Math.round(drivers.reduce((acc, d) => acc + d.safetyScore, 0) / drivers.length);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Center</h1>
                    <p className="text-muted-foreground mt-1">Data-driven driver safety monitoring and recognition.</p>
                </div>
            </div>

            {/* Performance Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performers (Leaderboard) */}
                <Card className="lg:col-span-2 p-6 glass-card border-status-available/20 bg-gradient-to-br from-status-available/5 to-transparent">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Award className="h-5 w-5 text-status-available" />
                            Safety Leaderboard
                        </h2>
                        <Badge variant="outline" className="text-status-available border-status-available/30 bg-status-available/10">Top Performer Focus</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topDrivers.map((d, i) => (
                            <div key={d.id} className={cn(
                                "relative p-4 rounded-2xl border bg-background/50 flex flex-col items-center text-center transition-all hover:-translate-y-1",
                                i === 0 ? "border-status-available ring-2 ring-status-available/20 shadow-xl" : "border-border/50"
                            )}>
                                {i === 0 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-status-available text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        Fleet MVP
                                    </div>
                                )}
                                <div className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center mb-3 font-bold text-lg",
                                    i === 0 ? "bg-status-available text-white" : "bg-secondary text-muted-foreground"
                                )}>
                                    {d.name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-sm truncate w-full px-2">{d.name}</h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <Star className="h-3 w-3 text-status-available fill-status-available" />
                                    <span className="text-lg font-black text-status-available">{d.safetyScore}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 text-balance">
                                    {d.completionRate}% Completion Rate
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Aggregate Stats */}
                <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Fleet Health
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Average Safety Score</span>
                                <span className="font-bold text-primary">{avgSafetyScore}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${avgSafetyScore}%` }} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-status-available/10">
                                    <ShieldCheck className="h-4 w-4 text-status-available" />
                                </div>
                                <span className="text-xs font-medium">Safe Drivers</span>
                            </div>
                            <span className="font-bold">{drivers.filter(d => d.safetyScore >= 90).length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                </div>
                                <span className="text-xs font-medium">Risk Alerts</span>
                            </div>
                            <span className="font-bold">{drivers.filter(d => d.safetyScore < 85).length}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Registry / List View */}
            <Card className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/10">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by driver name or license..."
                            className="pl-10 bg-background/50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{filteredDrivers.length} Personnel Listed</Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="font-semibold text-xs uppercase tracking-wider">Driver Info</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Safety Performance</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Operations</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Status</th>
                                <th className="font-semibold text-xs uppercase tracking-wider text-right">License Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((d, i) => (
                                <tr key={d.id} className="hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                                {d.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{d.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase">{d.licenseNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">Score</span>
                                                <span className={cn(
                                                    "font-bold text-sm flex items-center gap-1",
                                                    d.safetyScore >= 90 ? "text-status-available" : d.safetyScore >= 85 ? "text-primary" : "text-destructive"
                                                )}>
                                                    {d.safetyScore}%
                                                    {d.safetyScore >= 90 ? <TrendingUp className="h-3 w-3" /> : d.safetyScore < 85 ? <TrendingDown className="h-3 w-3" /> : null}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Completion</span>
                                            <span className="font-bold text-sm">{d.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={d.status} />
                                    </td>
                                    <td className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-mono">{d.licenseExpiry}</span>
                                            <Badge variant="outline" className="text-[9px] h-4 mt-1 border-border/50">VALID</Badge>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

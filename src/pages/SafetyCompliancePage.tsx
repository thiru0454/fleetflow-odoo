import { useState } from 'react';
import { useFleetStore, Driver } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, AlertTriangle, FileWarning, Search, Calendar, Scale, History, Save, Info, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SafetyCompliancePage() {
    const { drivers, isLicenseExpired, updateDriverPerformance } = useFleetStore();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    // Audit state
    const [auditScore, setAuditScore] = useState(0);
    const [auditComplaints, setAuditComplaints] = useState(0);

    const getDaysUntilExpiry = (date: string) => {
        return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    };

    const expiringLicenses = drivers.filter(d => {
        const days = getDaysUntilExpiry(d.licenseExpiry);
        return days > 0 && days <= 45; // Watchdog window: 45 days
    });

    const highRiskDrivers = drivers.filter(d => d.safetyScore < 85 || d.complaints > 2);

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(search.toLowerCase())
    );

    const handleAuditSubmit = () => {
        if (!selectedDriver) return;
        updateDriverPerformance(selectedDriver.id, {
            safetyScore: auditScore,
            complaints: auditComplaints
        });
        toast({
            title: "Audit Finalized",
            description: `Safety performance for ${selectedDriver.name} has been updated.`,
        });
        setIsAuditing(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Safety & Compliance Sentinel</h1>
                    <p className="text-muted-foreground mt-1">Regulatory oversight, driver audits, and license compliance monitoring.</p>
                </div>
            </div>

            {/* Watchdog Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-destructive/20 bg-destructive/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calendar className="h-20 w-20 text-destructive" />
                    </div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-destructive">
                        <FileWarning className="h-5 w-5" /> License Expiry Watchdog
                    </h3>
                    <div className="space-y-3 relative z-10">
                        {expiringLicenses.length > 0 ? expiringLicenses.map(d => {
                            const days = getDaysUntilExpiry(d.licenseExpiry);
                            return (
                                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-destructive/20">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{d.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">EXP: {d.licenseExpiry}</span>
                                    </div>
                                    <Badge variant={days <= 15 ? "destructive" : "outline"} className={cn(days > 15 && "text-destructive border-destructive/30")}>
                                        {days} Days Remaining
                                    </Badge>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-muted-foreground italic">No license expirations detected in the next 45 days.</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6 border-status-maintenance/20 bg-status-maintenance/5">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-status-maintenance">
                        <ShieldCheck className="h-5 w-5" /> Risk Intervention Queue
                    </h3>
                    <div className="space-y-3">
                        {highRiskDrivers.length > 0 ? highRiskDrivers.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-status-maintenance/20">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">{d.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1.5">Score: {d.safetyScore}%</Badge>
                                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1.5">Complaints: {d.complaints}</Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-status-maintenance hover:bg-status-maintenance/10" onClick={() => {
                                    setSelectedDriver(d);
                                    setAuditScore(d.safetyScore);
                                    setAuditComplaints(d.complaints);
                                    setIsAuditing(true);
                                }}>
                                    <Scale className="h-3.5 w-3.5 mr-1" /> Audit
                                </Button>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground italic">All drivers are currently meeting safety benchmarks.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Driver Compliance Registry */}
            <Card className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/10">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <UserCheck className="h-5 w-5 text-primary" />
                        <h3 className="font-bold">Personnel Compliance Registry</h3>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Audit search by name or CDL..."
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
                                <th className="font-semibold text-xs uppercase tracking-wider">Driver Detail</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">CDL Information</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Compliance Metrics</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Operational Status</th>
                                <th className="font-semibold text-xs uppercase tracking-wider text-right">Administrative</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((d, i) => (
                                <tr key={d.id} className="hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30} ms` }}>
                                    <td className="py-4 font-bold text-sm">{d.name}</td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs uppercase">{d.licenseNumber}</span>
                                            <span className="text-[10px] text-muted-foreground">Expires: {d.licenseExpiry}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase">Safety</span>
                                                <span className={cn("font-bold text-xs", d.safetyScore < 85 ? "text-destructive" : "text-status-available")}>{d.safetyScore}%</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase">Incidents</span>
                                                <span className={cn("font-bold text-xs", d.complaints > 0 ? "text-status-maintenance" : "text-muted-foreground")}>{d.complaints}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={d.status} />
                                    </td>
                                    <td className="text-right">
                                        <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary/10" onClick={() => {
                                            setSelectedDriver(d);
                                            setAuditScore(d.safetyScore);
                                            setAuditComplaints(d.complaints);
                                            setIsAuditing(true);
                                        }}>
                                            <Save className="h-3.5 w-3.5" /> Log Audit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Audit Modal */}
            <Dialog open={isAuditing} onOpenChange={setIsAuditing}>
                <DialogContent className="sm:max-w-md glass-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-primary" />
                            Safety Performance Audit
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary">
                                {selectedDriver?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{selectedDriver?.name}</p>
                                <p className="text-xs text-muted-foreground">CDL: {selectedDriver?.licenseNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <Label className="font-bold">Adjust Safety Score</Label>
                                    <span className={cn("font-black", auditScore >= 90 ? "text-status-available" : "text-destructive")}>{auditScore}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={auditScore}
                                    onChange={e => setAuditScore(Number(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <Label className="font-bold">Audit Incident Complaints</Label>
                                    <span className="font-black text-status-maintenance">{auditComplaints}</span>
                                </div>
                                <input
                                    type="range" min="0" max="10"
                                    value={auditComplaints}
                                    onChange={e => setAuditComplaints(Number(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-status-maintenance"
                                />
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-status-maintenance/5 border border-status-maintenance/20 flex gap-3">
                            <Info className="h-4 w-4 text-status-maintenance flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Audits are logged permanently. High complaint counts or low safety scores will automatically flag this driver in the dispatcher system.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button className="flex-1 shadow-lg shadow-primary/20" onClick={handleAuditSubmit}>Commit Audit Logs</Button>
                        <Button variant="ghost" onClick={() => setIsAuditing(false)}>Dismiss</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={cn("text-sm font-medium", className)}>{children}</label>;
}

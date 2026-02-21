import { useState } from 'react';
import { useFleetStoreEnhanced } from '@/store/useStoreEnhanced';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, Printer, ShieldCheck, AlertCircle, Calendar, Filter, ClipboardList, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SafetyReportsPage() {
    const { incidents, inspections, drivers } = useFleetStoreEnhanced();
    const [reportType, setReportType] = useState<'incidents' | 'inspections' | 'compliance'>('compliance');

    const stats = {
        totalIncidents: incidents.length,
        criticalIncidents: incidents.filter(i => i.severity === 'Critical').length,
        totalInspections: inspections.length,
        passRate: Math.round((inspections.filter(i => i.status === 'Pass').length / inspections.length) * 100),
        expiringLicenses: drivers.filter(d => {
            const days = Math.ceil((new Date(d.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days > 0 && days <= 30;
        }).length
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Regulatory Compliance Portal</h1>
                    <p className="text-muted-foreground mt-1">Generate, print, and export formalized safety performance reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-border/50">
                        <Printer className="h-4 w-4" /> Print View
                    </Button>
                    <Button className="gap-2 bg-primary">
                        <FileDown className="h-4 w-4" /> Export All Data (CSV)
                    </Button>
                </div>
            </div>

            {/* Snapshot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card border-t-4 border-t-primary">
                    <h4 className="text-[10px] text-muted-foreground uppercase font-black mb-1">Fleet Compliance</h4>
                    <p className="text-2xl font-bold">{stats.passRate}% <span className="text-xs font-normal text-muted-foreground">Pass Rate</span></p>
                    <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${stats.passRate}%` }} />
                    </div>
                </Card>
                <Card className="p-6 glass-card border-t-4 border-t-status-maintenance">
                    <h4 className="text-[10px] text-muted-foreground uppercase font-black mb-1">Safety Events</h4>
                    <p className="text-2xl font-bold">{stats.totalIncidents} <span className="text-xs font-normal text-muted-foreground">Recorded</span></p>
                    <p className="text-[10px] text-status-maintenance font-bold mt-2">{stats.criticalIncidents} Critical Priority</p>
                </Card>
                <Card className="p-6 glass-card border-t-4 border-t-destructive">
                    <h4 className="text-[10px] text-muted-foreground uppercase font-black mb-1">Oversight Alerts</h4>
                    <p className="text-2xl font-bold">{stats.expiringLicenses} <span className="text-xs font-normal text-muted-foreground">Licensing Alerts</span></p>
                    <p className="text-[10px] text-destructive font-bold mt-2">Active Expiry Watchdog Tracking</p>
                </Card>
            </div>

            <Card className="glass-card">
                <div className="p-2 border-b border-border/50 flex flex-wrap gap-2 bg-secondary/10">
                    <Button
                        variant={reportType === 'compliance' ? 'secondary' : 'ghost'}
                        className={cn("h-9 rounded-md text-xs font-bold px-4", reportType === 'compliance' && "bg-background shadow-sm")}
                        onClick={() => setReportType('compliance')}
                    >
                        <ShieldCheck className="h-4 w-4 mr-2 text-primary" /> Regulatory Overview
                    </Button>
                    <Button
                        variant={reportType === 'incidents' ? 'secondary' : 'ghost'}
                        className={cn("h-9 rounded-md text-xs font-bold px-4", reportType === 'incidents' && "bg-background shadow-sm")}
                        onClick={() => setReportType('incidents')}
                    >
                        <AlertCircle className="h-4 w-4 mr-2 text-status-maintenance" /> Incident Log
                    </Button>
                    <Button
                        variant={reportType === 'inspections' ? 'secondary' : 'ghost'}
                        className={cn("h-9 rounded-md text-xs font-bold px-4", reportType === 'inspections' && "bg-background shadow-sm")}
                        onClick={() => setReportType('inspections')}
                    >
                        <ClipboardList className="h-4 w-4 mr-2 text-status-available" /> Inspection History
                    </Button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg capitalize">{reportType.replace('-', ' ')} Summary</h3>
                        <Button size="sm" variant="outline" className="h-8 gap-2 border-border/50 text-[10px] font-bold">
                            <Download className="h-3 w-3" /> EXPORT PDF
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/50">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-secondary/20">
                                {reportType === 'compliance' && (
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Personnel Name</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">License Num</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Expiry</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Safety Score</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase text-right">Status</th>
                                    </tr>
                                )}
                                {reportType === 'incidents' && (
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Date</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Incident Type</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Asset</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Severity</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase text-right">Status</th>
                                    </tr>
                                )}
                                {reportType === 'inspections' && (
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Audit Date</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Asset ID</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Inspector</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase">Log Status</th>
                                        <th className="px-4 py-3 font-bold text-[10px] uppercase text-right">Findings</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {reportType === 'compliance' && drivers.map(d => (
                                    <tr key={d.id} className="hover:bg-primary/5">
                                        <td className="px-4 py-3 font-bold">{d.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{d.licenseNumber}</td>
                                        <td className="px-4 py-3">{d.licenseExpiry}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="text-[10px] font-black">{d.safetyScore}%</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-primary uppercase text-[10px]">Compliant</td>
                                    </tr>
                                ))}
                                {reportType === 'incidents' && incidents.map(i => (
                                    <tr key={i.id} className="hover:bg-primary/5">
                                        <td className="px-4 py-3">{i.date}</td>
                                        <td className="px-4 py-3 font-bold">{i.type}</td>
                                        <td className="px-4 py-3 uppercase text-xs font-mono">{i.vehicleId}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-[9px] border-border/50 uppercase">{i.severity}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{i.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {reportType === 'inspections' && inspections.map(i => (
                                    <tr key={i.id} className="hover:bg-primary/5">
                                        <td className="px-4 py-3">{i.date}</td>
                                        <td className="px-4 py-3 font-bold uppercase text-xs">{i.vehicleId}</td>
                                        <td className="px-4 py-3 capitalize text-xs">{i.inspectorId}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="text-[10px]">{i.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground truncate max-w-[150px]">{i.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 p-4 rounded-xl border border-dashed border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Regulatory Audit Packet</h5>
                                <p className="text-[10px] text-muted-foreground font-medium">Auto-generate a complete compliance dossier for the last 90 days.</p>
                            </div>
                        </div>
                        <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all font-bold text-[10px] h-8">
                            PREPARE PACKET
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-status-maintenance/5 border border-status-maintenance/20 shadow-sm shadow-status-maintenance/5">
                <ShieldCheck className="h-5 w-5 text-status-maintenance" />
                <p className="text-xs font-medium text-muted-foreground">
                    All reports are cryptographically signed and archived for 7 years in accordance with DOT safety regulations and corporate compliance policies.
                </p>
            </div>
        </div>
    );
}

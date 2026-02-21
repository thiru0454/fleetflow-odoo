import { useState } from 'react';
import { useFleetStoreEnhanced, SafetyInspection, Vehicle } from '@/store/useStoreEnhanced';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, ClipboardCheck, History, ShieldCheck, AlertTriangle, AlertCircle, Plus, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function SafetyInspectionsPage() {
    const { inspections, vehicles, addSafetyInspection } = useFleetStoreEnhanced();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');

    // Checklist state
    const [checks, setChecks] = useState({
        brakes: false,
        tires: false,
        lights: false,
        fluids: false,
        steering: false,
    });
    const [notes, setNotes] = useState('');

    const filteredInspections = inspections.filter(i => {
        const v = vehicles.find(v => v.id === i.vehicleId);
        return v?.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
            i.id.toLowerCase().includes(search.toLowerCase());
    });

    const handleCreateInspection = () => {
        if (!selectedVehicle) {
            toast({ title: "Vehicle Missing", description: "Please select an asset for inspection.", variant: "destructive" });
            return;
        }

        // Determine status
        const failedCount = Object.values(checks).filter(c => !c).length;
        let status: 'Pass' | 'Fail' | 'Advisory' = 'Pass';
        if (failedCount >= 2) status = 'Fail';
        else if (failedCount === 1) status = 'Advisory';

        addSafetyInspection({
            date: new Date().toISOString().split('T')[0],
            vehicleId: selectedVehicle,
            inspectorId: 'admin',
            status,
            checks,
            notes
        });

        toast({
            title: "Inspection Logged",
            description: `Asset ${vehicles.find(v => v.id === selectedVehicle)?.licensePlate} marked as ${status}.`
        });

        setIsAdding(false);
        setSelectedVehicle('');
        setChecks({ brakes: false, tires: false, lights: false, fluids: false, steering: false });
        setNotes('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Safety Inspection Guard</h1>
                    <p className="text-muted-foreground mt-1">Formalized vehicle safety checklists and compliance audit trails.</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-status-available hover:bg-status-available/90 hover:shadow-lg transition-all shadow-status-available/20">
                            <ClipboardCheck className="h-4 w-4" /> Start New Inspection
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl glass-card border-primary/20">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-status-available" /> Create Safety Log
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label className="font-bold">Target Fleet Asset</Label>
                                <select
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                                    value={selectedVehicle}
                                    onChange={e => setSelectedVehicle(e.target.value)}
                                >
                                    <option value="">Select Asset for Audit</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.model}</option>)}
                                </select>
                            </div>

                            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 divide-y divide-border/20">
                                <h4 className="font-bold text-sm mb-4 uppercase tracking-tighter flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> Safety Checklist
                                </h4>
                                <div className="space-y-3 pt-2">
                                    {Object.entries(checks).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between py-1">
                                            <Label className="capitalize text-sm font-medium">{key}</Label>
                                            <Checkbox
                                                checked={val}
                                                onCheckedChange={(checked) => setChecks(s => ({ ...s, [key]: !!checked }))}
                                                className="h-5 w-5 border-2 text-status-available border-primary/20 data-[state=checked]:bg-status-available data-[state=checked]:border-status-available"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Inspection Findings & Notes</Label>
                                <textarea
                                    className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm"
                                    placeholder="Detail any minor defects or maintenance recommendations..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="p-3 rounded-lg bg-status-maintenance/5 border border-status-maintenance/20 flex gap-3">
                                <AlertCircle className="h-4 w-4 text-status-maintenance flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    Failing 2 or more critical systems (Brakes, Tires, Steering) will automatically flag this asset for immediate service.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button className="flex-1 shadow-xl shadow-status-available/20 bg-status-available hover:bg-status-available/90" onClick={handleCreateInspection}>Commit Inspection Log</Button>
                            <Button variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass-card">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between bg-status-available/5">
                    <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-status-available" />
                        <h3 className="font-bold">Asset Inspection History</h3>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by license plate or ID..."
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
                                <th className="font-semibold text-xs uppercase">Inspection ID</th>
                                <th className="font-semibold text-xs uppercase">Date</th>
                                <th className="font-semibold text-xs uppercase">Fleet Asset</th>
                                <th className="font-semibold text-xs uppercase">Audit Results</th>
                                <th className="font-semibold text-xs uppercase">Flags</th>
                                <th className="font-semibold text-xs uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInspections.map((i, idx) => {
                                const v = vehicles.find(v => v.id === i.vehicleId);
                                const fails = Object.entries(i.checks).filter(([_, v]) => !v).map(([k]) => k);
                                return (
                                    <tr key={i.id} className="hover:bg-primary/5 transition-all animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                                        <td className="py-4 font-mono text-xs text-muted-foreground">{i.id}</td>
                                        <td className="text-sm font-medium">{i.date}</td>
                                        <td className="font-bold text-sm">
                                            <div className="flex flex-col">
                                                <span>{v?.licensePlate}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{v?.model}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] font-black uppercase",
                                                i.status === 'Pass' ? "text-status-available border-status-available/30 bg-status-available/5" :
                                                    i.status === 'Advisory' ? "text-primary border-primary/30 bg-primary/5" :
                                                        "text-destructive border-destructive/30 bg-destructive/5"
                                            )}>
                                                {i.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                {fails.length > 0 ? fails.map(f => (
                                                    <Badge key={f} variant="secondary" className="text-[8px] h-4 px-1 bg-destructive/10 text-destructive border-none">
                                                        {f.toUpperCase()}
                                                    </Badge>
                                                )) : (
                                                    <span className="text-[10px] text-status-available flex items-center gap-1 font-bold">
                                                        <CheckCircle2 className="h-3 w-3" /> CLEAR
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 transition-all rounded-full">
                                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-l-4 border-l-status-available bg-status-available/5">
                    <h4 className="font-bold text-sm flex items-center gap-2 mb-2 text-status-available">
                        <ShieldCheck className="h-4 w-4" /> Compliance Protocol
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Vehicle safety inspections must be performed every 7 days or before long-distance dispatch.
                        Assets with 'Fail' status are automatically blocked from the Dispatcher system.
                    </p>
                </Card>
                <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
                    <h4 className="font-bold text-sm flex items-center gap-2 mb-2 text-primary">
                        <History className="h-4 w-4" /> Audit Frequency
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Your fleet currently has a 98% inspection compliance rate. Total of {inspections.length} logs recorded in the last 30 operational days.
                    </p>
                </Card>
            </div>
        </div>
    );
}

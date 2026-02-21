import { useState } from 'react';
import { useFleetStoreEnhanced, SafetyIncident, IncidentSeverity, IncidentStatus } from '@/store/useStoreEnhanced';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Calendar, MapPin, Truck, User, FileText, Plus, Filter, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function SafetyIncidentsPage() {
    const { incidents, vehicles, drivers, addSafetyIncident, updateSafetyIncident } = useFleetStoreEnhanced();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // New incident form state
    const [newIncident, setNewIncident] = useState<Omit<SafetyIncident, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        vehicleId: '',
        driverId: '',
        type: '',
        severity: 'Medium',
        status: 'Open',
        description: '',
        location: '',
    });

    const filteredIncidents = incidents.filter(i =>
        i.type.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddIncident = () => {
        if (!newIncident.vehicleId || !newIncident.driverId || !newIncident.type) {
            toast({ title: "Incomplete Form", description: "Please provide vehicle, driver and incident type.", variant: "destructive" });
            return;
        }
        addSafetyIncident(newIncident);
        toast({ title: "Incident Logged", description: "The safety incident has been recorded and queued for investigation." });
        setIsAdding(false);
    };

    const getSeverityColor = (severity: IncidentSeverity) => {
        switch (severity) {
            case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'High': return 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20';
            case 'Medium': return 'bg-primary/10 text-primary border-primary/20';
            case 'Low': return 'bg-status-available/10 text-status-available border-status-available/20';
            default: return '';
        }
    };

    const getStatusColor = (status: IncidentStatus) => {
        switch (status) {
            case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Investigating': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Closed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Escalated': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return '';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Incident Investigation</h1>
                    <p className="text-muted-foreground mt-1">Formalized recording and status tracking of fleet safety events.</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" /> Log New Incident
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl glass-card border-primary/20">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" /> Record Safety Incident
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Date of Event</Label>
                                <Input type="date" value={newIncident.date} onChange={e => setNewIncident({ ...newIncident, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Incident Type</Label>
                                <Input placeholder="e.g. Over-speeding, Collision" value={newIncident.type} onChange={e => setNewIncident({ ...newIncident, type: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle</Label>
                                <select
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                                    value={newIncident.vehicleId}
                                    onChange={e => setNewIncident({ ...newIncident, vehicleId: e.target.value })}
                                >
                                    <option value="">Select Asset</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <select
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                                    value={newIncident.driverId}
                                    onChange={e => setNewIncident({ ...newIncident, driverId: e.target.value })}
                                >
                                    <option value="">Select Personnel</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-10" placeholder="Address or Site Coordinates" value={newIncident.location} onChange={e => setNewIncident({ ...newIncident, location: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Incident Severity</Label>
                                <div className="flex gap-2">
                                    {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                                        <Button
                                            key={s}
                                            type="button"
                                            variant={newIncident.severity === s ? 'default' : 'outline'}
                                            className="flex-1 text-xs h-8"
                                            onClick={() => setNewIncident({ ...newIncident, severity: s as IncidentSeverity })}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                                    placeholder="Provide objective details of the event..."
                                    value={newIncident.description}
                                    onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button className="flex-1 shadow-xl shadow-primary/20" onClick={handleAddIncident}>Finalize Log</Button>
                            <Button variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass-card">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between bg-secondary/10">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search incidents type, location or description..."
                            className="pl-10 bg-background/50 h-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border/50">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                </div>

                <div className="divide-y divide-border/50">
                    {filteredIncidents.length > 0 ? filteredIncidents.map((incident, i) => {
                        const vehicle = vehicles.find(v => v.id === incident.vehicleId);
                        const driver = drivers.find(d => d.id === incident.driverId);
                        return (
                            <div key={incident.id} className="p-6 hover:bg-primary/5 transition-all animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span>
                                            <Badge variant="outline" className={cn("text-[9px] uppercase font-black", getSeverityColor(incident.severity))}>
                                                {incident.severity} SEVERITY
                                            </Badge>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", getStatusColor(incident.status))}>
                                                {incident.status}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{incident.type}</h3>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Calendar className="h-3.5 w-3.5" /> {incident.date}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <MapPin className="h-3.5 w-3.5" /> {incident.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                <Truck className="h-3.5 w-3.5 text-primary" /> {vehicle?.licensePlate}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                <User className="h-3.5 w-3.5 text-primary" /> {driver?.name}
                                            </div>
                                        </div>
                                        <p className="text-sm text-balance text-muted-foreground line-clamp-2 italic">
                                            "{incident.description}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full lg:w-auto">
                                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none h-9 border-border/50">Details</Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex-1 lg:flex-none h-9 border-border/50">Change Status</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Update Case Status</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 gap-2 py-4">
                                                    {['Open', 'Investigating', 'Closed', 'Escalated'].map((s) => (
                                                        <Button
                                                            key={s}
                                                            variant={incident.status === s ? 'default' : 'outline'}
                                                            className="text-xs"
                                                            onClick={() => {
                                                                updateSafetyIncident(incident.id, { status: s as IncidentStatus });
                                                                toast({ title: "Status Updated", description: `Incident ${incident.id} is now ${s}.` });
                                                            }}
                                                        >
                                                            {s}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-20 text-center space-y-4">
                            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-muted-foreground font-medium">No safety incidents found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

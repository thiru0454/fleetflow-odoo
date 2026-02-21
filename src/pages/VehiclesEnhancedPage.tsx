import { useState } from 'react';
import { useFleetStore, Vehicle, VehicleStatus } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Search, Filter, Warehouse, Settings2, Power, PowerOff, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function VehiclesEnhancedPage() {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // New vehicle form state
    const [newVehicle, setNewVehicle] = useState({
        licensePlate: '',
        model: '',
        type: 'Truck',
        capacity: 0,
        odometer: 0,
        region: 'North'
    });

    const filteredVehicles = vehicles.filter(v =>
        v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddVehicle = () => {
        if (!newVehicle.licensePlate || !newVehicle.model || newVehicle.capacity <= 0) {
            toast({ title: "Incomplete Form", description: "Please provide all vehicle specifications.", variant: "destructive" });
            return;
        }

        addVehicle({
            ...newVehicle,
            status: 'Available' as VehicleStatus
        });

        toast({ title: "Asset Registered", description: `${newVehicle.model} (${newVehicle.licensePlate}) added to fleet.` });
        setIsAdding(false);
        setNewVehicle({ licensePlate: '', model: '', type: 'Truck', capacity: 0, odometer: 0, region: 'North' });
    };

    const toggleService = (id: string, currentStatus: VehicleStatus) => {
        const newStatus = currentStatus === 'Retired' ? 'Available' : 'Retired';
        updateVehicle(id, { status: newStatus as VehicleStatus });

        toast({
            title: newStatus === 'Retired' ? "Asset Decommissioned" : "Asset Restored",
            description: `Vehicle status updated to ${newStatus}.`,
            variant: newStatus === 'Retired' ? "destructive" : "default"
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicle Registry</h1>
                    <p className="text-muted-foreground mt-1">Manage physical assets, lifecycle, and service availability.</p>
                </div>

                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4 mr-2" /> Register Asset
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md glass-card py-8">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary" />
                                New Asset Registration
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Model</label>
                                    <Input placeholder="e.g. Scania R500" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">License Plate</label>
                                    <Input placeholder="ABC-1234" value={newVehicle.licensePlate} onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        value={newVehicle.type}
                                        onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                    >
                                        <option value="Truck">Heavy Truck</option>
                                        <option value="Van">Small Van</option>
                                        <option value="Bike">Motorcycle</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Load Capacity (kg)</label>
                                    <Input type="number" placeholder="25000" value={newVehicle.capacity || ''} onChange={e => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Operational Region</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    value={newVehicle.region}
                                    onChange={e => setNewVehicle({ ...newVehicle, region: e.target.value })}
                                >
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                </select>
                            </div>
                            <Button onClick={handleAddVehicle} className="w-full mt-4">Confirm Registration</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-secondary/20 border-border/50 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Total Assets</p>
                        <p className="text-2xl font-bold">{vehicles.length}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-secondary/20 border-border/50 flex items-center gap-4">
                    <div className="p-3 bg-status-available/10 rounded-xl">
                        <Warehouse className="h-5 w-5 text-status-available" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Active Ready</p>
                        <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Available').length}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-secondary/20 border-border/50 flex items-center gap-4">
                    <div className="p-3 bg-destructive/10 rounded-xl">
                        <Warehouse className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Retired / Inactive</p>
                        <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Retired').length}</p>
                    </div>
                </Card>
            </div>

            {/* Registry Table */}
            <Card className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/10">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by license plate or model..."
                            className="pl-10 bg-background/50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Filter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Settings2 className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="font-semibold text-xs uppercase tracking-wider">Asset Info</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Capacity</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Odometer</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Region</th>
                                <th className="font-semibold text-xs uppercase tracking-wider">Status</th>
                                <th className="font-semibold text-xs uppercase tracking-wider text-right">Service Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((v, i) => (
                                    <tr key={v.id} className="hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{v.model}</span>
                                                <span className="text-xs text-muted-foreground font-mono uppercase">{v.licensePlate}</span>
                                            </div>
                                        </td>
                                        <td><Badge variant="secondary" className="font-mono">{v.capacity.toLocaleString()} kg</Badge></td>
                                        <td className="text-sm font-medium">{v.odometer.toLocaleString()} km</td>
                                        <td><span className="text-sm">{v.region}</span></td>
                                        <td><StatusBadge status={v.status} /></td>
                                        <td className="text-right">
                                            <Button
                                                variant={v.status === 'Retired' ? "outline" : "ghost"}
                                                size="sm"
                                                onClick={() => toggleService(v.id, v.status)}
                                                className={cn(
                                                    "h-8 gap-2",
                                                    v.status === 'Retired' ? "text-status-available border-status-available/50 hover:bg-status-available/10" : "text-destructive hover:bg-destructive/10"
                                                )}
                                                disabled={v.status === 'On Trip'}
                                            >
                                                {v.status === 'Retired' ? (
                                                    <><Power className="h-3.5 w-3.5" /> Put In Service</>
                                                ) : (
                                                    <><PowerOff className="h-3.5 w-3.5" /> Mark Retired</>
                                                )}
                                            </Button>
                                            {v.status === 'On Trip' && (
                                                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-muted-foreground">
                                                    <Info className="h-2.5 w-2.5" /> Cannot retire while on trip
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                                        No physical assets found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

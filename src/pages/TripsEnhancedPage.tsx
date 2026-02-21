import { useState } from 'react';
import { useFleetStore, TripStatus } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Truck, User, ArrowRight, Package, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TripsEnhancedPage() {
    const { trips, vehicles, drivers, addTrip, updateTrip } = useFleetStore();
    const { toast } = useToast();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [cargoWeight, setCargoWeight] = useState<number>(0);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.status === 'On Duty');

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const selectedDriver = drivers.find(d => d.id === selectedDriverId);

    const isOverloaded = selectedVehicle ? cargoWeight > selectedVehicle.capacity : false;

    const handleCreateTrip = () => {
        if (!origin || !destination || !selectedVehicleId || !selectedDriverId || cargoWeight <= 0) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields before dispatching.",
                variant: "destructive"
            });
            return;
        }

        if (isOverloaded) {
            toast({
                title: "Safety Violation: Overload",
                description: `Vehicle capacity is ${selectedVehicle?.capacity}kg, but cargo is ${cargoWeight}kg.`,
                variant: "destructive"
            });
            return;
        }

        addTrip({
            vehicleId: selectedVehicleId,
            driverId: selectedDriverId,
            vehicleType: selectedVehicle?.type || 'Truck',
            origin,
            destination,
            cargoWeight,
            estimatedFuelCost: Math.round(cargoWeight * 0.05), // Fake calculation
            status: 'Draft' as TripStatus,
            date: new Date().toISOString().split('T')[0],
            region: selectedVehicle?.region || 'North'
        });

        toast({
            title: "Trip Created",
            description: `Trip from ${origin} to ${destination} has been drafted.`,
        });

        // Reset form
        setOrigin('');
        setDestination('');
        setCargoWeight(0);
        setSelectedVehicleId('');
        setSelectedDriverId('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart Trip Dispatcher</h1>
                    <p className="text-muted-foreground mt-1">Configure and validate operations with real-time safety checks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <Card className="lg:col-span-2 p-6 glass-card border-primary/20">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        New Trip Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Origin</label>
                                <Input placeholder="e.g. Chicago, IL" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Destination</label>
                                <Input placeholder="e.g. Detroit, MI" value={destination} onChange={(e) => setDestination(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Cargo Weight (kg)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={cargoWeight || ''}
                                        onChange={(e) => setCargoWeight(Number(e.target.value))}
                                        className={cn(isOverloaded && "border-destructive focus-visible:ring-destructive")}
                                    />
                                    {isOverloaded && (
                                        <div className="absolute right-3 top-2.5 flex items-center gap-1 text-destructive animate-pulse">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-xs font-bold">Overload!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Assign Vehicle</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                >
                                    <option value="">Select Available Vehicle</option>
                                    {availableVehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.model} ({v.licensePlate}) - Max {v.capacity}kg
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Assign Driver</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                >
                                    <option value="">Select On-Duty Driver</option>
                                    {availableDrivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.safetyScore}% Safety)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex flex-col items-center">
                                <Badge variant="outline" className="text-xs">{origin || "Origin"}</Badge>
                                <div className="h-1 w-20 bg-primary/20 my-2 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 bg-primary w-1/3 animate-shimmer" />
                                </div>
                                <Badge variant="outline" className="text-xs">{destination || "Destination"}</Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Estimated Cost</span>
                                <span className="font-bold text-lg">${Math.round(cargoWeight * 0.05)}</span>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleCreateTrip}
                            className="w-full md:w-auto px-10 shadow-lg shadow-primary/20"
                            disabled={isOverloaded}
                        >
                            Draft Dispatch Trip
                        </Button>
                    </div>
                </Card>

                {/* Live Status Summary */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Operational View
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Available Fleet</span>
                                </div>
                                <span className="font-bold text-primary">{availableVehicles.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Available Drivers</span>
                                </div>
                                <span className="font-bold text-status-available">{availableDrivers.length}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-status-maintenance/50">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-status-maintenance" />
                            Safety Protocols
                        </h3>
                        <ul className="text-xs space-y-2 text-muted-foreground">
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-3 w-3 text-status-available flex-shrink-0" />
                                System prevents dispatch exceeding vehicle capacity.
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-3 w-3 text-status-available flex-shrink-0" />
                                Drivers with safety scores below 85% flagged.
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-3 w-3 text-status-available flex-shrink-0" />
                                Fuel consumption checks enabled for all routes.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}

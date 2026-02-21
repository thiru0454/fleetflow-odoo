import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Vehicle, Driver, Trip } from '@/store/useStore';

interface TripFormProps {
    initialData?: Trip;
    vehicles: Vehicle[];
    drivers: Driver[];
    onSave: (data: Omit<Trip, 'id'>) => void;
    onCancel: () => void;
    isLicenseExpired: (date: string) => boolean;
}

export function TripForm({ initialData, vehicles, drivers, onSave, onCancel, isLicenseExpired }: TripFormProps) {
    const [form, setForm] = useState<{
        vehicleId: string;
        driverId: string;
        cargoWeight: number | string;
        origin: string;
        destination: string;
        estimatedFuelCost: number | string;
    }>({
        vehicleId: initialData?.vehicleId || '',
        driverId: initialData?.driverId || '',
        cargoWeight: initialData?.cargoWeight ?? '',
        origin: initialData?.origin || '',
        destination: initialData?.destination || '',
        estimatedFuelCost: initialData?.estimatedFuelCost ?? '',
    });

    const [cargoError, setCargoError] = useState('');
    const [licenseError, setLicenseError] = useState('');

    const availableVehicles = vehicles.filter((v) => v.status === 'Available');
    const availableDrivers = drivers.filter((d) => d.status === 'On Duty' && !isLicenseExpired(d.licenseExpiry));

    const handleCargoChange = (val: string) => {
        setForm({ ...form, cargoWeight: val });
        const numVal = Number(val);
        const vehicle = vehicles.find((v) => v.id === form.vehicleId);
        if (vehicle && !isNaN(numVal) && numVal > vehicle.capacity) {
            setCargoError(`Cargo exceeds capacity: ${vehicle.capacity}kg max`);
        } else {
            setCargoError('');
        }
    };

    const handleVehicleChange = (vid: string) => {
        setForm({ ...form, vehicleId: vid });
        const vehicle = vehicles.find((v) => v.id === vid);
        const cargoNum = Number(form.cargoWeight);
        if (vehicle && !isNaN(cargoNum) && cargoNum > vehicle.capacity) {
            setCargoError(`Cargo exceeds capacity: ${vehicle.capacity}kg max`);
        } else {
            setCargoError('');
        }
    };

    const handleDriverChange = (did: string) => {
        setForm({ ...form, driverId: did });
        const driver = drivers.find((d) => d.id === did);
        if (driver && isLicenseExpired(driver.licenseExpiry)) {
            setLicenseError(`License expired on ${driver.licenseExpiry}`);
        } else {
            setLicenseError('');
        }
    };

    const handleSave = () => {
        if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
            return;
        }
        if (cargoError || licenseError) return;

        const vehicle = vehicles.find((v) => v.id === form.vehicleId);
        onSave({
            ...form,
            cargoWeight: Number(form.cargoWeight) || 0,
            estimatedFuelCost: Number(form.estimatedFuelCost) || 0,
            vehicleType: vehicle?.type || '',
            status: initialData?.status || 'Draft',
            date: initialData?.date || new Date().toISOString().split('T')[0],
        });
    };

    return (
        <div className="space-y-4">
            {cargoError && (
                <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">{cargoError}</AlertDescription>
                </Alert>
            )}
            {licenseError && (
                <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">{licenseError}</AlertDescription>
                </Alert>
            )}
            <div>
                <Label>Vehicle (Available) *</Label>
                <Select value={form.vehicleId} onValueChange={handleVehicleChange}>
                    <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        {availableVehicles.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No available vehicles</div>
                        ) : (
                            availableVehicles.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                    {v.model} — {v.licensePlate} (Capacity: {v.capacity}kg)
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Driver (On Duty & Valid License) *</Label>
                <Select value={form.driverId} onValueChange={handleDriverChange}>
                    <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select driver" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        {availableDrivers.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No drivers available with valid license</div>
                        ) : (
                            availableDrivers.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                    {d.name} (Safety: {d.safetyScore}%)
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Cargo Weight (kg) *</Label>
                <Input
                    type="number"
                    value={form.cargoWeight}
                    onChange={(e) => handleCargoChange(e.target.value)}
                    className={`mt-1.5 bg-secondary border-border ${cargoError ? 'border-destructive' : ''}`}
                    placeholder="0"
                />
                {form.vehicleId && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Max capacity: {vehicles.find(v => v.id === form.vehicleId)?.capacity || '—'}kg
                    </p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Origin Address *</Label>
                    <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="City, State" />
                </div>
                <div>
                    <Label>Destination Address *</Label>
                    <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="City, State" />
                </div>
            </div>
            <div>
                <Label>Estimated Fuel Cost ($)</Label>
                <Input type="number" value={form.estimatedFuelCost} onChange={(e) => setForm({ ...form, estimatedFuelCost: e.target.value })} className="mt-1.5 bg-secondary border-border" placeholder="0" />
            </div>
            <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                    <CheckCircle className="h-4 w-4 mr-2" />{initialData ? 'Save Changes' : 'Confirm & Create Trip'}
                </Button>
                <Button variant="outline" onClick={onCancel} className="border-border hover:bg-secondary">Cancel</Button>
            </div>
        </div>
    );
}

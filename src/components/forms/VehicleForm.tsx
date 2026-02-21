import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleStatus, Vehicle } from '@/store/useStore';

const statuses: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];

interface VehicleFormProps {
    initialData?: Vehicle;
    onSave: (data: Omit<Vehicle, 'id'>) => void;
    onCancel: () => void;
    isUniquePlate: (plate: string) => boolean;
}

export function VehicleForm({ initialData, onSave, onCancel, isUniquePlate }: VehicleFormProps) {
    const [form, setForm] = useState<{
        licensePlate: string;
        model: string;
        type: string;
        capacity: number | string;
        odometer: number | string;
        status: VehicleStatus;
    }>({
        licensePlate: initialData?.licensePlate || '',
        model: initialData?.model || '',
        type: initialData?.type || '',
        capacity: initialData?.capacity ?? '',
        odometer: initialData?.odometer ?? '',
        status: initialData?.status || 'Available' as VehicleStatus,
    });

    const [error, setError] = useState('');

    const handleSave = () => {
        if (!form.licensePlate || !form.model) {
            setError('Please fill required fields');
            return;
        }
        if (!initialData && !isUniquePlate(form.licensePlate)) {
            setError('License plate must be unique');
            return;
        }
        onSave({
            ...form,
            capacity: Number(form.capacity) || 0,
            odometer: Number(form.odometer) || 0,
        });
    };

    return (
        <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
                <Label>License Plate</Label>
                <Input
                    value={form.licensePlate}
                    onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                    className="mt-1.5 bg-secondary border-border"
                    disabled={!!initialData}
                />
            </div>
            <div>
                <Label>Model</Label>
                <Input
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="mt-1.5 bg-secondary border-border"
                />
            </div>
            <div>
                <Label>Type</Label>
                <Input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Heavy Truck, Van, etc."
                    className="mt-1.5 bg-secondary border-border"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Max Payload (kg)</Label>
                    <Input
                        type="number"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        className="mt-1.5 bg-secondary border-border"
                    />
                </div>
                <div>
                    <Label>Initial Odometer</Label>
                    <Input
                        type="number"
                        value={form.odometer}
                        onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                        className="mt-1.5 bg-secondary border-border"
                    />
                </div>
            </div>
            {initialData && (
                <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                        <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300">
                    {initialData ? 'Update' : 'Create'} Vehicle
                </Button>
                <Button variant="outline" onClick={onCancel} className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all">Cancel</Button>
            </div>
        </div>
    );
}

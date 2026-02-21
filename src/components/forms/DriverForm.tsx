import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Driver, DriverStatus } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface DriverFormProps {
    initialData?: Driver;
    onSave: (data: Omit<Driver, 'id'>) => void;
    onCancel: () => void;
    isUniqueLicense: (license: string) => boolean;
}

export function DriverForm({ initialData, onSave, onCancel, isUniqueLicense }: DriverFormProps) {
    const [form, setForm] = useState({
        name: initialData?.name || '',
        licenseNumber: initialData?.licenseNumber || '',
        licenseExpiry: initialData?.licenseExpiry || new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
        completionRate: initialData?.completionRate ?? 100,
        safetyScore: initialData?.safetyScore ?? 100,
        complaints: initialData?.complaints ?? 0,
        status: initialData?.status || 'On Duty' as DriverStatus,
    });

    const [error, setError] = useState('');

    const handleSave = () => {
        if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
            setError('Please fill all required fields');
            return;
        }
        if (!initialData && !isUniqueLicense(form.licenseNumber)) {
            setError('License number must be unique');
            return;
        }
        onSave(form);
    };

    return (
        <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
                <Label>Full Name *</Label>
                <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 bg-secondary border-border"
                    placeholder="John Smith"
                />
            </div>
            <div>
                <Label>License Number *</Label>
                <Input
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="mt-1.5 bg-secondary border-border font-mono"
                    placeholder="CDL-88421"
                    disabled={!!initialData}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>License Expiry *</Label>
                    <Input
                        type="date"
                        value={form.licenseExpiry}
                        onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                        className="mt-1.5 bg-secondary border-border"
                    />
                </div>
                <div>
                    <Label>Status *</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}>
                        <SelectTrigger className="mt-1.5 bg-secondary border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="On Duty">On Duty</SelectItem>
                            <SelectItem value="Off Duty">Off Duty</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {initialData && (
                <div className="space-y-3 pt-2 border-t border-border mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance Metrics (Auto-managed)</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Completion</p>
                            <p className="text-sm font-bold text-primary">{form.completionRate}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Safety</p>
                            <p className={cn(
                                "text-sm font-bold",
                                form.safetyScore >= 90 ? "text-status-available" : "text-status-on-trip"
                            )}>{form.safetyScore}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Complaints</p>
                            <p className="text-sm font-bold text-destructive">{form.complaints}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                    {initialData ? 'Save Changes' : 'Add Driver'}
                </Button>
                <Button variant="outline" onClick={onCancel} className="border-border hover:bg-secondary">Cancel</Button>
            </div>
        </div>
    );
}

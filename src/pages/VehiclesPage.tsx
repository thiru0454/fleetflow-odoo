import { useState } from 'react';
import { Plus, Pencil, Trash2, HeartPulse, ShieldAlert, MapPin, Gauge, Truck } from 'lucide-react';
import { useFleetStore, Vehicle, VehicleStatus } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statuses: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];
const types = ['Truck', 'Van', 'Bike', 'Reefer'];
const regions = ['North', 'South', 'East', 'West'];

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    licensePlate: '', model: '', type: 'Truck', capacity: '' as string | number, odometer: '' as string | number, status: 'Available' as VehicleStatus, acquisitionCost: '' as string | number, region: 'North'
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ licensePlate: '', model: '', type: 'Truck', capacity: '', odometer: '', status: 'Available', acquisitionCost: '', region: 'North' });
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      licensePlate: v.licensePlate,
      model: v.model,
      type: v.type,
      capacity: v.capacity,
      odometer: v.odometer,
      status: v.status,
      acquisitionCost: v.acquisitionCost || 0,
      region: v.region
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.licensePlate || !form.model) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    const data = {
      ...form,
      capacity: Number(form.capacity) || 0,
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost) || 0
    };

    if (editing) {
      updateVehicle(editing.id, data);
      toast({ title: '✓ Asset logic re-synced', description: `${form.licensePlate} updated.` });
    } else {
      if (vehicles.some((v) => v.licensePlate === form.licensePlate)) {
        toast({ title: 'License plate must be unique', variant: 'destructive' });
        return;
      }
      addVehicle(data);
      toast({ title: '✓ New Asset Registered', description: `${form.licensePlate} added to fleet.` });
    }
    setModalOpen(false);
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch = !search || v.licensePlate.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchType = typeFilter === 'all' || v.type === typeFilter;
    const matchRegion = regionFilter === 'all' || v.region === regionFilter;
    return matchSearch && matchStatus && matchType && matchRegion;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">Active Asset Registry</h2>
          <p className="text-sm text-muted-foreground mt-1">Lifecycle management and health monitoring for {vehicles.length} fleet units</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:shadow-xl hover:scale-105 transition-all group px-6">
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" /> Register Asset
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Analyze asset IDs, plates, or model specs..."
        filters={[
          {
            label: 'Status', value: statusFilter, onChange: setStatusFilter,
            options: [{ label: 'All Status', value: 'all' }, ...statuses.map((s) => ({ label: s, value: s }))],
          },
          {
            label: 'Type', value: typeFilter, onChange: setTypeFilter,
            options: [{ label: 'All Types', value: 'all' }, ...types.map(t => ({ label: t, value: t }))],
          },
          {
            label: 'Region', value: regionFilter, onChange: setRegionFilter,
            options: [{ label: 'All Regions', value: 'all' }, ...regions.map(r => ({ label: r, value: r }))],
          }
        ]}
      />

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((v, i) => {
          const health = 100 - (v.odometer / 500000 * 100);
          const isServiceNeeded = v.odometer > 0 && v.odometer % 10000 > 9000;

          return (
            <Card key={v.id} className="p-4 glass-card hover:border-primary/40 transition-all group animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-inner",
                    v.status === 'On Trip' ? "bg-status-on-trip/10 text-status-on-trip" :
                      v.status === 'In Shop' ? "bg-status-maintenance/10 text-status-maintenance" :
                        "bg-status-available/10 text-status-available"
                  )}>
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg uppercase tracking-tight">{v.model}</h4>
                      <Badge variant="outline" className="font-mono text-[10px] tracking-widest bg-secondary/50">{v.licensePlate}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.region} Hub</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {v.odometer.toLocaleString()} KM</span>
                      <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-tighter h-4">{v.type}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 lg:ml-auto">
                  {/* Asset Health Indicator */}
                  <div className="w-full md:w-32 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Asset Health</span>
                      <span className={cn(health < 30 ? "text-destructive" : "text-primary")}>{health.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", health < 30 ? "bg-destructive" : "bg-primary")} style={{ width: `${health}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Status</p>
                      <StatusBadge status={v.status} />
                    </div>
                    {isServiceNeeded && (
                      <div className="animate-pulse bg-status-maintenance/20 text-status-maintenance p-2 rounded-xl flex items-center gap-2 px-3 border border-status-maintenance/30">
                        <HeartPulse className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Service Due</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="h-9 w-9 text-primary hover:bg-primary/20">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteVehicle(v.id)} className="h-9 w-9 text-destructive hover:bg-destructive/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-20 text-center glass-card border-dashed">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">No operational assets found in current grid view</p>
          </div>
        )}
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Update Asset Specs' : 'Register New Fleet Unit'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">License Plate</Label>
              <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })} className="mt-1 font-mono uppercase" placeholder="ABC-1234" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Model Specification</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="mt-1" placeholder="Volvo FH16" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Asset Category</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Region Deployment</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Max Payload (KG)</Label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Odometer (KM)</Label>
              <Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="mt-1" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Acquisition Cost ($)</Label>
              <Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Operational Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 font-black uppercase tracking-tighter">
              {editing ? 'Update Registry' : 'Initialize Asset'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

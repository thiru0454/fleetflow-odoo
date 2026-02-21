import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFleetStore } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { ModalForm } from '@/components/ModalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ExpensesPage() {
  const { expenses, trips, drivers, maintenanceLogs, addExpense } = useFleetStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ tripId: '', driverId: '', fuelCost: 0, fuelLiters: 0, miscExpense: 0, date: '' });

  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const totalMaintenanceCost = maintenanceLogs.reduce((a, m) => a + m.cost, 0);

  const handleSave = () => {
    if (!form.tripId || !form.driverId) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addExpense({
      tripId: form.tripId,
      driverId: form.driverId,
      distance: 0,
      fuelExpense: form.fuelCost,
      fuelLiters: form.fuelLiters,
      miscExpense: form.miscExpense,
      date: form.date || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    toast({ title: 'Expense logged' });
    setModalOpen(false);
  };

  const filtered = expenses.filter((e) => {
    return !search || e.tripId.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Trip & Expense</h2>
          <p className="text-sm text-muted-foreground">Financial tracking and fuel logging</p>
        </div>
        <Button onClick={() => { setForm({ tripId: '', driverId: '', fuelCost: 0, fuelLiters: 0, miscExpense: 0, date: new Date().toISOString().split('T')[0] }); setModalOpen(true); }} className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Add Expense
        </Button>
      </div>

      <FilterBar searchValue={search} onSearch={setSearch} searchPlaceholder="Search by trip ID..." />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th className="align-left">Trip ID</th><th className="align-left">Driver</th><th className="align-right">Distance</th><th className="align-right">Fuel Expense</th><th className="align-right">Misc Expense</th><th className="align-right">Total Op. Cost</th><th className="align-center">Status</th></tr></thead>
            <tbody>
              {filtered.map((e, i) => {
                const totalOp = e.fuelExpense + e.miscExpense;
                return (
                  <tr key={e.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="align-left font-medium text-primary">{e.tripId}</td>
                    <td className="align-left">{getDriver(e.driverId)?.name || '—'}</td>
                    <td className="align-right">{e.distance} km</td>
                    <td className="align-right">${e.fuelExpense.toLocaleString()}</td>
                    <td className="align-right">${e.miscExpense.toLocaleString()}</td>
                    <td className="align-right font-medium">${totalOp.toLocaleString()}</td>
                    <td className="align-center"><StatusBadge status={e.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">Total Maintenance Cost: <span className="text-foreground font-semibold">${totalMaintenanceCost.toLocaleString()}</span></p>
      </div>

      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <div className="space-y-4">
          <div>
            <Label>Trip ID</Label>
            <Select value={form.tripId} onValueChange={(v) => setForm({ ...form, tripId: v })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select trip" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.id} — {t.origin} → {t.destination}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Driver</Label>
            <Select value={form.driverId} onValueChange={(v) => setForm({ ...form, driverId: v })}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fuel Cost ($)</Label>
              <Input type="number" value={form.fuelCost} onChange={(e) => setForm({ ...form, fuelCost: Number(e.target.value) })} className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>Fuel Liters</Label>
              <Input type="number" value={form.fuelLiters} onChange={(e) => setForm({ ...form, fuelLiters: Number(e.target.value) })} className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Misc Expense ($)</Label>
              <Input type="number" value={form.miscExpense} onChange={(e) => setForm({ ...form, miscExpense: Number(e.target.value) })} className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Log Expense</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancel</Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

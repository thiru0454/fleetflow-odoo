import { useState } from 'react';
import { Truck, AlertTriangle, BarChart3, Package, Plus, Activity, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModalForm } from '@/components/ModalForm';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { DriverForm } from '@/components/forms/DriverForm';
import { TripForm } from '@/components/forms/TripForm';

export default function DashboardPage() {
  const {
    vehicles, trips, maintenanceLogs, drivers,
    addTrip, updateTrip, deleteTrip,
    addVehicle, updateVehicle, deleteVehicle,
    addDriver, updateDriver, deleteDriver,
    isLicenseExpired
  } = useFleetStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tripModal, setTripModal] = useState(false);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [driverModal, setDriverModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeFleet = vehicles.filter((v) => v.status !== 'Retired').length;
  const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
  const onTrip = vehicles.filter((v) => v.status === 'On Trip').length;
  const utilization = vehicles.length ? Math.round((onTrip / vehicles.length) * 100) : 0;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const dispatchedTrips = trips.filter((t) => t.status === 'Dispatched').length;

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getDriver = (id: string) => drivers.find((d) => d.id === id);

  const filteredTrips = trips
    .filter((t) => {
      const v = getVehicle(t.vehicleId);
      const d = getDriver(t.driverId);
      const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
        v?.model.toLowerCase().includes(search.toLowerCase()) ||
        d?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .slice(0, 8); // Show only 8 recent trips

  return (
    <div className="space-y-6">
      {/* Header with live status */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">Real-time fleet oversight and operational intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-status-available/20 to-status-available/10 border border-status-available/50 rounded-lg hover:border-status-available hover:shadow-lg hover:shadow-status-available/30 transition-all duration-300 group">
          <Activity className="h-4 w-4 text-status-available animate-pulse group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-status-available">System Live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Fleet"
          value={activeFleet}
          icon={<Truck className="h-5 w-5" />}
          trend={`${onTrip} on trip`}
          delay={0}
        />
        <KpiCard
          title="Maintenance Alerts"
          value={maintenanceAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          colorClass="text-status-maintenance"
          trend={`${maintenanceAlerts > 0 ? maintenanceAlerts + ' critical' : 'All clear'}`}
          delay={100}
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          colorClass="text-status-available"
          trend={`${onTrip}/${vehicles.length} vehicles in use`}
          delay={200}
        />
        <KpiCard
          title="Pending Dispatch"
          value={pendingTrips}
          icon={<Package className="h-5 w-5" />}
          colorClass="text-status-on-trip"
          trend={`${dispatchedTrips} trips active`}
          delay={300}
        />
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Button
          onClick={() => setTripModal(true)}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:scale-105 shadow-md transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> New Trip
        </Button>
        <Button
          onClick={() => setVehicleModal(true)}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Add Vehicle
        </Button>
        <Button
          onClick={() => setDriverModal(true)}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Register Driver
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search trips, vehicles, or drivers..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Dispatched', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
        ]}
      />

      {/* Dashboard Lists Tabs */}
      <Tabs defaultValue="trips" className="animate-fade-in" style={{ animationDelay: '450ms' }}>
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="vehicles">Fleet</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-4">
          <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="align-left">Trip ID</th>
                    <th className="align-left">Vehicle</th>
                    <th className="align-left">Driver</th>
                    <th className="align-left">Route</th>
                    <th className="align-right">Cargo</th>
                    <th className="align-center">Status</th>
                    <th className="align-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((t, i) => {
                      const vehicle = getVehicle(t.vehicleId);
                      const driver = getDriver(t.driverId);
                      return (
                        <tr
                          key={t.id}
                          className={cn(
                            'opacity-0 animate-fade-in hover:bg-primary/10 transition-all duration-200 group',
                            t.status === 'Dispatched' && 'border-l-4 border-status-on-trip bg-status-on-trip/5 hover:bg-status-on-trip/15'
                          )}
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <td className="align-left font-mono font-medium text-primary">{t.id}</td>
                          <td className="align-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{vehicle?.model || '—'}</span>
                              <StatusBadge status={vehicle?.status || 'Available'} />
                            </div>
                          </td>
                          <td className="align-left font-medium">{driver?.name || '—'}</td>
                          <td className="align-left text-sm text-muted-foreground truncate max-w-[200px]">
                            {t.origin} → {t.destination}
                          </td>
                          <td className="align-right font-medium">{t.cargoWeight}kg</td>
                          <td className="align-center"><StatusBadge status={t.status} /></td>
                          <td className="align-center">
                            <div className="cell-actions">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTrip(t);
                                  setTripModal(true);
                                }}
                                className="h-8 w-8 text-primary hover:bg-primary/20"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (window.confirm('Delete this trip?')) {
                                    deleteTrip(t.id);
                                    toast({ title: 'Trip deleted' });
                                  }
                                }}
                                className="h-8 w-8 text-destructive hover:bg-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No trips found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-4">
          <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="align-left">License Plate</th>
                    <th className="align-left">Model</th>
                    <th className="align-left">Type</th>
                    <th className="align-right">Capacity</th>
                    <th className="align-right">Odometer</th>
                    <th className="align-center">Status</th>
                    <th className="align-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllVehicles ? vehicles : vehicles.slice(0, 8)).map((v, i) => (
                    <tr key={v.id} className="animate-fade-in hover:bg-primary/10 transition-all" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="font-mono font-medium">{v.licensePlate}</td>
                      <td className="font-medium">{v.model}</td>
                      <td className="text-sm">{v.type}</td>
                      <td className="align-right">{v.capacity}kg</td>
                      <td className="align-right font-mono text-sm">{v.odometer.toLocaleString()} km</td>
                      <td className="align-center"><StatusBadge status={v.status} /></td>
                      <td className="align-center">
                        <div className="cell-actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingVehicle(v);
                              setVehicleModal(true);
                            }}
                            className="h-8 w-8 text-primary hover:bg-primary/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Delete this vehicle?')) {
                                deleteVehicle(v.id);
                                toast({ title: 'Vehicle deleted' });
                              }
                            }}
                            className="h-8 w-8 text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border bg-secondary/20 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllVehicles(!showAllVehicles)}
                className="text-xs text-primary hover:bg-primary/10 transition-all flex items-center mx-auto"
              >
                {showAllVehicles ? (
                  <>Show Less Vehicles <ChevronUp className="h-3.5 w-3.5 ml-1" /></>
                ) : (
                  <>View All Vehicles <ChevronDown className="h-3.5 w-3.5 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <div className="glass-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="align-left">Driver Name</th>
                    <th className="align-left">License</th>
                    <th className="align-right">Safety Score</th>
                    <th className="align-right">Completion</th>
                    <th className="align-center">Status</th>
                    <th className="align-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllDrivers ? drivers : drivers.slice(0, 8)).map((d, i) => (
                    <tr key={d.id} className="animate-fade-in hover:bg-primary/10 transition-all" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="font-medium">{d.name}</td>
                      <td className="font-mono text-xs">{d.licenseNumber}</td>
                      <td className="align-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-status-available" style={{ width: `${d.safetyScore}%` }} />
                          </div>
                          <span className="text-xs font-bold">{d.safetyScore}%</span>
                        </div>
                      </td>
                      <td className="align-right text-xs font-medium">{d.completionRate}%</td>
                      <td className="align-center"><StatusBadge status={d.status} /></td>
                      <td className="align-center">
                        <div className="cell-actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDriver(d);
                              setDriverModal(true);
                            }}
                            className="h-8 w-8 text-primary hover:bg-primary/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Delete this driver?')) {
                                deleteDriver(d.id);
                                toast({ title: 'Driver removed' });
                              }
                            }}
                            className="h-8 w-8 text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border bg-secondary/20 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllDrivers(!showAllDrivers)}
                className="text-xs text-primary hover:bg-primary/10 transition-all flex items-center mx-auto"
              >
                {showAllDrivers ? (
                  <>Show Less Drivers <ChevronUp className="h-3.5 w-3.5 ml-1" /></>
                ) : (
                  <>View All Drivers <ChevronDown className="h-3.5 w-3.5 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div
          onClick={() => navigate('/vehicles')}
          className="glass-card p-4 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
          style={{ animationDelay: '500ms' }}
        >
          <p className="text-muted-foreground mb-2 group-hover:text-primary/80 transition-colors">Fleet Size</p>
          <p className="text-2xl font-bold text-primary group-hover:text-3xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 transition-all">{vehicles.length}</p>
        </div>
        <div
          onClick={() => navigate('/drivers')}
          className="glass-card p-4 text-center hover:border-status-available/50 hover:shadow-lg hover:shadow-status-available/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
          style={{ animationDelay: '550ms' }}
        >
          <p className="text-muted-foreground mb-2 group-hover:text-status-available/80 transition-colors">Total Drivers</p>
          <p className="text-2xl font-bold text-status-available group-hover:text-3xl transition-all">{drivers.length}</p>
        </div>
        <div
          onClick={() => navigate('/trips')}
          className="glass-card p-4 text-center hover:border-status-on-trip/50 hover:shadow-lg hover:shadow-status-on-trip/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
          style={{ animationDelay: '600ms' }}
        >
          <p className="text-muted-foreground mb-2 group-hover:text-status-on-trip/80 transition-colors">Total Trips</p>
          <p className="text-2xl font-bold text-status-on-trip group-hover:text-3xl transition-all">{trips.length}</p>
        </div>
        <div
          onClick={() => navigate('/vehicles')}
          className="glass-card p-4 text-center hover:border-status-maintenance/50 hover:shadow-lg hover:shadow-status-maintenance/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
          style={{ animationDelay: '650ms' }}
        >
          <p className="text-muted-foreground mb-2 group-hover:text-status-maintenance/80 transition-colors">Maintenance Logs</p>
          <p className="text-2xl font-bold text-status-maintenance group-hover:text-3xl transition-all">{maintenanceLogs.length}</p>
        </div>
      </div>

      <ModalForm
        open={tripModal}
        onClose={() => {
          setTripModal(false);
          setEditingTrip(null);
        }}
        title={editingTrip ? 'Edit Trip' : 'Create New Trip'}
      >
        <TripForm
          initialData={editingTrip}
          vehicles={vehicles}
          drivers={drivers}
          isLicenseExpired={isLicenseExpired}
          onCancel={() => {
            setTripModal(false);
            setEditingTrip(null);
          }}
          onSave={(data) => {
            if (editingTrip) {
              updateTrip(editingTrip.id, data);
              toast({ title: '✓ Trip updated' });
            } else {
              addTrip(data);
              toast({ title: '✓ Trip created' });
            }
            setTripModal(false);
            setEditingTrip(null);
          }}
        />
      </ModalForm>

      <ModalForm
        open={vehicleModal}
        onClose={() => {
          setVehicleModal(false);
          setEditingVehicle(null);
        }}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <VehicleForm
          initialData={editingVehicle}
          isUniquePlate={(plate) => !vehicles.some(v => v.licensePlate === plate && v.id !== editingVehicle?.id)}
          onCancel={() => {
            setVehicleModal(false);
            setEditingVehicle(null);
          }}
          onSave={(data) => {
            if (editingVehicle) {
              updateVehicle(editingVehicle.id, data);
              toast({ title: '✓ Vehicle updated' });
            } else {
              addVehicle(data);
              toast({ title: '✓ Vehicle added' });
            }
            setVehicleModal(false);
            setEditingVehicle(null);
          }}
        />
      </ModalForm>

      <ModalForm
        open={driverModal}
        onClose={() => {
          setDriverModal(false);
          setEditingDriver(null);
        }}
        title={editingDriver ? 'Edit Driver' : 'Register New Driver'}
      >
        <DriverForm
          initialData={editingDriver}
          isUniqueLicense={(license) => !drivers.some(d => d.licenseNumber === license && d.id !== editingDriver?.id)}
          onCancel={() => {
            setDriverModal(false);
            setEditingDriver(null);
          }}
          onSave={(data) => {
            if (editingDriver) {
              updateDriver(editingDriver.id, data);
              toast({ title: '✓ Driver details updated' });
            } else {
              addDriver(data);
              toast({ title: '✓ Driver registered' });
            }
            setDriverModal(false);
            setEditingDriver(null);
          }}
        />
      </ModalForm>
    </div >
  );
}

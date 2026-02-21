import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
export type MaintenanceStatus = 'New' | 'In Progress' | 'Completed';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'Suspended';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Closed' | 'Escalated';

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  status: VehicleStatus;
  region: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  completionRate: number;
  safetyScore: number;
  complaints: number;
  status: DriverStatus;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  vehicleType: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  estimatedFuelCost: number;
  status: TripStatus;
  date: string;
  region: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  issue: string;
  date: string;
  cost: number;
  status: MaintenanceStatus;
}

export interface Expense {
  id: string;
  tripId: string;
  driverId: string;
  distance: number;
  fuelExpense: number;
  fuelLiters: number;
  miscExpense: number;
  date: string;
  status: string;
}

export interface SafetyIncident {
  id: string;
  date: string;
  vehicleId: string;
  driverId: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  location: string;
}

export interface SafetyInspection {
  id: string;
  date: string;
  vehicleId: string;
  inspectorId: string;
  status: 'Pass' | 'Fail' | 'Advisory';
  checks: {
    brakes: boolean;
    tires: boolean;
    lights: boolean;
    fluids: boolean;
    steering: boolean;
  };
  notes: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: UserRole } | null;
  session: Session | null;
  supabaseUser: User | null;
  loading: boolean;
  needsRoleSelection: boolean;
  setSession: (session: Session | null, event?: string) => void;
  setNeedsRoleSelection: (needs: boolean) => void;
  setRole: (role: UserRole) => void;
  updateRoleInSupabase: (role: UserRole) => Promise<void>;
  login: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

interface FleetState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  expenses: Expense[];
  incidents: SafetyIncident[];
  inspections: SafetyInspection[];
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addTrip: (t: Omit<Trip, 'id'>) => Promise<void>;
  updateTrip: (id: string, t: Partial<Trip>) => Promise<void>;
  addMaintenanceLog: (m: Omit<MaintenanceLog, 'id'>) => Promise<void>;
  updateMaintenanceLog: (id: string, m: Partial<MaintenanceLog>) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  addDriver: (d: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, d: Partial<Driver>) => Promise<void>;
  updateDriverPerformance: (id: string, updates: { safetyScore?: number; complaints?: number }) => Promise<void>;
  isLicenseExpired: (date: string) => boolean;
  addSafetyIncident: (i: Omit<SafetyIncident, 'id'>) => Promise<void>;
  updateSafetyIncident: (id: string, i: Partial<SafetyIncident>) => Promise<void>;
  addSafetyInspection: (i: Omit<SafetyInspection, 'id'>) => Promise<void>;
  fetchFleetData: () => Promise<void>;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const sampleVehicles: Vehicle[] = [
  { id: 'v1', licensePlate: 'ABC-1234', model: 'Volvo FH16', type: 'Truck', capacity: 25000, odometer: 120450, status: 'Available', region: 'North' },
  { id: 'v2', licensePlate: 'DEF-5678', model: 'Mercedes Actros', type: 'Truck', capacity: 22000, odometer: 89200, status: 'On Trip', region: 'South' },
  { id: 'v3', licensePlate: 'GHI-9012', model: 'Ford Transit', type: 'Van', capacity: 3500, odometer: 45600, status: 'Available', region: 'East' },
  { id: 'v4', licensePlate: 'JKL-3456', model: 'Scania R500', type: 'Truck', capacity: 28000, odometer: 200100, status: 'In Shop', region: 'West' },
  { id: 'v5', licensePlate: 'MNO-7890', model: 'Honda Super Cub', type: 'Bike', capacity: 150, odometer: 12300, status: 'Available', region: 'North' },
  { id: 'v6', licensePlate: 'PQR-1122', model: 'Freightliner Cascadia', type: 'Truck', capacity: 30000, odometer: 15000, status: 'On Trip', region: 'West' },
  { id: 'v7', licensePlate: 'STU-3344', model: 'Toyota HiAce', type: 'Van', capacity: 4000, odometer: 32000, status: 'Available', region: 'South' },
  { id: 'v8', licensePlate: 'VWX-5566', model: 'Yamaha MT-07', type: 'Bike', capacity: 200, odometer: 5000, status: 'Available', region: 'East' },
  { id: 'v9', licensePlate: 'YZA-7788', model: 'Peterbilt 579', type: 'Truck', capacity: 26000, odometer: 210000, status: 'In Shop', region: 'North' },
  { id: 'v10', licensePlate: 'BCD-9900', model: 'Volkswagen Crafter', type: 'Van', capacity: 5000, odometer: 88000, status: 'On Trip', region: 'West' },
  { id: 'v11', licensePlate: 'EFG-1133', model: 'Kenworth T680', type: 'Truck', capacity: 27000, odometer: 95000, status: 'On Trip', region: 'East' },
  { id: 'v12', licensePlate: 'HIJ-2244', model: 'Ducati Scrambler', type: 'Bike', capacity: 180, odometer: 2500, status: 'Available', region: 'South' },
  { id: 'v13', licensePlate: 'KLM-3344', model: 'ISUZU GIGA', type: 'Truck', capacity: 15000, odometer: 45000, status: 'Available', region: 'North' },
  { id: 'v14', licensePlate: 'NOP-4455', model: 'Toyota TownAce', type: 'Van', capacity: 1000, odometer: 12000, status: 'Available', region: 'East' },
];

const sampleDrivers: Driver[] = [
  { id: 'd1', name: 'Marcus Johnson', licenseNumber: 'CDL-88421', licenseExpiry: '2025-08-15', completionRate: 96, safetyScore: 92, complaints: 1, status: 'On Duty' },
  { id: 'd2', name: 'Sarah Chen', licenseNumber: 'CDL-77312', licenseExpiry: '2026-03-22', completionRate: 98, safetyScore: 97, complaints: 0, status: 'On Duty' },
  { id: 'd3', name: 'James Rivera', licenseNumber: 'CDL-66203', licenseExpiry: '2024-11-30', completionRate: 88, safetyScore: 78, complaints: 3, status: 'Off Duty' },
  { id: 'd4', name: 'Aisha Patel', licenseNumber: 'CDL-55194', licenseExpiry: '2026-07-10', completionRate: 94, safetyScore: 90, complaints: 0, status: 'On Duty' },
  { id: 'd5', name: 'Elena Rodriguez', licenseNumber: 'CDL-44085', licenseExpiry: '2026-12-05', completionRate: 92, safetyScore: 88, complaints: 0, status: 'On Duty' },
  { id: 'd6', name: 'David Kim', licenseNumber: 'CDL-33976', licenseExpiry: '2025-05-20', completionRate: 99, safetyScore: 95, complaints: 0, status: 'On Duty' },
];

const sampleTrips: Trip[] = [
  { id: 'TR-001', vehicleId: 'v2', driverId: 'd1', vehicleType: 'Truck', origin: 'Chicago, IL', destination: 'Detroit, MI', cargoWeight: 18000, estimatedFuelCost: 450, status: 'Dispatched', date: '2026-02-20', region: 'South' },
  { id: 'TR-002', vehicleId: 'v1', driverId: 'd2', vehicleType: 'Truck', origin: 'Dallas, TX', destination: 'Houston, TX', cargoWeight: 12000, estimatedFuelCost: 280, status: 'Completed', date: '2026-02-18', region: 'North' },
  { id: 'TR-003', vehicleId: 'v3', driverId: 'd4', vehicleType: 'Van', origin: 'NYC, NY', destination: 'Boston, MA', cargoWeight: 2800, estimatedFuelCost: 120, status: 'Draft', date: '2026-02-21', region: 'East' },
  { id: 'TR-004', vehicleId: 'v6', driverId: 'd2', vehicleType: 'Truck', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', cargoWeight: 25000, estimatedFuelCost: 600, status: 'Dispatched', date: '2026-02-21', region: 'West' },
];

const sampleMaintenance: MaintenanceLog[] = [
  { id: 'ML-001', vehicleId: 'v4', issue: 'Engine overhaul', date: '2026-02-15', cost: 4500, status: 'In Progress' },
  { id: 'ML-002', vehicleId: 'v1', issue: 'Brake pad replacement', date: '2026-02-10', cost: 800, status: 'Completed' },
];

const sampleExpenses: Expense[] = [
  { id: 'EX-001', tripId: 'TR-002', driverId: 'd2', distance: 385, fuelExpense: 265, fuelLiters: 95, miscExpense: 45, date: '2026-02-18', status: 'Approved' },
  { id: 'EX-002', tripId: 'TR-001', driverId: 'd1', distance: 450, fuelExpense: 420, fuelLiters: 150, miscExpense: 30, date: '2026-02-20', status: 'Pending' },
];

const sampleIncidents: SafetyIncident[] = [
  { id: 'INC-001', date: '2026-02-15', vehicleId: 'v2', driverId: 'd1', type: 'Minor Collision', severity: 'Medium', status: 'Closed', description: 'Low-speed contact during parking maneuver.', location: 'Logistics Hub A' },
  { id: 'INC-002', date: '2026-02-18', vehicleId: 'v4', driverId: 'd3', type: 'Speeding Violation', severity: 'High', status: 'Investigating', description: 'Exceeded highway speed limit by 20km/h.', location: 'I-95 Northbound' },
];

const sampleInspections: SafetyInspection[] = [
  {
    id: 'SI-001', date: '2026-02-19', vehicleId: 'v1', inspectorId: 'admin', status: 'Pass',
    checks: { brakes: true, tires: true, lights: true, fluids: true, steering: true },
    notes: 'Routine pre-trip inspection. All systems normal.'
  },
  {
    id: 'SI-002', date: '2026-02-20', vehicleId: 'v2', inspectorId: 'admin', status: 'Advisory',
    checks: { brakes: true, tires: false, lights: true, fluids: true, steering: true },
    notes: 'Rear tires showing wear. Recommended replacement within 5000km.'
  },
];

async function fetchUserRole(userId: string): Promise<{ role: UserRole; isNew: boolean }> {
  const { data } = await supabase
    .from('user_roles')
    .select('role, confirmed_by_user')
    .eq('user_id', userId)
    .single();

  if (!data) return { role: 'fleet_manager', isNew: true };
  if (data.confirmed_by_user === false || data.confirmed_by_user === null) {
    return { role: data.role as UserRole, isNew: true };
  }
  return { role: data.role as UserRole, isNew: false };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  supabaseUser: null,
  loading: true,
  needsRoleSelection: false,

  setSession: async (session, event) => {
    if (session?.user) {
      const { role, isNew } = await fetchUserRole(session.user.id);
      const meta = session.user.user_metadata;
      const isOAuth = session.user.app_metadata?.provider === 'google';
      const forceRoleSelection = isOAuth && isNew;

      set({
        isAuthenticated: true,
        session,
        supabaseUser: session.user,
        needsRoleSelection: forceRoleSelection,
        user: {
          name: meta?.name || meta?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role,
        },
        loading: false,
      });
    } else {
      set({
        isAuthenticated: false,
        session: null,
        supabaseUser: null,
        user: null,
        loading: false,
        needsRoleSelection: false,
      });
    }
  },

  setNeedsRoleSelection: (needs) => {
    set({ needsRoleSelection: needs });
  },

  setRole: (role) => {
    const { user } = get();
    if (user) set({ user: { ...user, role } });
  },

  updateRoleInSupabase: async (role) => {
    const { supabaseUser, user } = get();
    if (!supabaseUser) return;
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', supabaseUser.id)
      .single();
    if (existing) {
      await supabase
        .from('user_roles')
        .update({ role, confirmed_by_user: true })
        .eq('user_id', supabaseUser.id);
    } else {
      await supabase
        .from('user_roles')
        .insert({ user_id: supabaseUser.id, role, confirmed_by_user: true });
    }
    if (user) set({ user: { ...user, role }, needsRoleSelection: false });
  },

  login: async (email, password, _role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  register: async (name, email, password, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    if (data.session) {
      await supabase
        .from('user_roles')
        .insert({ user_id: data.user!.id, role, confirmed_by_user: true })
        .single();
      await get().setSession(data.session);
    }
    return { error: null };
  },

  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, session: null, supabaseUser: null, user: null });
  },

  initialize: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      get().setSession(session, event);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
    });
    return () => subscription.unsubscribe();
  },
}));

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: sampleVehicles,
  drivers: sampleDrivers,
  trips: sampleTrips,
  maintenanceLogs: sampleMaintenance,
  expenses: sampleExpenses,
  incidents: sampleIncidents,
  inspections: sampleInspections,
  addVehicle: async (v) => {
    const { data, error } = await supabase.from('vehicles').insert([{ ...v, id: uid() }]).select();
    if (data) set((s) => ({ vehicles: [...s.vehicles, data[0] as Vehicle] }));
  },
  updateVehicle: async (id, v) => {
    const { data, error } = await supabase.from('vehicles').update(v).eq('id', id).select();
    if (data) set((s) => ({ vehicles: s.vehicles.map((x) => x.id === id ? { ...x, ...v } : x) }));
  },
  deleteVehicle: async (id) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (!error) set((s) => ({ vehicles: s.vehicles.filter((x) => x.id !== id) }));
  },
  addTrip: async (t) => {
    const id = `TR-${String(get().trips.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('trips').insert([{ ...t, id }]).select();
    if (data) set((s) => ({ trips: [...s.trips, data[0] as Trip] }));
  },
  updateTrip: async (id, t) => {
    const trip = get().trips.find(x => x.id === id);
    if (!trip) return;

    const { data, error } = await supabase.from('trips').update(t).eq('id', id).select();
    if (!data) return;

    set((s) => {
      const updatedTrip = { ...trip, ...t };
      let updatedVehicles = s.vehicles;
      let updatedDrivers = s.drivers;

      if (t.status === 'Dispatched' && trip.status !== 'Dispatched') {
        updatedVehicles = s.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'On Trip' as VehicleStatus } : v
        );
        updatedDrivers = s.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'On Trip' as DriverStatus } : d
        );
      } else if (t.status === 'Completed' && trip.status !== 'Completed') {
        updatedVehicles = s.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v
        );
        updatedDrivers = s.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'On Duty' as DriverStatus } : d
        );
      } else if (t.status === 'Cancelled' && (trip.status === 'Draft' || trip.status === 'Dispatched')) {
        updatedVehicles = s.vehicles.map((v) =>
          v.id === trip.vehicleId && v.status === 'On Trip' ? { ...v, status: 'Available' as VehicleStatus } : v
        );
        updatedDrivers = s.drivers.map((d) =>
          d.id === trip.driverId && d.status === 'On Duty' ? { ...d, status: 'On Duty' as DriverStatus } : d
        );
      }

      return {
        trips: s.trips.map((x) => x.id === id ? updatedTrip : x),
        vehicles: updatedVehicles,
        drivers: updatedDrivers,
      };
    });
  },
  addMaintenanceLog: async (m) => {
    const id = `ML-${String(get().maintenanceLogs.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('maintenance_logs').insert([{ ...m, id }]).select();
    if (data) {
      set((s) => ({
        maintenanceLogs: [...s.maintenanceLogs, data[0] as MaintenanceLog],
        vehicles: s.vehicles.map((v) => v.id === m.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v),
      }));
    }
  },
  updateMaintenanceLog: async (id, m) => {
    const { data, error } = await supabase.from('maintenance_logs').update(m).eq('id', id).select();
    if (data) set((s) => ({ maintenanceLogs: s.maintenanceLogs.map((x) => x.id === id ? { ...x, ...m } : x) }));
  },
  addExpense: async (e) => {
    const id = `EX-${String(get().expenses.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('expenses').insert([{ ...e, id }]).select();
    if (data) set((s) => ({ expenses: [...s.expenses, data[0] as Expense] }));
  },
  addDriver: async (d) => {
    const { data, error } = await supabase.from('drivers').insert([{ ...d, id: uid() }]).select();
    if (data) set((s) => ({ drivers: [...s.drivers, data[0] as Driver] }));
  },
  updateDriver: async (id, d) => {
    const { data, error } = await supabase.from('drivers').update(d).eq('id', id).select();
    if (data) set((s) => ({ drivers: s.drivers.map((x) => x.id === id ? { ...x, ...d } : x) }));
  },
  updateDriverPerformance: async (id, updates) => {
    const { data, error } = await supabase.from('drivers').update(updates).eq('id', id).select();
    if (data) set((s) => ({
      drivers: s.drivers.map((d) => d.id === id ? { ...d, ...updates } : d)
    }));
  },
  isLicenseExpired: (date: string) => new Date(date) < new Date(),
  addSafetyIncident: async (i) => {
    const id = `INC-${String(get().incidents.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('safety_incidents').insert([{ ...i, id }]).select();
    if (data) set((s) => ({ incidents: [...s.incidents, data[0] as SafetyIncident] }));
  },
  updateSafetyIncident: async (id, i) => {
    const { data, error } = await supabase.from('safety_incidents').update(i).eq('id', id).select();
    if (data) set((s) => ({ incidents: s.incidents.map((x) => x.id === id ? { ...x, ...i } : x) }));
  },
  addSafetyInspection: async (i) => {
    const id = `SI-${String(get().inspections.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('safety_inspections').insert([{ ...i, id }]).select();
    if (data) set((s) => ({ inspections: [...s.inspections, data[0] as SafetyInspection] }));
  },
  fetchFleetData: async () => {
    try {
      const { data: vData } = await supabase.from('vehicles').select('*');

      if (vData && vData.length > 0) {
        const { data: dData } = await supabase.from('drivers').select('*');
        const { data: tData } = await supabase.from('trips').select('*');
        const { data: mData } = await supabase.from('maintenance_logs').select('*');
        const { data: eData } = await supabase.from('expenses').select('*');
        const { data: iData } = await supabase.from('safety_incidents').select('*');
        const { data: sData } = await supabase.from('safety_inspections').select('*');

        set({
          vehicles: vData as Vehicle[],
          drivers: (dData || []) as Driver[],
          trips: (tData || []) as Trip[],
          maintenanceLogs: (mData || []) as MaintenanceLog[],
          expenses: (eData || []) as Expense[],
          incidents: (iData || []) as SafetyIncident[],
          inspections: (sData || []) as SafetyInspection[],
        });
        console.log('Successfully synced with Supabase backend.');
      } else {
        console.log('Supabase tables are empty. Seeding initial data...');
        // Optional: Automatic seeding
        await Promise.all([
          supabase.from('vehicles').insert(sampleVehicles),
          supabase.from('drivers').insert(sampleDrivers),
          supabase.from('trips').insert(sampleTrips),
          supabase.from('maintenance_logs').insert(sampleMaintenance),
          supabase.from('expenses').insert(sampleExpenses),
          supabase.from('safety_incidents').insert(sampleIncidents),
          supabase.from('safety_inspections').insert(sampleInspections),
        ]);
        console.log('Seeding complete.');
      }
    } catch (error) {
      console.error('Error connecting to backend (Check Supabase tables):', error);
    }
  },
}));

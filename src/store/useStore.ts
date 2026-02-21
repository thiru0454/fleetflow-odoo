import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
export type MaintenanceStatus = 'New' | 'In Progress' | 'Completed';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'Suspended';

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  status: VehicleStatus;
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

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: UserRole } | null;
  session: Session | null;
  supabaseUser: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
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
  addVehicle: (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addTrip: (t: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, t: Partial<Trip>) => void;
  addMaintenanceLog: (m: Omit<MaintenanceLog, 'id'>) => void;
  updateMaintenanceLog: (id: string, m: Partial<MaintenanceLog>) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  addDriver: (d: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, d: Partial<Driver>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const sampleVehicles: Vehicle[] = [
  { id: 'v1', licensePlate: 'ABC-1234', model: 'Volvo FH16', type: 'Heavy Truck', capacity: 25000, odometer: 120450, status: 'Available' },
  { id: 'v2', licensePlate: 'DEF-5678', model: 'Mercedes Actros', type: 'Heavy Truck', capacity: 22000, odometer: 89200, status: 'On Trip' },
  { id: 'v3', licensePlate: 'GHI-9012', model: 'Ford Transit', type: 'Van', capacity: 3500, odometer: 45600, status: 'Available' },
  { id: 'v4', licensePlate: 'JKL-3456', model: 'Scania R500', type: 'Heavy Truck', capacity: 28000, odometer: 200100, status: 'In Shop' },
  { id: 'v5', licensePlate: 'MNO-7890', model: 'Isuzu NPR', type: 'Medium Truck', capacity: 8000, odometer: 67300, status: 'Available' },
];

const sampleDrivers: Driver[] = [
  { id: 'd1', name: 'Marcus Johnson', licenseNumber: 'CDL-88421', licenseExpiry: '2025-08-15', completionRate: 96, safetyScore: 92, complaints: 1, status: 'On Duty' },
  { id: 'd2', name: 'Sarah Chen', licenseNumber: 'CDL-77312', licenseExpiry: '2026-03-22', completionRate: 98, safetyScore: 97, complaints: 0, status: 'On Duty' },
  { id: 'd3', name: 'James Rivera', licenseNumber: 'CDL-66203', licenseExpiry: '2024-11-30', completionRate: 88, safetyScore: 78, complaints: 3, status: 'Off Duty' },
  { id: 'd4', name: 'Aisha Patel', licenseNumber: 'CDL-55194', licenseExpiry: '2026-07-10', completionRate: 94, safetyScore: 90, complaints: 0, status: 'On Duty' },
];

const sampleTrips: Trip[] = [
  { id: 'TR-001', vehicleId: 'v2', driverId: 'd1', vehicleType: 'Heavy Truck', origin: 'Chicago, IL', destination: 'Detroit, MI', cargoWeight: 18000, estimatedFuelCost: 450, status: 'Dispatched', date: '2026-02-20' },
  { id: 'TR-002', vehicleId: 'v1', driverId: 'd2', vehicleType: 'Heavy Truck', origin: 'Dallas, TX', destination: 'Houston, TX', cargoWeight: 12000, estimatedFuelCost: 280, status: 'Completed', date: '2026-02-18' },
  { id: 'TR-003', vehicleId: 'v3', driverId: 'd4', vehicleType: 'Van', origin: 'NYC, NY', destination: 'Boston, MA', cargoWeight: 2800, estimatedFuelCost: 120, status: 'Draft', date: '2026-02-21' },
];

const sampleMaintenance: MaintenanceLog[] = [
  { id: 'ML-001', vehicleId: 'v4', issue: 'Engine overhaul', date: '2026-02-15', cost: 4500, status: 'In Progress' },
  { id: 'ML-002', vehicleId: 'v1', issue: 'Brake pad replacement', date: '2026-02-10', cost: 800, status: 'Completed' },
];

const sampleExpenses: Expense[] = [
  { id: 'EX-001', tripId: 'TR-002', driverId: 'd2', distance: 385, fuelExpense: 265, fuelLiters: 95, miscExpense: 45, date: '2026-02-18', status: 'Approved' },
  { id: 'EX-002', tripId: 'TR-001', driverId: 'd1', distance: 450, fuelExpense: 420, fuelLiters: 150, miscExpense: 30, date: '2026-02-20', status: 'Pending' },
];

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return (data?.role as UserRole) || 'fleet_manager';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  supabaseUser: null,
  loading: true,

  setSession: async (session) => {
    if (session?.user) {
      const role = await fetchUserRole(session.user.id);
      const meta = session.user.user_metadata;
      set({
        isAuthenticated: true,
        session,
        supabaseUser: session.user,
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
      });
    }
  },

  setRole: (role) => {
    const { user } = get();
    if (user) set({ user: { ...user, role } });
  },

  login: async (email, password, _role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // session listener handles the rest
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
    return { error: null };
  },

  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, session: null, supabaseUser: null, user: null });
  },

  initialize: () => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
    });

    return () => subscription.unsubscribe();
  },
}));

export const useFleetStore = create<FleetState>((set) => ({
  vehicles: sampleVehicles,
  drivers: sampleDrivers,
  trips: sampleTrips,
  maintenanceLogs: sampleMaintenance,
  expenses: sampleExpenses,
  addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, { ...v, id: uid() }] })),
  updateVehicle: (id, v) => set((s) => ({ vehicles: s.vehicles.map((x) => x.id === id ? { ...x, ...v } : x) })),
  deleteVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((x) => x.id !== id) })),
  addTrip: (t) => set((s) => ({ trips: [...s.trips, { ...t, id: `TR-${String(s.trips.length + 1).padStart(3, '0')}` }] })),
  updateTrip: (id, t) => set((s) => ({ trips: s.trips.map((x) => x.id === id ? { ...x, ...t } : x) })),
  addMaintenanceLog: (m) => set((s) => {
    const newLog = { ...m, id: `ML-${String(s.maintenanceLogs.length + 1).padStart(3, '0')}` };
    return {
      maintenanceLogs: [...s.maintenanceLogs, newLog],
      vehicles: s.vehicles.map((v) => v.id === m.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v),
    };
  }),
  updateMaintenanceLog: (id, m) => set((s) => ({ maintenanceLogs: s.maintenanceLogs.map((x) => x.id === id ? { ...x, ...m } : x) })),
  addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: `EX-${String(s.expenses.length + 1).padStart(3, '0')}` }] })),
  addDriver: (d) => set((s) => ({ drivers: [...s.drivers, { ...d, id: uid() }] })),
  updateDriver: (id, d) => set((s) => ({ drivers: s.drivers.map((x) => x.id === id ? { ...x, ...d } : x) })),
}));

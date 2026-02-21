-- FleetFlow Supabase Schema Setup Script
-- Execute this in your Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    license_plate TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity NUMERIC DEFAULT 0,
    odometer NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Available',
    region TEXT
);

CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    completion_rate NUMERIC DEFAULT 0,
    safety_score NUMERIC DEFAULT 100,
    complaints INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Off Duty'
);

CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id),
    driver_id TEXT REFERENCES drivers(id),
    vehicle_type TEXT,
    origin TEXT,
    destination TEXT,
    cargo_weight NUMERIC,
    estimated_fuel_cost NUMERIC,
    status TEXT DEFAULT 'Draft',
    date DATE DEFAULT CURRENT_DATE,
    region TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id),
    issue TEXT,
    date DATE DEFAULT CURRENT_DATE,
    cost NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'New'
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    trip_id TEXT REFERENCES trips(id),
    driver_id TEXT REFERENCES drivers(id),
    distance NUMERIC DEFAULT 0,
    fuel_expense NUMERIC DEFAULT 0,
    fuel_liters NUMERIC DEFAULT 0,
    misc_expense NUMERIC DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS safety_incidents (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    vehicle_id TEXT REFERENCES vehicles(id),
    driver_id TEXT REFERENCES drivers(id),
    type TEXT,
    severity TEXT,
    status TEXT DEFAULT 'Open',
    description TEXT,
    location TEXT
);

CREATE TABLE IF NOT EXISTS safety_inspections (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    vehicle_id TEXT REFERENCES vehicles(id),
    inspector_id TEXT,
    status TEXT,
    checks JSONB,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'fleet_manager',
    confirmed_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enabled Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create Basic Policies (Allow all for now, assuming owner access or similar)
-- NOTE: In production, refine these policies based on user_id or roles.
CREATE POLICY "Enable all for authenticated users" ON vehicles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON drivers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON trips FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON maintenance_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON safety_incidents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON safety_inspections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON user_roles FOR ALL USING (auth.role() = 'authenticated');

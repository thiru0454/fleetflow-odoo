import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hoyfwotvfdqypvnbsidn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveWZ3b3R2ZmRxeXB2bmJzaWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2Mjg3NzMsImV4cCI6MjA4NzIwNDc3M30.Yvzk_5xuCJrWQetWp75BwSQYRYH62g1aPd69RpLWuEc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

console.log('Supabase initialized with URL:', SUPABASE_URL);

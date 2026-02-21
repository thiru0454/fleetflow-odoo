import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qrvgtanqholrqwcqtzmq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dvy2Bd8S6cVt8MjTQ4i8lg_m-Z__NhA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

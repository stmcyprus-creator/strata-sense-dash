import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khnblulukkjkalzzinrz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2lLUkd1mmaqAcpPsIC5MVw_uoYgHT93';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

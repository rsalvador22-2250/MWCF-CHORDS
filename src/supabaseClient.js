import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdhqodxptqzmkbfifmjl.supabase.co';
const supabaseAnonKey = 'sb_publishable_ehZDndjyBFtODo-01cyVkg_Tte5C8Im';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
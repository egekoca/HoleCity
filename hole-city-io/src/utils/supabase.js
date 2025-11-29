import { createClient } from '@supabase/supabase-js';

// Bu değerleri .env dosyasından çekmeye çalışacağız, yoksa manuel girebilirsiniz.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);


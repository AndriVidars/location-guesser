import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Client for use in the browser
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Client for use on the server (with service role key)
// We only initialize this if the key is available (server-side)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseServer = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null as any;

const SUPABASE_URL = 'https://prmjmzeepvutyvxhuout.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kmoZs2WJwb7xgG5HZYjJHQ_ckTzhnnE';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

window.busianSupabase = supabaseClient;

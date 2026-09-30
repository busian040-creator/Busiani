const SUPABASE_URL = 'https://prmjmzeepvutyvxhuout.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mCfu2JF8ZXSjn-8Vtit0Vg_zUHheWg6';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

window.busianSupabase = supabaseClient;
window.loadBusianCategories = async function () {
    const { data, error } = await window.busianSupabase
        .from('categories')
        .select('id, name, slug, sort_order')
        .order('sort_order');

    if (error) {
        console.error('BUSIAN categories error:', error);
        return null;
    }

    return data;
};

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

window.busianSignUp = async function (email, password, options = {}) {
    return await window.busianSupabase.auth.signUp({
        email,
        password,
        options
    });
};

window.busianSignIn = async function (email, password) {
    return await window.busianSupabase.auth.signInWithPassword({
        email,
        password
    });
};

window.busianSignOut = async function () {
    return await window.busianSupabase.auth.signOut();
};

window.busianGetSession = async function () {
    return await window.busianSupabase.auth.getSession();
};

window.busianOnAuthStateChange = function (callback) {
    return window.busianSupabase.auth.onAuthStateChange(callback);
};
                                      

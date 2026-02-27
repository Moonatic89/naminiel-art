import { supabase } from "../supabase";

export async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export function onAuthChanged(cb) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        cb(session?.user || null, session);
    });
    return () => subscription.unsubscribe();
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
}

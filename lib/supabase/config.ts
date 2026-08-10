const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let warned = false;

export function isSupabaseConfigured(): boolean {
	if (url && anonKey) return true;
	if (!warned) {
		warned = true;
		console.warn(
			"[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — accounts, publishing, and subscriptions are disabled. See docs/SUPABASE_SETUP.md.",
		);
	}
	return false;
}

export function supabaseUrl(): string {
	if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
	return url;
}

export function supabaseAnonKey(): string {
	if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
	return anonKey;
}

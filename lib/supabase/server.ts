import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function createClient() {
	const cookieStore = cookies();

	return createServerClient(supabaseUrl(), supabaseAnonKey(), {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
				} catch {
					// Server Components cannot write cookies; the middleware
					// refreshes sessions, so this is safe to ignore there.
				}
			},
		},
	});
}

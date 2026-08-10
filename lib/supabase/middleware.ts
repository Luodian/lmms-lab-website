import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

const AUTH_REQUIRED_PREFIXES = ["/account", "/studio", "/admin"];

export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({ request });

	if (!isSupabaseConfigured()) {
		return response;
	}

	const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value),
				);
				response = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) =>
					response.cookies.set(name, value, options),
				);
			},
		},
	});

	// getUser() both validates and refreshes the session cookie; without this
	// call Server Components would see expired tokens.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const path = request.nextUrl.pathname;
	const needsAuth = AUTH_REQUIRED_PREFIXES.some(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);
	if (needsAuth && !user) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("next", path);
		return NextResponse.redirect(url);
	}

	return response;
}

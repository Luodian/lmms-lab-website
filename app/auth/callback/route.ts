import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Only allow same-site relative paths so the callback cannot be used as an
// open redirect ("//host" is protocol-relative and would leave the site).
function sanitizeNext(value: string | null): string {
	if (value && value.startsWith("/") && !value.startsWith("//")) {
		return value;
	}
	return "/account/";
}

export async function GET(request: NextRequest) {
	if (!isSupabaseConfigured()) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	const code = request.nextUrl.searchParams.get("code");
	const next = sanitizeNext(request.nextUrl.searchParams.get("next"));

	if (code) {
		const supabase = createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			return NextResponse.redirect(new URL(next, request.url));
		}
		console.error(`[auth-callback] code exchange failed: ${error.message}`);
	}

	return NextResponse.redirect(new URL("/login/?error=auth", request.url));
}

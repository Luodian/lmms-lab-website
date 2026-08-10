"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// The admin page calls these from plain <form action> buttons, which discard
// return values, so instead of returning { ok, error } these redirecting
// actions surface failures inline by sending the browser back to /admin/
// with an error query param that the page renders.
async function decideCollabRequest(
	rpcName: "approve_collab_request" | "decline_collab_request",
	requestId: string,
): Promise<void> {
	if (!isSupabaseConfigured()) {
		redirect(`/admin/?error=${encodeURIComponent("supabase is not configured")}`);
	}

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect("/login");
	}

	// The RPC re-checks the admin role server-side (SECURITY DEFINER).
	const { error } = await supabase.rpc(rpcName, { request_id: requestId });
	if (error) {
		redirect(`/admin/?error=${encodeURIComponent(error.message)}`);
	}

	revalidatePath("/admin");
	// Redirect to the bare path so a stale ?error= from an earlier failure
	// does not linger after a successful decision.
	redirect("/admin/");
}

export async function approveCollabRequest(requestId: string): Promise<void> {
	return decideCollabRequest("approve_collab_request", requestId);
}

export async function declineCollabRequest(requestId: string): Promise<void> {
	return decideCollabRequest("decline_collab_request", requestId);
}

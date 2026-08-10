"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
	ok: boolean;
	error?: string;
};

const NOT_CONFIGURED = "Accounts are not configured on this deployment yet.";
const SIGNED_OUT = "Your session has expired. Sign in again.";

async function requireUser() {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return { supabase, user };
}

export async function updateProfile(input: {
	displayName: string;
	website: string;
}): Promise<ActionResult> {
	if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

	const displayName = input.displayName.trim();
	const website = input.website.trim();
	if (displayName.length > 80) {
		return { ok: false, error: "Display name must be 80 characters or fewer." };
	}
	if (website.length > 200) {
		return { ok: false, error: "Website must be 200 characters or fewer." };
	}
	if (website && !/^https?:\/\/\S+$/.test(website)) {
		return {
			ok: false,
			error: "Website must be a full URL starting with http:// or https://",
		};
	}

	const { supabase, user } = await requireUser();
	if (!user) return { ok: false, error: SIGNED_OUT };

	const { error } = await supabase
		.from("profiles")
		.update({
			display_name: displayName || null,
			website: website || null,
		})
		.eq("id", user.id);
	if (error) {
		return { ok: false, error: `Saving the profile failed: ${error.message}` };
	}

	revalidatePath("/account");
	return { ok: true };
}

export async function upsertSubscription(input: {
	subscribePosts: boolean;
	subscribeNotes: boolean;
}): Promise<ActionResult> {
	if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

	const { supabase, user } = await requireUser();
	if (!user) return { ok: false, error: SIGNED_OUT };

	const { error } = await supabase.from("subscriptions").upsert({
		user_id: user.id,
		subscribe_posts: input.subscribePosts === true,
		subscribe_notes: input.subscribeNotes === true,
	});
	if (error) {
		return {
			ok: false,
			error: `Saving the subscription failed: ${error.message}`,
		};
	}

	revalidatePath("/account");
	return { ok: true };
}

export async function requestCollaboration(input: {
	message: string;
}): Promise<ActionResult> {
	if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

	const message = input.message.trim();
	if (!message) {
		return {
			ok: false,
			error:
				"Add a short message about who you are and what you want to publish.",
		};
	}
	if (message.length > 2000) {
		return { ok: false, error: "Keep the message under 2000 characters." };
	}

	const { supabase, user } = await requireUser();
	if (!user) return { ok: false, error: SIGNED_OUT };

	const { error } = await supabase
		.from("collab_requests")
		.insert({ user_id: user.id, message });
	if (error) {
		// The database allows at most one pending request per user; a unique
		// violation (23505) means one is already waiting for review.
		if (error.code === "23505") {
			return {
				ok: false,
				error: "You already have a pending request. An admin will review it.",
			};
		}
		return {
			ok: false,
			error: `Submitting the request failed: ${error.message}`,
		};
	}

	revalidatePath("/account");
	return { ok: true };
}

export async function signOut(): Promise<void> {
	if (isSupabaseConfigured()) {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(`[account] sign out failed: ${error.message}`);
		}
	}
	redirect("/");
}

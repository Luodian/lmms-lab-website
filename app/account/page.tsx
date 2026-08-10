import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type {
	CollabRequestRow,
	ProfileRow,
	SubscriptionRow,
} from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Account",
	description: "Manage your LMMs-Lab profile, subscriptions, and requests.",
};

export default async function AccountPage() {
	if (!isSupabaseConfigured()) {
		return (
			<main className={styles.container}>
				<p className={styles.notConfigured}>
					Accounts are not configured on this deployment yet.
				</p>
			</main>
		);
	}

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect("/login");
	}

	const [profileResult, subscriptionResult, requestsResult] = await Promise.all(
		[
			supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
			supabase
				.from("subscriptions")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle(),
			supabase
				.from("collab_requests")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false }),
		],
	);

	for (const result of [profileResult, subscriptionResult, requestsResult]) {
		if (result.error) {
			console.error(
				`[account] loading account data failed: ${result.error.message}`,
			);
		}
	}

	return (
		<main className={styles.container}>
			<AccountClient
				email={user.email ?? null}
				profile={(profileResult.data as ProfileRow | null) ?? null}
				subscription={
					(subscriptionResult.data as SubscriptionRow | null) ?? null
				}
				requests={(requestsResult.data as CollabRequestRow[] | null) ?? []}
			/>
		</main>
	);
}

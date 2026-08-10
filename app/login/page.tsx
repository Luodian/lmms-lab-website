import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LoginClient from "./LoginClient";
import styles from "./login.module.css";

export const metadata: Metadata = {
	title: "Sign in",
	description:
		"Sign in to LMMs-Lab to subscribe to updates or request collaborator access.",
	alternates: {
		canonical: "/login/",
	},
};

export default function LoginPage() {
	return (
		<main className={styles.container}>
			<div className={styles.panel}>
				<h1 className={styles.title}>Sign in</h1>
				{isSupabaseConfigured() ? (
					<>
						<p className={styles.copy}>
							Signing in lets you subscribe to LMMs-Lab updates. Posts are
							project write-ups and notes are scientific findings, published by
							lab members and approved collaborators. Any signed-in user can
							request collaborator access from their account page.
						</p>
						<LoginClient />
					</>
				) : (
					<p className={styles.notice}>
						Accounts are not configured on this deployment yet.
					</p>
				)}
			</div>
		</main>
	);
}

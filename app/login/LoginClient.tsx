"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import styles from "./login.module.css";

type Provider = "google" | "github";

// Flip once the GitHub OAuth app is registered in Supabase; the provider
// is not enabled there yet, so the button would only produce an error.
const GITHUB_SIGN_IN_ENABLED = false;

const SIGN_IN_FAILED = "Sign-in failed. Please try again.";

function LoginForm() {
	const searchParams = useSearchParams();
	const next = searchParams.get("next") || "/account/";
	const hasCallbackError = searchParams.get("error") !== null;
	const [error, setError] = useState<string | null>(null);
	const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);

	async function signIn(provider: Provider) {
		if (!isSupabaseConfigured()) {
			setError("Accounts are not configured on this deployment yet.");
			return;
		}
		setError(null);
		setPendingProvider(provider);
		const supabase = createClient();
		const { error: signInError } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback/?next=${encodeURIComponent(next)}`,
			},
		});
		if (signInError) {
			console.error(
				`[login] ${provider} sign-in failed: ${signInError.message}`,
			);
			setPendingProvider(null);
			setError(SIGN_IN_FAILED);
		}
	}

	const notice = error ?? (hasCallbackError ? SIGN_IN_FAILED : null);

	return (
		<>
			{notice && (
				<p className={styles.error} role="alert">
					{notice}
				</p>
			)}
			<div className={styles.buttons}>
				<button
					type="button"
					className={styles.providerButton}
					disabled={pendingProvider !== null}
					onClick={() => void signIn("google")}
				>
					{pendingProvider === "google"
						? "Redirecting"
						: "Continue with Google"}
				</button>
				{GITHUB_SIGN_IN_ENABLED && (
					<button
						type="button"
						className={styles.providerButton}
						disabled={pendingProvider !== null}
						onClick={() => void signIn("github")}
					>
						{pendingProvider === "github"
							? "Redirecting"
							: "Continue with GitHub"}
					</button>
				)}
			</div>
		</>
	);
}

export default function LoginClient() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}

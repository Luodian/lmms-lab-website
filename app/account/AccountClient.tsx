"use client";

import { useState } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import type {
	CollabRequestRow,
	CollabRequestStatus,
	ProfileRow,
	SubscriptionRow,
	UserRole,
} from "@/lib/blog-db";
import {
	type ActionResult,
	requestCollaboration,
	signOut,
	updateProfile,
	upsertSubscription,
} from "./actions";
import styles from "./account.module.css";

const REQUEST_FAILED =
	"The request failed. Check your connection and try again.";

const STATUS_LABELS: Record<CollabRequestStatus, string> = {
	pending: "Pending review",
	approved: "Approved",
	declined: "Declined",
};

// Date-only UTC format keeps server and client renders identical.
function formatDate(value: string): string {
	return new Date(value).toISOString().slice(0, 10);
}

interface SectionStatus {
	pending: boolean;
	error: string | null;
	saved: boolean;
	run: (action: () => Promise<ActionResult>) => Promise<void>;
}

function useSectionStatus(): SectionStatus {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	async function run(action: () => Promise<ActionResult>) {
		setPending(true);
		setError(null);
		setSaved(false);
		try {
			const result = await action();
			if (result.ok) {
				setSaved(true);
			} else {
				setError(result.error ?? REQUEST_FAILED);
			}
		} catch {
			setError(REQUEST_FAILED);
		} finally {
			setPending(false);
		}
	}

	return { pending, error, saved, run };
}

function ProfileSection({ profile }: { profile: ProfileRow | null }) {
	const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
	const [website, setWebsite] = useState(profile?.website ?? "");
	const { pending, error, saved, run } = useSectionStatus();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void run(() => updateProfile({ displayName, website }));
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Profile</h2>
			<form className={styles.form} onSubmit={handleSubmit}>
				<label className={styles.field}>
					<span className={styles.fieldLabel}>Display name</span>
					<input
						type="text"
						className={styles.input}
						value={displayName}
						maxLength={80}
						onChange={(event) => setDisplayName(event.target.value)}
					/>
				</label>
				<label className={styles.field}>
					<span className={styles.fieldLabel}>Website</span>
					<input
						type="url"
						className={styles.input}
						value={website}
						maxLength={200}
						placeholder="https://example.com"
						onChange={(event) => setWebsite(event.target.value)}
					/>
				</label>
				<div className={styles.actionsRow}>
					<button type="submit" className={styles.button} disabled={pending}>
						{pending ? "Saving" : "Save profile"}
					</button>
					{saved && (
						<span className={styles.savedNote} role="status">
							Saved.
						</span>
					)}
				</div>
				{error && (
					<p className={styles.errorNote} role="alert">
						{error}
					</p>
				)}
			</form>
		</section>
	);
}

function SubscriptionSection({
	subscription,
}: {
	subscription: SubscriptionRow | null;
}) {
	const [subscribePosts, setSubscribePosts] = useState(
		subscription?.subscribe_posts ?? false,
	);
	const [subscribeNotes, setSubscribeNotes] = useState(
		subscription?.subscribe_notes ?? false,
	);
	const { pending, error, saved, run } = useSectionStatus();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void run(() => upsertSubscription({ subscribePosts, subscribeNotes }));
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Subscribe to LMMs-Lab updates</h2>
			<p className={styles.sectionCopy}>
				Updates land in your account now. Email delivery is coming later.
			</p>
			<form className={styles.form} onSubmit={handleSubmit}>
				<label className={styles.checkboxField}>
					<input
						type="checkbox"
						className={styles.checkbox}
						checked={subscribePosts}
						onChange={(event) => setSubscribePosts(event.target.checked)}
					/>
					Project posts
				</label>
				<label className={styles.checkboxField}>
					<input
						type="checkbox"
						className={styles.checkbox}
						checked={subscribeNotes}
						onChange={(event) => setSubscribeNotes(event.target.checked)}
					/>
					Research notes
				</label>
				<div className={styles.actionsRow}>
					<button type="submit" className={styles.button} disabled={pending}>
						{pending ? "Saving" : "Save subscription"}
					</button>
					{saved && (
						<span className={styles.savedNote} role="status">
							Saved.
						</span>
					)}
				</div>
				{error && (
					<p className={styles.errorNote} role="alert">
						{error}
					</p>
				)}
			</form>
		</section>
	);
}

function CollaborationSection({
	role,
	requests,
}: {
	role: UserRole;
	requests: CollabRequestRow[];
}) {
	const [message, setMessage] = useState("");
	const { pending, error, saved, run } = useSectionStatus();

	if (role === "editor" || role === "admin") {
		return (
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Collaboration</h2>
				<p className={styles.sectionCopy}>You can publish posts and notes.</p>
				<div>
					<TransitionLink href="/studio/" className={styles.studioLink}>
						Open the studio
					</TransitionLink>
				</div>
			</section>
		);
	}

	const latest = requests[0] ?? null;
	// `saved` covers the gap until the revalidated request list arrives.
	const hasPendingRequest = latest?.status === "pending" || saved;

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void run(async () => {
			const result = await requestCollaboration({ message });
			if (result.ok) setMessage("");
			return result;
		});
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Collaboration</h2>
			<p className={styles.sectionCopy}>
				Want to publish on LMMs-Lab? Posts cover project releases and write-ups;
				notes cover scientific findings. Request collaborator access and an
				admin will review it.
			</p>
			{latest && (
				<p className={styles.requestStatus} role="status">
					Latest request:{" "}
					<span className={styles.requestStatusValue}>
						{STATUS_LABELS[latest.status]}
					</span>{" "}
					({formatDate(latest.decided_at ?? latest.created_at)})
				</p>
			)}
			{hasPendingRequest ? (
				<p className={styles.sectionCopy}>
					You already have a pending request. An admin will review it.
				</p>
			) : (
				<form className={styles.form} onSubmit={handleSubmit}>
					<label className={styles.field}>
						<span className={styles.fieldLabel}>
							Who you are and what you want to publish
						</span>
						<textarea
							className={styles.textarea}
							value={message}
							maxLength={2000}
							onChange={(event) => setMessage(event.target.value)}
						/>
					</label>
					<div className={styles.actionsRow}>
						<button type="submit" className={styles.button} disabled={pending}>
							{pending ? "Sending" : "Request access"}
						</button>
					</div>
					{error && (
						<p className={styles.errorNote} role="alert">
							{error}
						</p>
					)}
				</form>
			)}
		</section>
	);
}

export default function AccountClient({
	email,
	profile,
	subscription,
	requests,
}: {
	email: string | null;
	profile: ProfileRow | null;
	subscription: SubscriptionRow | null;
	requests: CollabRequestRow[];
}) {
	const role: UserRole = profile?.role ?? "reader";

	return (
		<div className={styles.content}>
			<header className={styles.pageHeader}>
				<div>
					<h1 className={styles.pageTitle}>Account</h1>
					{email && <p className={styles.pageMeta}>{email}</p>}
				</div>
				<form action={signOut}>
					<button type="submit" className={styles.secondaryButton}>
						Sign out
					</button>
				</form>
			</header>
			<ProfileSection profile={profile} />
			<SubscriptionSection subscription={subscription} />
			<CollaborationSection role={role} requests={requests} />
		</div>
	);
}

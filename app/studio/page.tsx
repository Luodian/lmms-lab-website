import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TransitionLink from "@/components/motion/TransitionLink";
import type { EntryKind, EntryStatus, UserRole } from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createEntry } from "./actions";
import styles from "./studio.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Studio - LMMs-Lab",
	robots: { index: false, follow: false },
};

interface StudioEntry {
	id: string;
	kind: EntryKind;
	slug: string;
	title: string;
	status: EntryStatus;
	updated_at: string;
	profiles: { display_name: string | null } | null;
}

function formatDate(value: string): string {
	return new Date(value).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function publicHref(entry: StudioEntry): string {
	return entry.kind === "post" ? `/posts/${entry.slug}/` : `/notes/${entry.slug}/`;
}

function EntryList({
	entries,
	showByline,
	emptyText,
}: {
	entries: StudioEntry[];
	showByline: boolean;
	emptyText: string;
}) {
	if (entries.length === 0) {
		return (
			<div className={styles.list}>
				<p className={styles.empty}>{emptyText}</p>
			</div>
		);
	}
	return (
		<div className={styles.list}>
			{entries.map((entry) => (
				<div className={styles.row} key={entry.id}>
					<div className={styles.rowMain}>
						<span className={styles.rowTitle}>{entry.title}</span>
						<span className={styles.rowSlug}>{entry.slug}</span>
						{showByline && entry.profiles?.display_name && (
							<span className={styles.rowByline}>by {entry.profiles.display_name}</span>
						)}
					</div>
					<div className={styles.rowMeta}>
						<span
							className={
								entry.status === "published"
									? `${styles.statusBadge} ${styles.statusPublished}`
									: styles.statusBadge
							}
						>
							{entry.status}
						</span>
						<span className={styles.rowDate}>{formatDate(entry.updated_at)}</span>
						<TransitionLink className={styles.rowLink} href={`/studio/edit/${entry.id}/`}>
							Edit
						</TransitionLink>
						{entry.status === "published" && (
							<TransitionLink className={styles.rowLink} href={publicHref(entry)}>
								View
							</TransitionLink>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default async function StudioPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const actionError = typeof params.error === "string" ? params.error : undefined;

	if (!isSupabaseConfigured()) {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Studio</h1>
					<div className={styles.panel}>
						<p className={styles.panelBody}>
							Publishing is not configured on this deployment. Set
							NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
							enable it.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect("/login");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.maybeSingle();
	const role = (profile?.role ?? "reader") as UserRole;

	if (role === "reader") {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Studio</h1>
					<div className={styles.panel}>
						<p className={styles.panelBody}>
							Publishing on LMMs-Lab is limited to lab members and approved
							collaborators. Request access from your account page.
						</p>
						<TransitionLink className={styles.panelLink} href="/account/">
							Go to your account page
						</TransitionLink>
					</div>
				</div>
			</div>
		);
	}

	const { data, error: listError } = await supabase
		.from("entries")
		.select("id, kind, slug, title, status, updated_at, profiles(display_name)")
		.order("updated_at", { ascending: false });

	const entries = (data ?? []) as unknown as StudioEntry[];
	const posts = entries.filter((entry) => entry.kind === "post");
	const notes = entries.filter((entry) => entry.kind === "note");
	const showByline = role === "admin";

	const newPost = createEntry.bind(null, "post" as EntryKind);
	const newNote = createEntry.bind(null, "note" as EntryKind);

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				<header className={styles.pageHeader}>
					<h1 className={styles.pageTitle}>Studio</h1>
					<p className={styles.pageHint}>
						Drafts stay private until you publish them.
					</p>
				</header>

				{actionError && <p className={styles.errorLine}>{actionError}</p>}
				{listError && <p className={styles.errorLine}>{listError.message}</p>}

				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeading}>
							<h2 className={styles.sectionTitle}>Posts</h2>
							<p className={styles.sectionSubtitle}>Project releases and write-ups.</p>
						</div>
						<form action={newPost}>
							<button className={styles.button} type="submit">
								New post
							</button>
						</form>
					</div>
					<EntryList entries={posts} showByline={showByline} emptyText="No posts yet." />
				</section>

				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeading}>
							<h2 className={styles.sectionTitle}>Notes</h2>
							<p className={styles.sectionSubtitle}>Scientific findings.</p>
						</div>
						<form action={newNote}>
							<button className={styles.button} type="submit">
								New note
							</button>
						</form>
					</div>
					<EntryList entries={notes} showByline={showByline} emptyText="No notes yet." />
				</section>
			</div>
		</div>
	);
}

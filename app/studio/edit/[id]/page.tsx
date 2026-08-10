import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditorClient } from "@/components/studio/EditorClient";
import type { EntryRow } from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import styles from "../../studio.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Edit entry - LMMs-Lab",
	robots: { index: false, follow: false },
};

export default async function EditEntryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	if (!isSupabaseConfigured()) {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Editor</h1>
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

	// RLS scopes this select: owners see their own entries, admins see all.
	const { data } = await supabase
		.from("entries")
		.select("id, kind, slug, title, description, content, tags, main_tags, thumbnail, status")
		.eq("id", id)
		.maybeSingle();

	if (!data) {
		notFound();
	}

	const entry = data as Pick<
		EntryRow,
		| "id"
		| "kind"
		| "slug"
		| "title"
		| "description"
		| "content"
		| "tags"
		| "main_tags"
		| "thumbnail"
		| "status"
	>;

	return (
		<EditorClient
			entry={{
				id: entry.id,
				kind: entry.kind,
				slug: entry.slug,
				title: entry.title,
				description: entry.description,
				content: entry.content,
				tags: entry.tags ?? [],
				main_tags: entry.main_tags ?? [],
				thumbnail: entry.thumbnail,
				status: entry.status,
			}}
		/>
	);
}

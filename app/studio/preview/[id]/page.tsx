import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MDXRemoteWrapper } from "@/components/mdx/MDXRemoteWrapper";
import type { EntryRow } from "@/lib/blog-db";
import { stripMdxImports, transformHtmlStyleToJsx } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import styles from "../../studio.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Preview - LMMs-Lab",
	robots: { index: false, follow: false },
};

export default async function PreviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	if (!isSupabaseConfigured()) {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Preview</h1>
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

	// RLS scopes this select: owners see their own drafts, admins see all.
	const { data } = await supabase
		.from("entries")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (!data) {
		notFound();
	}

	const entry = data as EntryRow;
	// Render the body exactly like the public post pages do.
	const source = transformHtmlStyleToJsx(stripMdxImports(entry.content));
	const date = new Date(entry.published_at ?? entry.created_at)
		.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
		.toUpperCase();
	const mainTags = entry.main_tags ?? [];

	return (
		<div className="blog-content-wrapper">
			<div className="blog-layout blog-layout-single">
				<main className="blog-main">
					<article className="blog-article">
						{entry.status !== "published" && (
							<p className={styles.previewBanner}>
								DRAFT PREVIEW. Only you can see this.
							</p>
						)}

						<header className="blog-header-grid">
							<div className="blog-header-meta">
								<div className="blog-meta-row">
									<time className="blog-date">{date}</time>
									{mainTags.length > 0 && (
										<>
											<span className="blog-meta-sep">/</span>
											<div className="blog-main-tags">
												{mainTags.map((tag) => (
													<span key={tag} className="blog-main-tag">
														{tag}
													</span>
												))}
											</div>
										</>
									)}
								</div>
							</div>

							<div className="blog-header-main">
								<h1 className="blog-title">{entry.title}</h1>
								{entry.description && (
									<p className="blog-description">{entry.description}</p>
								)}
							</div>
						</header>

						<div className="blog-prose">
							<MDXRemoteWrapper source={source} />
						</div>
					</article>
				</main>
			</div>
		</div>
	);
}

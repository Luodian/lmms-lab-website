import CommentsSection from "@/components/comments/CommentsSection";
import { MDXRemoteWrapper } from "@/components/mdx/MDXRemoteWrapper";
import { getPublishedDbEntryBySlug } from "@/lib/blog-db";
import { getAllNotes, getNoteBySlug, stripMdxImports, transformHtmlStyleToJsx } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
	const notes = getAllNotes();
	return notes.map((note) => ({
		slug: note.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const note = getNoteBySlug(slug);
	if (note) {
		return {
			title: `${note.title} - LMMs-Lab`,
			description: note.description,
			alternates: {
				canonical: `/notes/${slug}/`,
			},
		};
	}

	const entry = await getPublishedDbEntryBySlug("note", slug);
	if (!entry) {
		return {
			title: "Note Not Found",
			alternates: {
				canonical: "/notes/",
			},
		};
	}

	const metadata: Metadata = {
		title: `${entry.title} - LMMs-Lab`,
		description: entry.description,
		alternates: {
			canonical: `${SITE_URL}/notes/${slug}/`,
		},
	};
	if (entry.thumbnail) {
		metadata.openGraph = { images: [entry.thumbnail] };
		metadata.twitter = { card: "summary_large_image", images: [entry.thumbnail] };
	}
	return metadata;
}

export default async function NotePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const note = getNoteBySlug(slug);

	if (note) {
		return (
			<>
				<NoteArticle note={note} />
				<CommentsSection kind="note" slug={slug} />
			</>
		);
	}

	const entry = await getPublishedDbEntryBySlug("note", slug);
	if (!entry) {
		notFound();
	}

	return (
		<>
			<NoteArticle
				note={{
					...entry,
					content: transformHtmlStyleToJsx(stripMdxImports(entry.content)),
				}}
			/>
			<CommentsSection kind="note" slug={slug} />
		</>
	);
}

function NoteArticle({ note }: { note: Post }) {
	return (
		<div className="blog-content-wrapper">
			<div className="blog-layout blog-layout-single">
				<main className="blog-main">
					<article className="blog-article">
						<header className="blog-header-grid">
							<div className="blog-header-meta">
								<div className="blog-meta-group">
									<time className="blog-date">
										{new Date(note.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										}).toUpperCase()}
									</time>
								</div>

								{note.tags && note.tags.length > 0 && (
									<div className="blog-meta-group">
										<span className="opacity-50 mx-2">/</span>
										<div className="blog-main-tags">
											{note.tags.map((tag) => (
												<span key={tag} className="blog-main-tag">{tag}</span>
											))}
										</div>
									</div>
								)}
							</div>

							<div className="blog-header-main">
								<h1 className="blog-title">{note.title}</h1>

								{note.description && (
									<p className="blog-description">{note.description}</p>
								)}
							</div>
						</header>

						<div className="blog-prose">
							<MDXRemoteWrapper source={note.content} />
						</div>
					</article>
				</main>
			</div>
		</div>
	);
}

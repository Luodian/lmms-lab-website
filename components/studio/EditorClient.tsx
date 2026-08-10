"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	deleteEntry,
	publishEntry,
	saveEntry,
	unpublishEntry,
} from "@/app/studio/actions";
import TransitionLink from "@/components/motion/TransitionLink";
import type { EntryKind, EntryStatus } from "@/lib/blog-db";
import styles from "./EditorClient.module.css";

export interface EditorEntry {
	id: string;
	kind: EntryKind;
	slug: string;
	title: string;
	description: string | null;
	content: string;
	tags: string[];
	main_tags: string[];
	thumbnail: string | null;
	status: EntryStatus;
}

interface Message {
	tone: "error" | "success";
	text: string;
}

function parseTagList(value: string): string[] {
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

export function EditorClient({ entry }: { entry: EditorEntry }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [title, setTitle] = useState(entry.title);
	const [slug, setSlug] = useState(entry.slug);
	const [description, setDescription] = useState(entry.description ?? "");
	const [mainTags, setMainTags] = useState(entry.main_tags.join(", "));
	const [tags, setTags] = useState(entry.tags.join(", "));
	const [thumbnail, setThumbnail] = useState(entry.thumbnail ?? "");
	const [content, setContent] = useState(entry.content);
	const [status, setStatus] = useState<EntryStatus>(entry.status);
	const [message, setMessage] = useState<Message | null>(null);

	const urlBase = entry.kind === "post" ? "/posts/" : "/notes/";
	const urlPreview = `${urlBase}${slug.trim() || "your-slug"}/`;

	async function persist(): Promise<boolean> {
		const result = await saveEntry({
			id: entry.id,
			title,
			slug: slug.trim(),
			description,
			content,
			tags: parseTagList(tags),
			mainTags: parseTagList(mainTags),
			thumbnail: thumbnail.trim(),
		});
		if (!result.ok) {
			setMessage({ tone: "error", text: result.error ?? "Save failed." });
			return false;
		}
		return true;
	}

	function handleSave() {
		setMessage(null);
		startTransition(async () => {
			if (await persist()) {
				setMessage({
					tone: "success",
					text: status === "published" ? "Saved. The published page is updated." : "Draft saved.",
				});
				router.refresh();
			}
		});
	}

	function handlePublishToggle() {
		setMessage(null);
		startTransition(async () => {
			if (!(await persist())) return;
			const result =
				status === "published"
					? await unpublishEntry(entry.id)
					: await publishEntry(entry.id);
			if (!result.ok) {
				setMessage({
					tone: "error",
					text: result.error ?? "The status change failed.",
				});
				return;
			}
			const next: EntryStatus = status === "published" ? "draft" : "published";
			setStatus(next);
			setMessage({
				tone: "success",
				text:
					next === "published"
						? "Published. The entry is now public."
						: "Unpublished. The entry is a draft again.",
			});
			router.refresh();
		});
	}

	function handleDelete() {
		if (!window.confirm("Delete this entry? This cannot be undone.")) return;
		setMessage(null);
		startTransition(async () => {
			const result = await deleteEntry(entry.id);
			// On success the action redirects to /studio/, so only failures land here.
			if (result && !result.ok) {
				setMessage({ tone: "error", text: result.error ?? "Delete failed." });
			}
		});
	}

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				<div className={styles.topBar}>
					<TransitionLink className={styles.backLink} href="/studio/">
						Back to studio
					</TransitionLink>
					<span className={styles.kindLabel}>{entry.kind}</span>
					<span
						className={
							status === "published"
								? `${styles.statusBadge} ${styles.statusPublished}`
								: styles.statusBadge
						}
					>
						{status}
					</span>
				</div>

				<p className={styles.guidance}>
					Posts are for projects. Notes are for scientific findings.
				</p>

				<div className={styles.form}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="entry-title">
							Title
						</label>
						<input
							id="entry-title"
							className={`${styles.input} ${styles.titleInput}`}
							type="text"
							value={title}
							onChange={(event) => setTitle(event.target.value)}
						/>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="entry-slug">
							Slug
						</label>
						<input
							id="entry-slug"
							className={`${styles.input} ${styles.mono}`}
							type="text"
							value={slug}
							onChange={(event) => setSlug(event.target.value)}
							spellCheck={false}
							autoComplete="off"
						/>
						<p className={styles.fieldHint}>URL: {urlPreview}</p>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="entry-description">
							Description
						</label>
						<textarea
							id="entry-description"
							className={styles.textarea}
							rows={2}
							value={description}
							onChange={(event) => setDescription(event.target.value)}
						/>
					</div>

					<div className={styles.fieldGrid}>
						<div className={styles.field}>
							<label className={styles.label} htmlFor="entry-main-tags">
								Main tags
							</label>
							<input
								id="entry-main-tags"
								className={`${styles.input} ${styles.mono}`}
								type="text"
								value={mainTags}
								onChange={(event) => setMainTags(event.target.value)}
								spellCheck={false}
								autoComplete="off"
							/>
							<p className={styles.fieldHint}>Comma separated. Shown in the header.</p>
						</div>
						<div className={styles.field}>
							<label className={styles.label} htmlFor="entry-tags">
								Tags
							</label>
							<input
								id="entry-tags"
								className={`${styles.input} ${styles.mono}`}
								type="text"
								value={tags}
								onChange={(event) => setTags(event.target.value)}
								spellCheck={false}
								autoComplete="off"
							/>
							<p className={styles.fieldHint}>Comma separated. Used for filtering.</p>
						</div>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="entry-thumbnail">
							Thumbnail URL
						</label>
						<input
							id="entry-thumbnail"
							className={`${styles.input} ${styles.mono}`}
							type="text"
							value={thumbnail}
							onChange={(event) => setThumbnail(event.target.value)}
							spellCheck={false}
							autoComplete="off"
						/>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="entry-content">
							Content
						</label>
						<textarea
							id="entry-content"
							className={`${styles.textarea} ${styles.contentArea}`}
							value={content}
							onChange={(event) => setContent(event.target.value)}
							spellCheck={false}
						/>
					</div>

					<div className={styles.buttonRow}>
						<button
							type="button"
							className={`${styles.button} ${styles.buttonPrimary}`}
							onClick={handleSave}
							disabled={isPending}
						>
							{status === "published" ? "Save" : "Save draft"}
						</button>
						<button
							type="button"
							className={styles.button}
							onClick={handlePublishToggle}
							disabled={isPending}
						>
							{status === "published" ? "Unpublish" : "Publish"}
						</button>
						<a
							className={styles.button}
							href={`/studio/preview/${entry.id}/`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Preview
						</a>
						<span className={styles.buttonSpacer} aria-hidden="true" />
						<button
							type="button"
							className={`${styles.button} ${styles.buttonQuiet}`}
							onClick={handleDelete}
							disabled={isPending}
						>
							Delete
						</button>
					</div>

					{message && (
						<p
							role="status"
							className={
								message.tone === "error" ? styles.messageError : styles.messageSuccess
							}
						>
							{message.text}
						</p>
					)}

					<p className={styles.hint}>
						Format: Markdown with GFM tables, <code>$...$</code> and{" "}
						<code>$$...$$</code> math, and fenced code blocks with syntax
						highlighting. Site components such as <code>{"<Collapsible>"}</code>,{" "}
						<code>{"<ResponsiveImage>"}</code>, and <code>{"<ResourceCard>"}</code>{" "}
						work in the content. Preview shows the last saved version.
					</p>
				</div>
			</div>
		</div>
	);
}

"use client";

import {
	type FormEvent,
	useCallback,
	useEffect,
	useId,
	useState,
} from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import type { CommentRow, UserRole } from "@/lib/blog-db";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import styles from "./CommentsSection.module.css";

interface CommentsSectionProps {
	kind: "post" | "note";
	slug: string;
}

type AuthStatus = "loading" | "signed-out" | "signed-in";

const COMMENT_COLUMNS =
	"id, kind, slug, author_id, content, created_at, updated_at, profiles(display_name, avatar_url)";

const MAX_COMMENT_LENGTH = 4000;

// UTC timestamp as "YYYY-MM-DD HH:mm".
function formatUtcMinute(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	const pad = (part: number) => String(part).padStart(2, "0");
	return (
		`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
		` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
	);
}

export default function CommentsSection({ kind, slug }: CommentsSectionProps) {
	const configured = isSupabaseConfigured();
	const commentFieldId = useId();
	const [comments, setComments] = useState<CommentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
	const [userId, setUserId] = useState<string | null>(null);
	const [role, setRole] = useState<UserRole>("reader");
	const [draft, setDraft] = useState("");
	const [pending, setPending] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	const fetchComments = useCallback(async () => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("comments")
			.select(COMMENT_COLUMNS)
			.eq("kind", kind)
			.eq("slug", slug)
			.order("created_at", { ascending: true });
		if (error) {
			console.error(
				`[comments] loading comments for ${kind} "${slug}" failed: ${error.message}`,
			);
			setLoadError("Comments could not be loaded.");
			return;
		}
		setLoadError(null);
		setComments((data as unknown as CommentRow[]) ?? []);
	}, [kind, slug]);

	useEffect(() => {
		if (!configured) return;
		setLoading(true);
		void fetchComments().finally(() => setLoading(false));
	}, [configured, fetchComments]);

	useEffect(() => {
		if (!configured) return;
		const supabase = createClient();
		let cancelled = false;

		async function loadRole(currentUserId: string) {
			const { data, error } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", currentUserId)
				.maybeSingle();
			if (error) {
				console.error(`[comments] loading profile failed: ${error.message}`);
				return;
			}
			if (!cancelled) {
				setRole((data as { role: UserRole } | null)?.role ?? "reader");
			}
		}

		function applyUser(nextUser: { id: string } | null) {
			if (cancelled) return;
			if (nextUser) {
				setUserId(nextUser.id);
				setAuthStatus("signed-in");
				// Deferred: supabase-js can deadlock on queries issued
				// synchronously inside onAuthStateChange callbacks.
				const currentUserId = nextUser.id;
				window.setTimeout(() => void loadRole(currentUserId), 0);
			} else {
				setUserId(null);
				setRole("reader");
				setAuthStatus("signed-out");
			}
		}

		void supabase.auth.getUser().then(({ data }) => applyUser(data.user));

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			applyUser(session?.user ?? null);
		});

		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, [configured]);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!userId) return;
			const content = draft.trim();
			if (!content) {
				setActionError("Write a comment first.");
				return;
			}
			setPending(true);
			setActionError(null);
			const supabase = createClient();
			const { error } = await supabase
				.from("comments")
				.insert({ kind, slug, author_id: userId, content });
			if (error) {
				console.error(`[comments] posting comment failed: ${error.message}`);
				setActionError("Posting the comment failed. Try again.");
				setPending(false);
				return;
			}
			setDraft("");
			await fetchComments();
			setPending(false);
		},
		[draft, fetchComments, kind, slug, userId],
	);

	const handleDelete = useCallback(
		async (commentId: string) => {
			if (!window.confirm("Delete this comment?")) return;
			setActionError(null);
			const supabase = createClient();
			const { error } = await supabase
				.from("comments")
				.delete()
				.eq("id", commentId);
			if (error) {
				console.error(`[comments] deleting comment failed: ${error.message}`);
				setActionError("Deleting the comment failed. Try again.");
				return;
			}
			// Refetch instead of filtering locally so the list stays truthful
			// even when RLS quietly matched zero rows.
			await fetchComments();
		},
		[fetchComments],
	);

	if (!configured) return null;

	const entryPath = kind === "post" ? `/posts/${slug}/` : `/notes/${slug}/`;
	const signInHref = `/login/?next=${encodeURIComponent(entryPath)}`;

	return (
		<section className={styles.section} aria-label="Comments">
			<h2 className={styles.heading}>
				Comments
				{!loading && !loadError && (
					<span className={styles.count}>{comments.length}</span>
				)}
			</h2>

			{loading && <p className={styles.quiet}>Loading</p>}

			{!loading && loadError && (
				<p className={styles.error} role="alert">
					{loadError}
				</p>
			)}

			{!loading && !loadError && comments.length === 0 && (
				<p className={styles.quiet}>No comments yet.</p>
			)}

			{!loading && !loadError && comments.length > 0 && (
				<ul className={styles.list}>
					{comments.map((comment) => {
						const authorName = comment.profiles?.display_name || "Member";
						const initial = authorName.charAt(0).toUpperCase() || "M";
						const canDelete =
							userId === comment.author_id || role === "admin";
						return (
							<li key={comment.id} className={styles.comment}>
								<div className={styles.commentHeader}>
									{comment.profiles?.avatar_url ? (
										<img
											src={comment.profiles.avatar_url}
											alt=""
											width={32}
											height={32}
											referrerPolicy="no-referrer"
											className={styles.avatar}
										/>
									) : (
										<span className={styles.initial} aria-hidden="true">
											{initial}
										</span>
									)}
									<span className={styles.author}>{authorName}</span>
									<time
										className={styles.timestamp}
										dateTime={comment.created_at}
									>
										{formatUtcMinute(comment.created_at)}
									</time>
									{canDelete && (
										<button
											type="button"
											className={styles.delete}
											onClick={() => void handleDelete(comment.id)}
										>
											Delete
										</button>
									)}
								</div>
								<p className={styles.content}>{comment.content}</p>
							</li>
						);
					})}
				</ul>
			)}

			{authStatus === "signed-in" && (
				<form
					className={styles.form}
					onSubmit={(event) => void handleSubmit(event)}
				>
					<label className={styles.label} htmlFor={commentFieldId}>
						Write a comment
					</label>
					<textarea
						id={commentFieldId}
						className={styles.textarea}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						maxLength={MAX_COMMENT_LENGTH}
						disabled={pending}
						rows={4}
					/>
					{actionError && (
						<p className={styles.error} role="alert">
							{actionError}
						</p>
					)}
					<button type="submit" className={styles.submit} disabled={pending}>
						Post comment
					</button>
				</form>
			)}

			{authStatus === "signed-out" && (
				<div className={styles.signedOut}>
					<TransitionLink href={signInHref} className={styles.signInLink}>
						Sign in
					</TransitionLink>
					<span>to join the discussion.</span>
				</div>
			)}
		</section>
	);
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { CUSTOM_PAGES } from "./links";
import type { Author, Post } from "./posts";
import { getAllNotes, getAllPosts } from "./posts";
import {
	isSupabaseConfigured,
	supabaseAnonKey,
	supabaseUrl,
} from "./supabase/config";

export type EntryKind = "post" | "note";
export type EntryStatus = "draft" | "published";
export type UserRole = "reader" | "editor" | "admin";

export interface ProfileRow {
	id: string;
	display_name: string | null;
	avatar_url: string | null;
	website: string | null;
	role: UserRole;
	created_at: string;
	updated_at: string;
}

export interface EntryRow {
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
	author_id: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	profiles?: Pick<ProfileRow, "display_name" | "website"> | null;
}

export interface SubscriptionRow {
	user_id: string;
	subscribe_posts: boolean;
	subscribe_notes: boolean;
	created_at: string;
	updated_at: string;
}

export type CollabRequestStatus = "pending" | "approved" | "declined";

export interface CollabRequestRow {
	id: string;
	user_id: string;
	message: string;
	status: CollabRequestStatus;
	created_at: string;
	decided_by: string | null;
	decided_at: string | null;
	profiles?: Pick<ProfileRow, "display_name"> | null;
}

export interface DbPost extends Post {
	entryId: string;
	source: "db";
}

// Public reads use a bare anon-key client (no cookies) so the pages that call
// them stay ISR-cacheable; RLS exposes only published entries to that key.
function anonClient() {
	return createSupabaseClient(supabaseUrl(), supabaseAnonKey(), {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}

function toIso(value: string | null | undefined): string {
	return value ? new Date(value).toISOString() : new Date().toISOString();
}

export function entryRowToPost(row: EntryRow): DbPost {
	const authors: Author[] = row.profiles?.display_name
		? [{ name: row.profiles.display_name, url: row.profiles.website ?? undefined }]
		: [];
	return {
		entryId: row.id,
		source: "db",
		slug: row.slug,
		title: row.title,
		date: toIso(row.published_at ?? row.created_at),
		description: row.description ?? "",
		mainTags: row.main_tags ?? [],
		tags: row.tags ?? [],
		thumbnail: row.thumbnail ?? undefined,
		authors,
		content: row.content,
	};
}

const LIST_COLUMNS =
	"id, kind, slug, title, description, tags, main_tags, thumbnail, status, author_id, published_at, created_at, updated_at, profiles(display_name, website)";

export async function getPublishedDbEntries(kind: EntryKind): Promise<DbPost[]> {
	if (!isSupabaseConfigured()) return [];
	// Failures degrade to MDX-only pages (loudly) instead of a 500: public
	// routes must survive the database being unreachable.
	try {
		const { data, error } = await anonClient()
			.from("entries")
			.select(LIST_COLUMNS)
			.eq("kind", kind)
			.eq("status", "published")
			.order("published_at", { ascending: false, nullsFirst: false });
		if (error) {
			console.error(
				`[blog-db] listing published ${kind} entries failed: ${error.message}`,
			);
			return [];
		}
		return (data as unknown as EntryRow[]).map((row) =>
			entryRowToPost({ ...row, content: "" }),
		);
	} catch (err) {
		console.error(
			`[blog-db] listing published ${kind} entries failed: ${err instanceof Error ? err.message : String(err)}`,
		);
		return [];
	}
}

export async function getPublishedDbEntryBySlug(
	kind: EntryKind,
	slug: string,
): Promise<DbPost | null> {
	if (!isSupabaseConfigured()) return null;
	try {
		const { data, error } = await anonClient()
			.from("entries")
			.select("*, profiles(display_name, website)")
			.eq("kind", kind)
			.eq("slug", slug)
			.eq("status", "published")
			.maybeSingle();
		if (error) {
			console.error(
				`[blog-db] loading ${kind} "${slug}" failed: ${error.message}`,
			);
			return null;
		}
		return data ? entryRowToPost(data as unknown as EntryRow) : null;
	} catch (err) {
		console.error(
			`[blog-db] loading ${kind} "${slug}" failed: ${err instanceof Error ? err.message : String(err)}`,
		);
		return null;
	}
}

// Must stay in sync with the entries_slug_format check constraint in
// supabase/migrations/0001_blog_system.sql.
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]{1,98}[a-z0-9]$/;

// Slugs owned by git-tracked MDX files or hand-routed custom pages; DB entries
// must not shadow them because file and custom lookups win at render time.
export function getReservedSlugs(kind: EntryKind): Set<string> {
	const reserved = new Set<string>();
	if (kind === "post") {
		for (const post of getAllPosts()) reserved.add(post.slug);
		for (const slug of Object.keys(CUSTOM_PAGES)) reserved.add(slug);
	} else {
		for (const note of getAllNotes()) reserved.add(note.slug);
	}
	return reserved;
}

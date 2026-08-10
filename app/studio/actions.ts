"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EntryKind, EntryStatus } from "@/lib/blog-db";
import { getReservedSlugs, SLUG_PATTERN } from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
	ok: boolean;
	error?: string;
}

export interface SaveEntryInput {
	id: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	tags: string[];
	mainTags: string[];
	thumbnail: string;
}

function publicPath(kind: EntryKind, slug: string): string {
	return kind === "post" ? `/posts/${slug}` : `/notes/${slug}`;
}

// The public lists are ISR-cached, so every mutation invalidates both list
// pages plus the public path of every slug the entry touched.
function revalidateEntryPaths(kind: EntryKind, slugs: string[]) {
	revalidatePath("/posts");
	revalidatePath("/notes");
	for (const slug of new Set(slugs)) {
		if (slug) revalidatePath(publicPath(kind, slug));
	}
}

function cleanTags(tags: string[]): string[] {
	return tags.map((tag) => tag.trim()).filter(Boolean);
}

async function requireUser() {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return { supabase, user };
}

export async function createEntry(kind: EntryKind): Promise<void> {
	if (kind !== "post" && kind !== "note") {
		redirect("/studio/");
	}
	if (!isSupabaseConfigured()) {
		redirect(`/studio/?error=${encodeURIComponent("publishing is not configured")}`);
	}
	const { supabase, user } = await requireUser();
	if (!user) {
		redirect("/login");
	}

	const { data, error } = await supabase
		.from("entries")
		.insert({
			kind,
			title: "Untitled",
			slug: `draft-${randomUUID().slice(0, 8)}`,
			author_id: user.id,
		})
		.select("id")
		.single();

	if (error || !data) {
		redirect(
			`/studio/?error=${encodeURIComponent(error?.message ?? "could not create the draft")}`,
		);
	}

	redirect(`/studio/edit/${data.id}/`);
}

export async function saveEntry(input: SaveEntryInput): Promise<ActionResult> {
	if (!isSupabaseConfigured()) {
		return { ok: false, error: "publishing is not configured" };
	}
	const { supabase, user } = await requireUser();
	if (!user) {
		return { ok: false, error: "you are signed out; sign in again" };
	}

	const title = input.title.trim();
	if (!title) {
		return { ok: false, error: "title is required" };
	}

	const slug = input.slug.trim();
	if (!SLUG_PATTERN.test(slug)) {
		return {
			ok: false,
			error:
				"slug must be 3 to 100 characters of lowercase letters, digits, dots, underscores, or hyphens, and start with a letter or digit",
		};
	}

	// RLS scopes this select to entries the user may edit.
	const { data: existing, error: loadError } = await supabase
		.from("entries")
		.select("id, kind, slug")
		.eq("id", input.id)
		.maybeSingle();
	if (loadError) {
		return { ok: false, error: loadError.message };
	}
	if (!existing) {
		return { ok: false, error: "entry not found" };
	}

	const kind = existing.kind as EntryKind;
	if (getReservedSlugs(kind).has(slug)) {
		return { ok: false, error: "this slug is taken by an existing site page" };
	}

	const { error } = await supabase
		.from("entries")
		.update({
			title,
			slug,
			description: input.description.trim() || null,
			content: input.content,
			tags: cleanTags(input.tags),
			main_tags: cleanTags(input.mainTags),
			thumbnail: input.thumbnail.trim() || null,
		})
		.eq("id", input.id);

	if (error) {
		if (error.code === "23505") {
			return { ok: false, error: "slug already in use" };
		}
		if (error.code === "23514") {
			return { ok: false, error: "slug must start and end with a letter or digit" };
		}
		return { ok: false, error: error.message };
	}

	revalidateEntryPaths(kind, [existing.slug as string, slug]);
	return { ok: true };
}

async function setEntryStatus(id: string, status: EntryStatus): Promise<ActionResult> {
	if (!isSupabaseConfigured()) {
		return { ok: false, error: "publishing is not configured" };
	}
	const { supabase, user } = await requireUser();
	if (!user) {
		return { ok: false, error: "you are signed out; sign in again" };
	}

	const { data, error } = await supabase
		.from("entries")
		.update({ status })
		.eq("id", id)
		.select("kind, slug")
		.maybeSingle();
	if (error) {
		return { ok: false, error: error.message };
	}
	if (!data) {
		return { ok: false, error: "entry not found" };
	}

	revalidateEntryPaths(data.kind as EntryKind, [data.slug as string]);
	return { ok: true };
}

export async function publishEntry(id: string): Promise<ActionResult> {
	return setEntryStatus(id, "published");
}

export async function unpublishEntry(id: string): Promise<ActionResult> {
	return setEntryStatus(id, "draft");
}

export async function deleteEntry(id: string): Promise<ActionResult> {
	if (!isSupabaseConfigured()) {
		return { ok: false, error: "publishing is not configured" };
	}
	const { supabase, user } = await requireUser();
	if (!user) {
		return { ok: false, error: "you are signed out; sign in again" };
	}

	const { data, error } = await supabase
		.from("entries")
		.delete()
		.eq("id", id)
		.select("kind, slug")
		.maybeSingle();
	if (error) {
		return { ok: false, error: error.message };
	}
	if (!data) {
		return { ok: false, error: "entry not found" };
	}

	revalidateEntryPaths(data.kind as EntryKind, [data.slug as string]);
	redirect("/studio/");
}

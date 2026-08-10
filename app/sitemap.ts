import type { MetadataRoute } from "next";
import { getPublishedDbEntries } from "@/lib/blog-db";
import { getAllNotes, getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const STATIC_PAGES: Array<{
	path: string;
	changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
	priority: number;
}> = [
	{ path: "/", changeFrequency: "weekly", priority: 1 },
	{ path: "/posts/", changeFrequency: "daily", priority: 0.9 },
	{ path: "/notes/", changeFrequency: "weekly", priority: 0.8 },
	{ path: "/about/", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();

	const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
		url: new URL(page.path, SITE_URL).toString(),
		lastModified: now,
		changeFrequency: page.changeFrequency,
		priority: page.priority,
	}));

	const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
		url: new URL(`/posts/${post.slug}/`, SITE_URL).toString(),
		lastModified: new Date(post.date),
		changeFrequency: "monthly",
		priority: 0.7,
	}));

	const noteEntries: MetadataRoute.Sitemap = getAllNotes().map((note) => ({
		url: new URL(`/notes/${note.slug}/`, SITE_URL).toString(),
		lastModified: new Date(note.date),
		changeFrequency: "monthly",
		priority: 0.5,
	}));

	const dbPostEntries: MetadataRoute.Sitemap = (await getPublishedDbEntries("post")).map((post) => ({
		url: new URL(`/posts/${post.slug}/`, SITE_URL).toString(),
		lastModified: new Date(post.date),
		changeFrequency: "monthly",
		priority: 0.7,
	}));

	const dbNoteEntries: MetadataRoute.Sitemap = (await getPublishedDbEntries("note")).map((note) => ({
		url: new URL(`/notes/${note.slug}/`, SITE_URL).toString(),
		lastModified: new Date(note.date),
		changeFrequency: "monthly",
		priority: 0.5,
	}));

	return [...staticEntries, ...postEntries, ...noteEntries, ...dbPostEntries, ...dbNoteEntries];
}

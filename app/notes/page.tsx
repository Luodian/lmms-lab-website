import type { Metadata } from "next";
import { PublishNotice } from "@/components/blog/PublishNotice";
import { getPublishedDbEntries } from "@/lib/blog-db";
import { getAllNotes } from "@/lib/posts";
import { NotesClient } from "./NotesClient";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Notes - LMMs-Lab",
	description: "Quick notes and thoughts from LMMs-Lab",
	alternates: {
		canonical: "/notes/",
	},
};

export default async function NotesPage() {
	const notes = getAllNotes();
	const dbNotes = await getPublishedDbEntries("note");
	const fileSlugs = new Set(notes.map((note) => note.slug));
	const allNotes = [
		...notes,
		...dbNotes.filter((note) => !fileSlugs.has(note.slug)),
	].sort((a, b) => (a.date > b.date ? -1 : 1));

	return (
		<>
			<NotesClient notes={allNotes} />
			<PublishNotice />
		</>
	);
}

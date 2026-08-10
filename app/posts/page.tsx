import type { Metadata } from "next";
import { PublishNotice } from "@/components/blog/PublishNotice";
import { getPublishedDbEntries } from "@/lib/blog-db";
import { getAllPosts } from "@/lib/posts";
import { PostsClient } from "./PostsClient";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Posts - LMMs-Lab",
	description: "Blog posts from LMMs-Lab research team",
	alternates: {
		canonical: "/posts/",
	},
};

export default async function PostsPage() {
	const posts = getAllPosts();

	const dbPosts = await getPublishedDbEntries("post");
	const fileSlugs = new Set(posts.map((post) => post.slug));
	const allPosts = [
		...posts,
		...dbPosts.filter((post) => !fileSlugs.has(post.slug)),
	].sort((a, b) => (a.date > b.date ? -1 : 1));

	return (
		<>
			<PostsClient posts={allPosts} />
			<PublishNotice />
		</>
	);
}

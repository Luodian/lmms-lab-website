import type { Metadata } from "next";
import { PublishNotice } from "@/components/blog/PublishNotice";
import { getPublishedDbEntries } from "@/lib/blog-db";
import { getAllPosts } from "@/lib/posts";
import { PostsClient } from "./PostsClient";
import type { Post } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Posts - LMMs-Lab",
	description: "Blog posts from LMMs-Lab research team",
	alternates: {
		canonical: "/posts/",
	},
};

const ONEVISION_ENCODER_ARCHIVE_ENTRY: Post = {
	slug: "onevision_encoder",
	title: "OneVision Encoder: Codec-Aligned Sparsity as a Foundational Principle for Multimodal Intelligence",
	description:
		"Our hypothesis: AGI is a compression problem. We introduce Codec Patchification that processes only 3.1%-25% of regions, achieving 4.1% improvement on video tasks while outperforming Qwen3-ViT and SigLIP2.",
	date: "2026-01-15T00:00:00.000Z",
	mainTags: ["models"],
	tags: ["models", "multimodal"],
	thumbnail: "/images/blog_thumbnails/onevision_encoder.png",
	content: "",
};

export default async function PostsPage() {
	const posts = getAllPosts();
	const postsWithOneVision = posts.some((post) => post.slug === ONEVISION_ENCODER_ARCHIVE_ENTRY.slug)
		? posts
		: [ONEVISION_ENCODER_ARCHIVE_ENTRY, ...posts];

	const dbPosts = await getPublishedDbEntries("post");
	const fileSlugs = new Set(postsWithOneVision.map((post) => post.slug));
	const allPosts = [
		...postsWithOneVision,
		...dbPosts.filter((post) => !fileSlugs.has(post.slug)),
	].sort((a, b) => (a.date > b.date ? -1 : 1));

	return (
		<>
			<PostsClient posts={allPosts} />
			<PublishNotice />
		</>
	);
}

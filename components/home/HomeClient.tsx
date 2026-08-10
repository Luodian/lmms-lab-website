"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CollectionSection } from "@/components/home/CollectionSection";
import type { Post } from "@/lib/posts";

const FEATURED_FALLBACK: Post = {
	slug: "llava_onevision_2",
	title: "LLaVA-OneVision-2: Towards Next-Generation Perceptual Intelligence",
	description:
		"The next generation of fully-open multimodal training — pushing the boundary of recipe transparency, native-resolution understanding, and end-to-end reproducibility.",
	date: "2026-04-20T00:00:00.000Z",
	mainTags: ["models"],
	tags: ["models", "multimodal", "video", "codec"],
	thumbnail: "/images/blog_thumbnails/llava_onevision_2.png",
	content: "",
};

const RECENT_PINNED_SLUGS = [
	"onevision_encoder",
	"llava_onevision_1_5",
	"longvt",
	"openmmreasoner",
];

interface HomeClientProps {
	posts: Post[];
}

export default function HomeClient({ posts }: HomeClientProps) {
	const postMap = new Map(posts.map((p) => [p.slug, p]));
	const featuredPost = postMap.get(FEATURED_FALLBACK.slug) ?? FEATURED_FALLBACK;
	const recentPosts = RECENT_PINNED_SLUGS.map((slug) => postMap.get(slug)).filter(Boolean) as Post[];

	return (
		<div className="museum-home">
			<HeroSection />

			<FeaturedSection featuredPost={featuredPost} />

			<CollectionSection posts={recentPosts} />
		</div>
	);
}

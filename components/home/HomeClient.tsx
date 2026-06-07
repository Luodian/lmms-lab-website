"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CollectionSection } from "@/components/home/CollectionSection";
import OneVisionEncoderPreloader from "@/components/preload/OneVisionEncoderPreloader";
import type { Post } from "@/lib/posts";

const ONEVISION_ENCODER_PINNED: Post = {
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
	if (!postMap.has(ONEVISION_ENCODER_PINNED.slug)) {
		postMap.set(ONEVISION_ENCODER_PINNED.slug, ONEVISION_ENCODER_PINNED);
	}
	const featuredPost = postMap.get(FEATURED_FALLBACK.slug) ?? FEATURED_FALLBACK;
	const recentPosts = RECENT_PINNED_SLUGS.map((slug) => postMap.get(slug)).filter(Boolean) as Post[];

	return (
		<div className="museum-home">
			<OneVisionEncoderPreloader />
			<HeroSection />

			<FeaturedSection featuredPost={featuredPost} />

			<CollectionSection posts={recentPosts} />
		</div>
	);
}

"use client";

import { PostThumbnail } from "@/components/blog/PostThumbnail";
import TransitionLink from "@/components/motion/TransitionLink";
import { getPostHref } from "@/lib/links";
import type { Post } from "@/lib/posts";

interface FeaturedSectionProps {
	featuredPost: Post;
}

export function FeaturedSection({ featuredPost }: FeaturedSectionProps) {
	if (!featuredPost) return null;
	const href = getPostHref(featuredPost.slug);

	return (
		<section className="museum-featured dashboard-surface">
			<div className="museum-section-header">
				<span className="museum-section-label">Featured Research</span>
				<div className="museum-section-line" />
			</div>

			<TransitionLink 
				href={href} 
				className="museum-featured-card card-lift"
				style={{ width: '100%', display: 'block' }}
				aria-label={`Read featured article: ${featuredPost.title}`}
			>
				<div className="museum-featured-image">
					<PostThumbnail
						title={featuredPost.title}
						seed={featuredPost.slug}
						hideTitle
						thumbnail={featuredPost.thumbnail}
					/>
				</div>
				<div className="museum-featured-content">
					<time className="museum-featured-date">
						{new Date(featuredPost.date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						}).toUpperCase()}
					</time>
					<h2 className="museum-featured-title">
						{featuredPost.title.includes(": ") ? (
							<>{featuredPost.title.split(": ")[0]}:<br />{featuredPost.title.split(": ").slice(1).join(": ")}</>
						) : featuredPost.title}
					</h2>
					<div className="museum-featured-tags">
						{featuredPost.mainTags?.map((tag) => (
							<span key={tag} className="museum-tag">{tag}</span>
						))}
					</div>
					
					<div className="mt-6">
						<span className="museum-btn-secondary">
							Read Paper
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</span>
					</div>
				</div>
			</TransitionLink>
		</section>
	);
}

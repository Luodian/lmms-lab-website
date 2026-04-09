import { MDXRemoteWrapper } from "@/components/mdx/MDXRemoteWrapper";
import { TableOfContents, MobileTableOfContents, ReadingProgress } from "@/components/blog";
import { extractHeadings } from "@/lib/toc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LlavaOV15Page from "./llava-ov-1-5";
import LlavaOV15RLPage from "./llava-ov-1-5-rl";
import LongVTPage from "./longvt";

export async function generateStaticParams() {
	const posts = getAllPosts();
	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) {
		return {
			title: "Post Not Found",
			alternates: {
				canonical: "/posts/",
			},
		};
	}

	return {
		title: `${post.title} - LMMs-Lab`,
		description: post.description,
		alternates: {
			canonical: `/posts/${slug}/`,
		},
	};
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	if (slug === "llava_onevision_1.5_rl") {
		return <LlavaOV15RLPage post={post} />;
	}
	if (slug === "longvt") {
		return <LongVTPage post={post} />;
	}

	if (!post) {
		notFound();
	}

	const headings = extractHeadings(post.content);

	return (
		<>
			<ReadingProgress />
			<div className="blog-content-wrapper">
				<div className="blog-layout">
					<aside className="blog-sidebar">
						<TableOfContents headings={headings} />
					</aside>

					<main className="blog-main">
						<article className="blog-article">
							<header className="blog-header-grid">
								<div className="blog-header-meta">
									<div className="blog-meta-row">
										<time className="blog-date">
											{new Date(post.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											}).toUpperCase()}
										</time>
										{post.mainTags && post.mainTags.length > 0 && (
											<>
												<span className="blog-meta-sep">/</span>
												<div className="blog-main-tags">
													{post.mainTags.map((tag) => (
														<span key={tag} className="blog-main-tag">{tag}</span>
													))}
												</div>
											</>
										)}
									</div>

									{post.authors && post.authors.length > 0 && (
										<div className="blog-authors">
											{post.authors.map((author, i) => (
												<span key={author.name} className="blog-author">
													{author.url ? (
														<a href={author.url} target="_blank" rel="noopener noreferrer">
															{author.name}
														</a>
													) : (
														author.name
													)}
													{author.main && <span className="author-main">*</span>}
													{i < post.authors!.length - 1 && ","}
												</span>
											))}
										</div>
									)}
								</div>

								<div className="blog-header-main">
									<h1 className="blog-title">{post.title}</h1>
								</div>
							</header>

							<MobileTableOfContents headings={headings} />

							<div className="blog-prose">
								<MDXRemoteWrapper source={post.content} />
							</div>
						</article>
					</main>
				</div>
			</div>
		</>
	);
}

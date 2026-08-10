export const CUSTOM_PAGES: Record<string, string> = {
	onevision_encoder: "/onevision-encoder/",
};

export function getPostHref(slug: string): string {
	return CUSTOM_PAGES[slug] ?? `/posts/${slug}/`;
}

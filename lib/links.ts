export const CUSTOM_PAGES: Record<string, string> = {};

export function getPostHref(slug: string): string {
	return CUSTOM_PAGES[slug] ?? `/posts/${slug}/`;
}

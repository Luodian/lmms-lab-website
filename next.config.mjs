import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
	trailingSlash: true,
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	// `/animation/` is hand-written HTML in `public/`. The old static-export
	// hosting resolved `<dir>/` to `<dir>/index.html` automatically; the Next
	// server does not, so map it explicitly.
	async rewrites() {
		return [
			{
				source: "/animation",
				destination: "/animation/index.html",
			},
			{
				source: "/animation/",
				destination: "/animation/index.html",
			},
		];
	},
	// The OneVision Encoder page moved into the blog at /posts/onevision_encoder/.
	// Exact-match sources keep /onevision-encoder/images/* serving as before.
	async redirects() {
		return [
			{
				source: "/onevision-encoder",
				destination: "/posts/onevision_encoder/",
				permanent: true,
			},
			{
				source: "/onevision-encoder/",
				destination: "/posts/onevision_encoder/",
				permanent: true,
			},
		];
	},
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);

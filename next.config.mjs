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
	// `/onevision-encoder/` and `/animation/` are hand-written HTML in `public/`.
	// The old static-export hosting resolved `<dir>/` to `<dir>/index.html`
	// automatically; the Next server does not, so map them explicitly.
	async rewrites() {
		return [
			{
				source: "/onevision-encoder",
				destination: "/onevision-encoder/index.html",
			},
			{
				source: "/onevision-encoder/",
				destination: "/onevision-encoder/index.html",
			},
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
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);

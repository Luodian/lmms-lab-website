import createMDX from "@next/mdx";

const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
	output: "export",
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
	// Dev-only: production uses static export where `/onevision-encoder/` resolves to
	// `public/onevision-encoder/index.html` automatically. `next dev` does not, so we
	// rewrite the trailing-slash URL onto the actual file. Ignored during `next build`
	// (export mode) without affecting the production output.
	...(isDev
		? {
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
					];
				},
			}
		: {}),
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);

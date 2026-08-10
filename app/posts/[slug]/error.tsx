"use client";

export default function PostError({ reset }: { error: Error; reset: () => void }) {
	return (
		<div
			style={{
				maxWidth: "42rem",
				margin: "0 auto",
				padding: "var(--space-xl) var(--space-md)",
				fontFamily: "var(--font-mono)",
			}}
		>
			<h1 style={{ fontSize: "var(--text-heading)", marginBottom: "var(--space-sm)" }}>
				This post failed to render
			</h1>
			<p style={{ fontSize: "var(--text-body)", marginBottom: "var(--space-md)" }}>
				The content could not be displayed. If this entry was published
				recently, its Markdown may be invalid. The author can fix it in
				the studio.
			</p>
			<p style={{ fontSize: "var(--text-body)" }}>
				<button
					type="button"
					onClick={reset}
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "var(--text-body)",
						background: "transparent",
						color: "inherit",
						border: "var(--border-thin) solid currentColor",
						padding: "var(--space-xs) var(--space-sm)",
						cursor: "pointer",
						marginRight: "var(--space-md)",
					}}
				>
					Try again
				</button>
				<a href="/posts/">Back to posts</a>
			</p>
		</div>
	);
}

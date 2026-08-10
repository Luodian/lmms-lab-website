import type { CSSProperties } from "react";
import TransitionLink from "@/components/motion/TransitionLink";

const INLINE_LINK_STYLE: CSSProperties = { display: "inline-block" };

export function PublishNotice() {
	return (
		<div
			style={{
				maxWidth: "80rem",
				margin: "0 auto var(--space-xl)",
				padding: "0 var(--space-md)",
				textAlign: "center",
				fontFamily: "var(--font-mono)",
				fontSize: "var(--text-caption)",
				letterSpacing: "0.05em",
				opacity: 0.5,
			}}
		>
			Posts and notes are published by LMMs-Lab and approved collaborators —{" "}
			<TransitionLink href="/login/" style={INLINE_LINK_STYLE}>
				sign in
			</TransitionLink>{" "}
			to subscribe, or request to publish from your{" "}
			<TransitionLink href="/account/" style={INLINE_LINK_STYLE}>
				account
			</TransitionLink>
			.
		</div>
	);
}

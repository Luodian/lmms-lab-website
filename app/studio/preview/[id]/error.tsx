"use client";

import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import styles from "../../studio.module.css";

export default function PreviewError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [, startTransition] = useTransition();

	function retry() {
		// Refresh the server data before re-rendering, so a fix saved in the
		// editor tab shows up on retry.
		startTransition(() => {
			router.refresh();
			reset();
		});
	}

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				<h1 className={styles.pageTitle}>Preview failed</h1>
				<div className={styles.panel}>
					<p className={styles.panelBody}>
						This draft failed to render. Check your Markdown/MDX syntax.
					</p>
					<button className={styles.button} type="button" onClick={retry}>
						Try again
					</button>
					<TransitionLink
						className={styles.panelLink}
						href={`/studio/edit/${params.id}/`}
					>
						Back to the editor
					</TransitionLink>
				</div>
			</div>
		</div>
	);
}

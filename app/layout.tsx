import type { Metadata } from "next";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { TransitionProvider } from "@/components/motion/TransitionSystem";
import PageTransition from "@/components/motion/PageTransition";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	applicationName: SITE_NAME,
	creator: SITE_NAME,
	publisher: SITE_NAME,
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: "/icon.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
				<head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
				</head>
			<body>
				<MotionProvider>
					<TransitionProvider>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								minHeight: "100vh",
							}}
						>
							<Header />
							<main style={{ flex: 1 }}>
								<PageTransition>
									{children}
								</PageTransition>
							</main>
							<Footer />
						</div>
					</TransitionProvider>
				</MotionProvider>
			</body>
		</html>
	);
}

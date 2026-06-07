import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
	title: "About - LMMs-Lab",
	description: "About LMMs-Lab research team and projects",
	alternates: {
		canonical: "/about/",
	},
};

interface Project {
	name: string;
	href: string;
}

const ORIGIN_TEXT = (
	<>
		This organization is formed and founded by <a href="https://brianboli.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Bo Li</a> with his friends and heavily supported by <a href="https://liuziwei7.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Prof. Ziwei Liu</a>.
	</>
);

const projects: Project[] = [
	{ name: "OneVision Encoder", href: "https://github.com/search?q=OneVision+Encoder+EvolvingLMMs-Lab&type=repositories" },
	{ name: "LMMs-Engine", href: "https://github.com/EvolvingLMMs-Lab/lmms-engine" },
	{ name: "LLaVA-OneVision-2", href: "https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2" },
	{ name: "LLaVA-OneVision-1.5", href: "https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5" },
	{ name: "Multimodal-SAE", href: "https://github.com/EvolvingLMMs-Lab/multimodal-sae" },
	{ name: "LLaVA-OneVision", href: "https://github.com/LLaVA-VL/LLaVA-NeXT" },
	{ name: "LMMs-Eval", href: "https://github.com/EvolvingLMMs-Lab/lmms-eval" },
];

export default function AboutPage() {
	return (
		<main className={styles.container}>
			<div className={styles.contentWrapper}>

				{/* ── Intro ── */}
				<section>
					<div className={styles.sectionHeader}>
						<span className={styles.sectionLabel}>About</span>
						<div className={styles.sectionLine} />
					</div>
					<p className={styles.manifesto}>
                    Language is the first fire. It illuminated the invisible, gave shape to thought, carried knowledge across generations in symbols no larger than a breath. It
                    learned every rhetoric of <em>blue</em>. Now we reach beyond - not away from language, but through it - toward the light it was always pointing at.
					</p>
					<p className={styles.manifesto}>
                        We set our highest aspiration to build a true world model, with superhuman intelligence, that transcends the text and reaches for the thing-in-itself. To see the light before it becomes a word. To hear the silence between definitions. To act upon a world that precedes all description - and in that act, to understand what no symbol ever could.
					</p>
					<p className={styles.manifesto}>
						Shared as we discover - to every explorer.
					</p>
					<p className={styles.description}>
						LMMs-Lab is a non-profit research-oriented organization with a group of passionate researchers. We share the sincere passion for developing multimodal intelligence.
					</p>
				</section>

				{/* ── Core Projects ── */}
				<section>
					<div className={styles.sectionHeader}>
						<span className={styles.sectionLabel}>Core Projects</span>
						<div className={styles.sectionLine} />
					</div>
					<div className={styles.projectsGrid}>
						{projects.map((project, index) => (
							<Link
								key={project.name}
								href={project.href}
								target="_blank"
								rel="noopener noreferrer"
								className={styles.projectCard}
							>
								<div className={styles.projectHeader}>
									<span className={styles.projectIndex}>{String(index + 1).padStart(2, "0")}</span>
									<h3 className={styles.projectTitle}>{project.name}</h3>
								</div>
							</Link>
						))}
					</div>
				</section>

				{/* ── Origin (muted footer note) ── */}
				<section className={styles.originNoteSection}>
					<p className={styles.originNote}>
						<span className={styles.originLabel}>Origin</span>
						<br />
						{ORIGIN_TEXT}
					</p>
				</section>

			</div>
		</main>
	);
}

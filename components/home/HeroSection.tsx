"use client";

import { useState, useEffect } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import { DiffusionText } from "@/components/motion/DiffusionText";
import { useTransition } from "@/components/motion/TransitionSystem";
import { HackerTerminal } from "./HackerTerminal";

const HERO_PHRASES = [
  { en: ["Building", "Creating", "Forging"], zh: ["构建", "创造", "铸造"], ja: ["構築", "つくる", "ビルド", "創造", "きずく"] },
  { en: ["Feeling", "Sensing", "Perceiving"], zh: ["感受", "体会", "感知", "领悟"], ja: ["感じる", "かんじる", "フィーリング", "知覚", "体感"] },
  { en: ["Paving", "Exploring", "Seeking"], zh: ["求索", "探索", "追寻"], ja: ["探求", "さぐる", "もとめる", "探る", "シーキング"] },
];

const LANGS = ["en", "zh", "ja"] as const;

export function HeroSection() {
	const { phase } = useTransition();
	const transitioning = phase !== "idle";

	const [phraseIndex, setPhraseIndex] = useState(0);
	const [langIndex, setLangIndex] = useState(0);
	const [wordIndex, setWordIndex] = useState(0);
	
	useEffect(() => {
		if (transitioning) return;
		const interval = setInterval(() => {
			setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
		}, 28000);
		return () => clearInterval(interval);
	}, [transitioning]);

	useEffect(() => {
		if (transitioning) return;
		const interval = setInterval(() => {
			setLangIndex((prev) => (prev + 1) % LANGS.length);
			setWordIndex(Math.floor(Math.random() * 10));
		}, 3000);
		return () => clearInterval(interval);
	}, [transitioning]);

	const currentPhrase = HERO_PHRASES[phraseIndex];
	const currentLang = LANGS[langIndex];
	const words = currentPhrase[currentLang];
	const displayText = words[wordIndex % words.length];
	const showSubtitle = currentPhrase.en.includes("Paving");

	return (
		<div className="relative w-full overflow-hidden bg-[var(--background)]">
			<section className="brutalist-hero dashboard-hero">
			<div className="dashboard-panel hero-panel">

					<div className="brutalist-hero-content">
						{/* Label */}
						<div className="brutalist-hero-label fade-in-up animate-fill-both">
							<div className="brutalist-label-line" />
							<span>LMMs-Lab Research</span>
						</div>

						<h1 className="brutalist-hero-title fade-in-up animate-fill-both">
							<div className="min-h-[1.2em] overflow-hidden" style={{ whiteSpace: "nowrap" }}>
							<DiffusionText
								text={displayText}
								revealSpeed={4000}
								variant="morph"
								paused={transitioning}
							/>
							</div>
							<span
								className={`brutalist-hero-title-sub lowercase ${
									showSubtitle ? '' : 'hidden-sub'
								}`}
							>
								the way to intelligence.
							</span>
						</h1>

						{/* Accent line for visual weight */}
						<div className="hero-accent-line fade-in animate-fill-both stagger-1" />

						<p className="brutalist-hero-subtitle fade-in-up animate-fill-both stagger-1">
							Advancing multimodal intelligence through open research. Models, data, and insights - shared as we discover.
						</p>

						<div className="brutalist-hero-cta fade-in-up animate-fill-both stagger-2">
							<TransitionLink href="/posts" className="brutalist-btn-primary">
								Explore Research
							</TransitionLink>
							<TransitionLink href="/about" className="brutalist-btn-secondary">
								About the Lab
							</TransitionLink>
						</div>
					</div>
				</div>

			<div className="dashboard-panel hero-panel hero-panel-visual">

				<div className="brutalist-hero-visual fade-in animate-fill-both stagger-2">
					<div className="hero-terminal-shell">
						<HackerTerminal />
					</div>
				</div>
				</div>
			</section>
		</div>
	);
}

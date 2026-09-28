"use client";

import { useEffect } from "react";
import { mount } from "./runtime";

// Loads the per-sample data and hands the figure skeletons (figures.tsx) to runtime.js.
// It renders nothing and keeps no React state, so React never re-renders the DOM the runtime draws.

const BASE = "/images/symbols-or-pixels/";
const DATA_URL = `${BASE}data.json`;

let dataPromise: Promise<unknown> | null = null;

function loadData() {
	if (!dataPromise) {
		dataPromise = fetch(DATA_URL).then((res) => {
			if (!res.ok) throw new Error(`${DATA_URL} returned HTTP ${res.status}`);
			return res.json();
		});
		dataPromise.catch(() => {
			dataPromise = null;
		});
	}
	return dataPromise;
}

export function SymbolsOrPixelsRuntime() {
	useEffect(() => {
		let cancelled = false;
		let unmount: (() => void) | null = null;

		// The site header is sticky; the Figures 2-5 control bar sticks right below it.
		const root = document.documentElement;
		const header = document.querySelector("header");
		const bar = document.querySelector(".sp-config");
		const setStickyTop = () => {
			root.style.setProperty("--sp-sticky-top", `${header ? header.getBoundingClientRect().height : 0}px`);
			// Anchor targets under the stuck bar leave room for it; its height depends on how its controls wrap.
			root.style.setProperty("--sp-bar-h", `${bar ? bar.getBoundingClientRect().height : 0}px`);
		};
		setStickyTop();
		window.addEventListener("resize", setStickyTop);
		document.fonts?.ready.then(() => {
			if (!cancelled) setStickyTop();
		});

		// Hovering a note marker previews the note text.
		document.querySelectorAll<HTMLAnchorElement>(".sp-note-ref a").forEach((a) => {
			const note = document.getElementById(a.hash.slice(1));
			if (note) a.title = (note.textContent || "").replace(/^\s*\d+/, "").trim();
		});

		loadData()
			.then((data) => {
				if (!cancelled) unmount = mount(data, BASE);
			})
			.catch((err) => {
				console.error("[symbols-or-pixels] interactive figures failed to load:", err);
				document.querySelectorAll(".sp-loading").forEach((el) => {
					el.textContent = `Interactive figure failed to load (${err instanceof Error ? err.message : String(err)}).`;
				});
			});

		return () => {
			cancelled = true;
			window.removeEventListener("resize", setStickyTop);
			root.style.removeProperty("--sp-sticky-top");
			root.style.removeProperty("--sp-bar-h");
			if (unmount) unmount();
		};
	}, []);

	return null;
}

import type { CSSProperties, ReactNode } from "react";
import { LuImageDown, LuLink, LuTable } from "react-icons/lu";
import "./symbols-or-pixels.css";
import { PILOT_SVG, PRETRAIN_SVG } from "./static-charts";

// Figure skeletons for the "Symbols or Pixels?" note. runtime.js looks these ids, classes and
// data attributes up and draws into the containers after mount.

type Option = [value: string, label: string];

function Seg({ k, label, options, pressed }: { k: string; label: string; options: Option[]; pressed: string }) {
	return (
		<span className="seg" data-key={k} role="group" aria-label={label}>
			{options.map(([v, text]) => (
				<button key={v} type="button" data-v={v} aria-pressed={v === pressed}>
					{text}
				</button>
			))}
		</span>
	);
}

function Swatch({ style, className = "sw" }: { style?: CSSProperties; className?: string }) {
	return <span className={className} style={style} />;
}

function Loading() {
	return <p className="sp-loading">Loading interactive figure…</p>;
}

function Caption({ children }: { children: ReactNode }) {
	return <figcaption>{children}</figcaption>;
}

const THRESHOLDS: Option[] = [
	["0.9", "v2 ≥ 0.9"],
	["0.7", "v2 ≥ 0.7"],
];

// Figure 1 chips, in FLOPs order: [model id in data.json, label, method].
const COST_MODELS: [id: string, label: string, kind: "lang" | "video"][] = [
	["S4", "Qwen3.5-4B", "lang"],
	["S9", "Qwen3.5-9B", "lang"],
	["S27", "Qwen3.6-27B", "lang"],
	["G5", "G5", "video"],
	["G27", "G27", "video"],
];

export function SPCostFigure({ children }: { children: ReactNode }) {
	return (
		<figure id="fig-cost" className="sp-fig sp-wide">
			<div className="fig-body cost-body">
				<div className="cost-tabs" role="tablist" aria-label="Video threshold">
					{THRESHOLDS.map(([v], i) => (
						<button key={v} type="button" role="tab" data-cut={v} aria-selected={i === 0} aria-controls="cost-panel" tabIndex={i === 0 ? 0 : -1}>
							{i === 0 ? "Strict" : "Lenient"}: v2 ≥ {v}
						</button>
					))}
				</div>
				<div className="cost-panel" id="cost-panel" role="tabpanel">
					<div className="cost-head">
						<div>
							<p className="cost-title">Solve rate vs. forward FLOPs per answer</p>
							<p className="cost-sub" id="cost-sub">
								95 tasks × 5 samples · a video counts as solved at v2 ≥ 0.9 · text is graded on the decision
							</p>
						</div>
						<div className="cost-tools">
							<button type="button" className="cost-tool" data-act="link" aria-label="Copy a link to this figure" title="Copy link">
								<LuLink aria-hidden="true" />
							</button>
							<button type="button" className="cost-tool" data-act="png" aria-label="Download the chart as a PNG image" title="Download PNG">
								<LuImageDown aria-hidden="true" />
							</button>
							<button type="button" className="cost-tool" data-act="table" aria-pressed="false" aria-label="Show the data table" title="Show table">
								<LuTable aria-hidden="true" />
							</button>
						</div>
					</div>
					<div className="legend cost-key" aria-hidden="true">
						<span>
							<Swatch style={{ background: "var(--video-mark)" }} />
							Video, VBVR-Pro fine-tuned
						</span>
						<span>
							<Swatch className="sw dot" style={{ background: "var(--lang-mark)" }} />
							Text, layout prompt
						</span>
						<span>
							<Swatch className="sw ring" />
							Text, direct prompt
						</span>
						<span>
							<Swatch className="sw line" />
							Pareto frontier
						</span>
						<span>
							<Swatch className="sw line dash" />
							Size-matched pair
						</span>
					</div>
					<div className="cost-chips" role="group" aria-label="Highlight models">
						{COST_MODELS.map(([id, label, kind]) => (
							<button key={id} type="button" data-model={id} aria-pressed="false">
								<Swatch className={kind === "lang" ? "sw dot" : "sw"} style={{ background: `var(--${kind}-mark)` }} />
								{label}
							</button>
						))}
					</div>
					<div className="plot" id="plot-cost">
						<Loading />
					</div>
					<div className="cost-table sp-table" id="cost-table" hidden />
					<p className="cost-status" id="cost-status" aria-live="polite" />
				</div>
			</div>
			<Caption>{children}</Caption>
		</figure>
	);
}

export function SPContrast({ children }: { children: ReactNode }) {
	return (
		<div id="contrast" className="sp-contrast">
			{children}
		</div>
	);
}

export function SPConfigBar() {
	return (
		<div className="sp-config sp-wide config-bar controls" role="group" aria-label="Configuration of Figures 2 to 5">
			<span className="lbl">Figures 2–5</span>
			<span className="ctl">
				Pair
				<Seg
					k="pair"
					label="Pair"
					pressed="27B"
					options={[
						// Non-breaking hyphens keep model names whole when the buttons wrap on phones.
						["5B", "5B: G5 vs Qwen3.5‑4B"],
						["27B", "27B: G27 vs Qwen3.6‑27B"],
					]}
				/>
			</span>
			<span className="ctl">
				Prompt
				<Seg
					k="hint"
					label="Text prompt"
					pressed="layout"
					options={[
						["layout", "Layout"],
						["direct", "Direct"],
					]}
				/>
			</span>
			<span className="ctl">
				Video threshold
				<Seg k="cut" label="Video threshold" pressed="0.9" options={THRESHOLDS} />
			</span>
		</div>
	);
}

function PlotFigure({ id, plot, legend, children }: { id: string; plot: string; legend: ReactNode; children: ReactNode }) {
	return (
		<figure id={id} className="sp-fig sp-wide">
			<div className="fig-body">
				<div className="fig-head">
					<span className="cfg-now" data-cfg="" />
					<div className="legend" aria-hidden="true">
						{legend}
					</div>
				</div>
				<div className="plot" id={plot}>
					<Loading />
				</div>
			</div>
			<Caption>{children}</Caption>
		</figure>
	);
}

export function SPGroupsFigure({ children }: { children: ReactNode }) {
	return (
		<PlotFigure
			id="fig-groups"
			plot="plot-groups"
			legend={
				<>
					<span>
						<Swatch className="sw dot" style={{ background: "var(--lang-mark)" }} />
						Text better (CI above 0)
					</span>
					<span>
						<Swatch className="sw dot" style={{ background: "var(--video-mark)" }} />
						Video better (CI below 0)
					</span>
					<span>
						<Swatch className="sw dot" style={{ background: "var(--level)" }} />
						Not significant (CI includes 0)
					</span>
				</>
			}
		>
			{children}
		</PlotFigure>
	);
}

export function SPAgreeFigure({ children }: { children: ReactNode }) {
	return (
		<PlotFigure
			id="fig-agree"
			plot="plot-agree"
			legend={
				<>
					<span>
						<Swatch style={{ background: "var(--both)" }} />
						Both solve
					</span>
					<span>
						<Swatch style={{ background: "var(--lang-mark)" }} />
						Text only
					</span>
					<span>
						<Swatch style={{ background: "var(--video-mark)" }} />
						Video only
					</span>
					<span>
						<Swatch style={{ background: "var(--neither)", boxShadow: "inset 0 0 0 1px var(--rule)" }} />
						Neither
					</span>
				</>
			}
		>
			{children}
		</PlotFigure>
	);
}

export function SPFailFigure({ children }: { children: ReactNode }) {
	return (
		<PlotFigure
			id="fig-fail"
			plot="plot-fail"
			legend={
				<>
					<span>
						<Swatch style={{ background: "var(--lang-mark)" }} />
						Correct
					</span>
					<span>
						<Swatch style={{ background: "var(--wrong)" }} />
						Incorrect
					</span>
					<span>
						<Swatch style={{ background: "var(--noans)" }} />
						Unparsable
					</span>
					<span>
						<Swatch className="sw hatch" style={{ backgroundColor: "var(--trunc)" }} />
						Truncated at 2,048 tokens
					</span>
					<span>
						<Swatch style={{ background: "var(--video-mark)" }} />
						Video v2 scores
					</span>
				</>
			}
		>
			{children}
		</PlotFigure>
	);
}

const mix = (mark: string, pct: number) => `color-mix(in oklab, var(${mark}) ${pct}%, var(--div-mid))`;

export function SPExplorerFigure({ children }: { children: ReactNode }) {
	return (
		<figure id="fig-explorer" className="sp-fig sp-wide">
			<div className="fig-body">
				<div className="fig-head">
					<span className="cfg-now" data-cfg="" />
					<div className="legend" aria-hidden="true">
						<span>
							<Swatch style={{ background: mix("--video-mark", 100) }} />
							<Swatch style={{ background: mix("--video-mark", 52) }} />
							video better
						</span>
						<span>
							<Swatch style={{ background: "var(--div-mid)", boxShadow: "inset 0 0 0 1px var(--rule)" }} />
							tie
						</span>
						<span>
							<Swatch style={{ background: mix("--lang-mark", 52) }} />
							<Swatch style={{ background: mix("--lang-mark", 100) }} />
							text better
						</span>
					</div>
				</div>
				<div className="taskmap" id="taskmap" role="group" aria-label="Task map: one cell per task">
					<Loading />
				</div>
				<p className="tm-info" id="tm-info" aria-live="polite" />
				<div className="ex-top">
					<label className="lbl" htmlFor="ex-pick">
						Example
					</label>
					<select id="ex-pick" />
					<button type="button" className="btn" id="ex-prev" aria-label="Previous example">
						Previous
					</button>
					<button type="button" className="btn" id="ex-next" aria-label="Next example">
						Next
					</button>
				</div>
				<p className="ex-why" id="ex-why" />
				<div className="ex-grid">
					<div className="ex-col">
						<h4>Input</h4>
						<figure>
							<img id="ex-first" alt="" width={512} height={512} />
							<figcaption>First frame as seen by both models (512×512)</figcaption>
						</figure>
						<p className="kv">Task prompt (shared by both models)</p>
						<p className="ex-prompt" id="ex-prompt" />
						<p className="kv">Reference answer (512-pixel frame coordinates)</p>
						<pre className="mono" id="ex-ref" />
						<details className="ex-more">
							<summary>Ground-truth solution video</summary>
							<video id="ex-gt" controls loop muted playsInline preload="none" width={512} height={512} />
						</details>
					</div>
					<div className="ex-col">
						<h4>Video reasoning</h4>
						<figure>
							<video id="ex-g27" controls loop muted playsInline preload="metadata" width={512} height={512} />
							<figcaption id="ex-g27-cap" />
						</figure>
						<figure>
							<video id="ex-g5" controls loop muted playsInline preload="metadata" width={512} height={512} />
							<figcaption id="ex-g5-cap" />
						</figure>
					</div>
					<div className="ex-col ex-text">
						<h4>Text reasoning</h4>
						<div className="tabs" role="tablist" aria-label="Text model">
							<button type="button" role="tab" data-m="S27" id="tab-s27">
								Qwen3.6-27B
							</button>
							<button type="button" role="tab" data-m="S4" id="tab-s4">
								Qwen3.5-4B
							</button>
						</div>
						<p className="kv" id="ex-verdict" />
						<p className="kv">Parsed answer</p>
						<pre className="mono" id="ex-ans" />
						<p className="kv" id="ex-grade" />
						<p className="kv">Model output</p>
						<pre className="mono trace" id="ex-out" tabIndex={0} />
						<details className="ex-more">
							<summary>Prompt sent to the language model</summary>
							<pre className="mono" id="ex-tprompt" />
						</details>
					</div>
				</div>
			</div>
			<Caption>{children}</Caption>
		</figure>
	);
}

// Numbered notes: <SPRef n="1" /> marks the text; <SPNotes><SPNote n="1">…</SPNote></SPNotes>
// holds the note in small type at the end of the subsection. n is a string attribute because
// next-mdx-remote blocks JavaScript expressions such as n={1} in MDX by default.
export function SPRef({ n }: { n: number | string }) {
	return (
		<sup className="sp-note-ref">
			<a href={`#note-${n}`} id={`note-ref-${n}`}>
				{n}
			</a>
		</sup>
	);
}

export function SPNotes({ children }: { children: ReactNode }) {
	return (
		<aside className="sp-notes" aria-label="Notes">
			{children}
		</aside>
	);
}

export function SPNote({ n, children }: { n: number | string; children: ReactNode }) {
	return (
		<p className="sp-note" id={`note-${n}`}>
			<a className="sp-note-num" href={`#note-ref-${n}`} aria-label={`Back to the text of note ${n}`}>
				{n}
			</a>
			{children}
		</p>
	);
}

const STATIC_CHARTS = { pretrain: PRETRAIN_SVG, pilot: PILOT_SVG };

export function SPStaticChart({ name, wide = false }: { name: keyof typeof STATIC_CHARTS; wide?: boolean }) {
	return <div className={wide ? "sp-static sp-wide" : "sp-static"} dangerouslySetInnerHTML={{ __html: STATIC_CHARTS[name] }} />;
}

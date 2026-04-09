"use client";

import { useMemo } from "react";

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface ChartDef {
  title: string;
  subtitle: string;
  letter: string;
  slices: Slice[];
}

const C = {
  orange: "#F5A623",
  blue: "#4FC3F7",
  purple: "#CE93D8",
  green: "#81C784",
  pink: "#F48FB1",
  olive: "#FFF176",
  yellow: "#FFD54F",
};

const charts: ChartDef[] = [
  {
    title: "LLaVA-OneVision-1.5\nRL Data",
    subtitle: "Total: 67.0K",
    letter: "(a)",
    slices: [
      { label: "STEM", value: 58.0, color: C.orange },
      { label: "Grounding", value: 22.4, color: C.blue },
      { label: "Spatial", value: 6.3, color: C.purple },
      { label: "Coding", value: 6.0, color: C.green },
      { label: "Counting", value: 4.2, color: C.pink },
      { label: "OCR &\nDiagram", value: 2.3, color: C.olive },
    ],
  },
  {
    title: "Stage 1\nAnswer-only",
    subtitle: "Total: 19.9K",
    letter: "(b)",
    slices: [
      { label: "Grounding", value: 75.0, color: C.blue },
      { label: "OCR &\nDiagram", value: 10.9, color: C.olive },
      { label: "Counting", value: 14.1, color: C.pink },
    ],
  },
  {
    title: "Stage 2\nChain-of-Thought",
    subtitle: "Total: 49.2K",
    letter: "(c)",
    slices: [
      { label: "STEM", value: 79.0, color: C.orange },
      { label: "OCR &\nDiagram", value: 0.8, color: C.olive },
      { label: "Counting", value: 0.6, color: C.yellow },
      { label: "Coding", value: 8.1, color: C.green },
      { label: "Spatial", value: 8.5, color: C.purple },
      { label: "Grounding", value: 3.0, color: C.blue },
    ],
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function SingleDonut({ chart, className }: { chart: ChartDef; className?: string }) {
  const cx = 100;
  const cy = 100;
  const outerR = 80;
  const innerR = 50;
  const sliceGap = 2;

  const total = useMemo(
    () => chart.slices.reduce((s, sl) => s + sl.value, 0),
    [chart.slices]
  );

  const arcs = useMemo(() => {
    let angle = 0;
    return chart.slices.map((sl) => {
      const sweep = (sl.value / total) * 360;
      const startAngle = angle + sliceGap / 2;
      const endAngle = angle + sweep - sliceGap / 2;
      angle += sweep;
      return { ...sl, startAngle, endAngle, sweep, pct: (sl.value / total) * 100 };
    });
  }, [chart.slices, total]);

  const titleLines = chart.title.split("\n");

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: 180, maxWidth: 280 }}>
      <svg
        viewBox="0 0 200 200"
        width="100%"
        style={{ maxWidth: 220, overflow: "visible", margin: "0 auto" }}
        role="img"
        aria-label={`${chart.title.replace("\n", " ")} donut chart - ${chart.subtitle}`}
      >
        <title>{chart.title.replace("\n", " ")} - {chart.subtitle}</title>

        {arcs.map((arc, i) => {
          if (arc.sweep <= 0) return null;
          
          const effectiveSweep = Math.max(0.1, arc.endAngle - arc.startAngle);
          
          const outerStart = polarToCartesian(cx, cy, outerR, arc.startAngle);
          const outerEnd = polarToCartesian(cx, cy, outerR, arc.startAngle + effectiveSweep);
          const innerStart = polarToCartesian(cx, cy, innerR, arc.startAngle + effectiveSweep);
          const innerEnd = polarToCartesian(cx, cy, innerR, arc.startAngle);
          const largeArc = effectiveSweep > 180 ? 1 : 0;

          const d = [
            `M ${outerEnd.x} ${outerEnd.y}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerStart.x} ${outerStart.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
            "Z",
          ].join(" ");

          return (
            <path 
              key={`${arc.label}-slice`} 
              className="donut-slice"
              d={d} 
              fill={arc.color} 
              stroke="var(--background, #03639a)" 
              strokeWidth={1.5} 
              style={{ animationDelay: `${i * 80}ms` }}
            />
          );
        })}

        <text 
          x={cx} 
          y={cy - (titleLines.length > 1 ? 12 : 4)} 
          textAnchor="middle" 
          fontFamily="var(--font-mono)" 
          fill="var(--foreground, #fed7aa)"
        >
          {titleLines.map((line, idx) => (
            <tspan 
              key={line} 
              x={cx} 
              dy={idx === 0 ? 0 : "1.2em"}
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              {line}
            </tspan>
          ))}
          <tspan 
            x={cx} 
            dy="1.5em" 
            style={{ fontSize: "0.7rem", opacity: 0.7, fontWeight: 400 }}
          >
            {chart.subtitle}
          </tspan>
        </text>
      </svg>

      <div style={{ width: "100%", maxWidth: 220, marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {arcs.map((arc) => (
          <div key={`${arc.label}-legend`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0", fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--foreground, #fed7aa)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: arc.color, flexShrink: 0 }}></div>
              <span style={{ opacity: 0.9 }}>{arc.label.replace("\n", " ")}</span>
            </div>
            <div style={{ opacity: 0.85, textAlign: "right" }}>
              {arc.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--foreground, #fed7aa)", fontFamily: "var(--font-mono)", opacity: 0.6 }}>
        {chart.letter}
      </div>
    </div>
  );
}

interface RLDonutChartsProps {
  caption?: string;
}

export function RLDonutCharts({ caption }: RLDonutChartsProps) {
  return (
    <div style={{ margin: "var(--space-lg) 0" }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .donut-slice {
            animation: donut-draw 0.6s ease-out both;
          }
        }
        @keyframes donut-draw {
          from { opacity: 0; transform: scale(0.85); transform-origin: 100px 100px; }
          to   { opacity: 1; transform: scale(1);    transform-origin: 100px 100px; }
        }
        .donut-slice:hover {
          transform: scale(1.06);
          transform-origin: 100px 100px;
          filter: brightness(1.2);
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .donut-chart-first { display: none !important; }
          .donut-charts-row { flex-wrap: wrap !important; }
        }
      `}</style>
      <div
        className="donut-charts-row"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "1rem",
          width: "100%",
          flexWrap: "nowrap",
        }}
      >
        {charts.map((chart, i) => (
          <SingleDonut key={chart.letter} chart={chart} className={i === 0 ? "donut-chart-first" : undefined} />
        ))}
      </div>
      {caption && (
        <p
          style={{
            maxWidth: 750,
            margin: "1rem auto 0",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            textAlign: "center",
            opacity: 0.8,
            fontStyle: "italic",
            color: "var(--foreground, #fed7aa)",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

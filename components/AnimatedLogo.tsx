"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./AnimatedLogo.module.css";

/* Animated header logo: the pixel "LMMs-Lab" lockup morphs into
   LARGE MULTIMODAL MODEL -> LARGE WORLD MODEL and back, on an 8s loop.
   Rendering comes from the shared renderer in public/animation/ (also used
   by the /animation/ preview page). The static PNG paints with the SSR HTML
   and stays as the fallback until the first canvas frame is drawn — and
   forever when JS fails or the visitor prefers reduced motion. */

type LMMSRenderer = {
  pal(theme: string): unknown;
  scene(
    mode: string,
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    pal: unknown,
    now: number,
    opts?: Record<string, unknown>,
  ): void;
};

declare global {
  interface Window {
    LMMSRender?: { make(): LMMSRenderer };
    LMMSFont?: unknown;
  }
}

// Stage geometry: 390 tall keeps the same glyph/mark proportions as the
// logo PNG crop; 2400 wide fits the expanded LARGE * MODEL line at eCell 24.
const STAGE_W = 2400;
const STAGE_H = 390;
const SCENE_OPTS = { bare: true, alignX: "left", padX: 8, eCell: 24 };
const DUR = 8000;

let rendererLoad: Promise<void> | null = null;

function loadRenderer(): Promise<void> {
  if (window.LMMSRender) return Promise.resolve();
  if (!rendererLoad) {
    const inject = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`failed to load ${src}`));
        document.head.appendChild(s);
      });
    rendererLoad = inject("/animation/lmms-pixelfont.js").then(() =>
      inject("/animation/lmms-render.js"),
    );
  }
  return rendererLoad;
}

export default function AnimatedLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let raf = 0;
    let observer: ResizeObserver | null = null;

    loadRenderer()
      .then(() => {
        const cv = canvasRef.current;
        if (disposed || !cv || !window.LMMSRender) return;
        const ctx = cv.getContext("2d");
        if (!ctx) return;

        const R = window.LMMSRender.make();
        const pal = R.pal("light"); // unused for drawing in bare mode

        const fit = () => {
          const dpr = window.devicePixelRatio || 1;
          const rect = cv.getBoundingClientRect();
          const w = Math.max(1, Math.round(rect.width * dpr));
          const h = Math.max(1, Math.round(rect.height * dpr));
          if (cv.width !== w || cv.height !== h) {
            cv.width = w;
            cv.height = h;
          }
        };
        fit();
        observer = new ResizeObserver(fit);
        observer.observe(cv);

        const t0 = performance.now();
        let firstFrame = true;
        const frame = (now: number) => {
          if (disposed) return;
          const k = cv.height / STAGE_H;
          ctx.setTransform(k, 0, 0, k, 0, 0);
          const t = ((now - t0) % DUR) / DUR;
          R.scene("b", ctx, STAGE_W, STAGE_H, t, pal, now, SCENE_OPTS);
          if (firstFrame) {
            firstFrame = false;
            setReady(true);
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      })
      .catch(() => {
        // renderer failed to load — the PNG fallback simply stays visible
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  return (
    <span className={styles.wrap} data-ready={ready ? "true" : "false"}>
      <Image
        src="/assets/logo.png"
        alt="LMMS Lab Logo"
        width={144}
        height={144}
        className={styles.fallback}
        priority
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={STAGE_W}
        height={STAGE_H}
        aria-hidden="true"
      />
    </span>
  );
}

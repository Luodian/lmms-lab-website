/* LMMs-Lab pixel font + motion helpers.
   Bitmap glyphs are 5 rows tall. '#' = filled cell, '.' = empty.
   Uppercase caps are a clean interpretation of the logo's blocky face;
   s / a / b / - are lifted verbatim from the logo SVG so the "LMMs-Lab"
   lockup reads true. Crucially W is the vertical mirror of M — so the
   M -> W transform is a physical top/bottom flip (rotateX 180deg). */
(function () {
  const G = {
    'L': ['#..', '#..', '#..', '#..', '###'],
    'A': ['.##.', '#..#', '####', '#..#', '#..#'],
    'R': ['###.', '#..#', '###.', '#.#.', '#..#'],
    'G': ['.###', '#...', '#.##', '#..#', '.###'],
    'E': ['###', '#..', '##.', '#..', '###'],
    'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
    'W': ['#...#', '#...#', '#.#.#', '##.##', '#...#'], // vertical mirror of M
    'U': ['#..#', '#..#', '#..#', '#..#', '.##.'],
    'T': ['###', '.#.', '.#.', '.#.', '.#.'],
    'I': ['###', '.#.', '.#.', '.#.', '###'],
    'O': ['.##.', '#..#', '#..#', '#..#', '.##.'],
    'D': ['###.', '#..#', '#..#', '#..#', '###.'],
    // logo-verbatim lowercase for the lockup
    's': ['...', '###', '#..', '..#', '###'],
    'a': ['...', '.##', '#.#', '#.#', '.##'],
    'b': ['#..', '##.', '#.#', '#.#', '##.'],
    '-': ['...', '...', '###', '...', '...'],
    '?': ['###', '#.#', '#.#', '#.#', '###'],
  };
  const ROWS = 5;
  const SPACE = 3;      // blank cols for ' '
  const GAP = 1;        // blank cols between glyphs

  function rows(ch) { return G[ch] || G['?']; }
  function glyphW(ch) { return ch === ' ' ? SPACE : rows(ch)[0].length; }

  // Filled cells for a string. Returns {w, h, cells:[{c,r,gi,ch, gx}]}
  // c,r are grid coords; gi = glyph index; gx = left column of that glyph.
  function layout(str) {
    const cells = [];
    let x = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === ' ') { x += SPACE + GAP; continue; }
      const rw = rows(ch), gw = rw[0].length;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < gw; c++) {
          if (rw[r][c] === '#') cells.push({ c: x + c, r, gi: i, ch, gx: x, gw });
        }
      }
      x += gw + GAP;
    }
    return { w: Math.max(0, x - GAP), h: ROWS, cells };
  }

  // width of a string in cells (no trailing gap)
  function measure(str) { return layout(str).w; }

  // per-glyph list: [{ch, gx, gw}] + total width (cells)
  function glyphs(str) {
    const list = []; let x = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === ' ') { x += SPACE + GAP; continue; }
      const gw = rows(ch)[0].length;
      list.push({ ch, gx: x, gw });
      x += gw + GAP;
    }
    return { list, w: Math.max(0, x - GAP) };
  }

  /* ---- easing --------------------------------------------------------- */
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    function solve(x) {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x; if (Math.abs(e) < 1e-6) return t;
        const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d;
      }
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 20; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-6) break; if (e > 0) hi = t; else lo = t; t = (lo + hi) / 2; }
      return t;
    }
    return x => { x = Math.max(0, Math.min(1, x)); return sy(solve(x)); };
  }

  const easeInOut = cubicBezier(0.62, 0, 0.38, 1);
  const easeOut = cubicBezier(0.16, 1, 0.3, 1);
  const easeIn = cubicBezier(0.7, 0, 0.84, 0);
  // high-order flip curve: dips < 0 (anticipation) then overshoots > 1 (settle)
  const flipCurve = cubicBezier(0.5, -0.32, 0.36, 1.34);

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function smooth(t, a, b) { return easeInOut(seg(t, a, b)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // damped spring settle 0..1 -> value overshooting to 1 then resting
  function spring(p, freq, damp) {
    freq = freq || 3; damp = damp || 6;
    if (p >= 1) return 1;
    return 1 - Math.exp(-damp * p) * Math.cos(freq * Math.PI * p);
  }

  // physical flip 0..1: anticipation wind-back, gravity-like release, then a
  // decaying overshoot wobble that settles exactly on 1. Returns values that
  // dip < 0 (wind-up) and rise > 1 (overshoot) so the rotation carries momentum.
  function physFlip(u) {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    const A = 0.09;                         // wind-back amount
    if (u < 0.15) return -A * easeOut(u / 0.15);
    const v = (u - 0.15) / 0.85;            // release phase
    return 1 - (1 + A) * Math.exp(-4.5 * v) * Math.cos(2.6 * Math.PI * v);
  }

  /* ---- magenta mark (3 crossing strokes, from the logo) --------------- */
  // normalised inside its own bbox (0..1 each axis)
  const MARK = [
    [[0.000, 0.703], [0.699, 0.099]],
    [[0.347, 1.000], [0.919, 0.000]],
    [[0.185, 0.101], [1.000, 0.992]],
  ];
  const MARK_AR = 129 / 197.5; // h/w of the mark bbox

  window.LMMSFont = {
    G, ROWS, SPACE, GAP, rows, glyphW, layout, measure, glyphs,
    cubicBezier, easeInOut, easeOut, easeIn, flipCurve,
    clamp01, seg, smooth, lerp, spring, physFlip, MARK, MARK_AR,
  };
})();

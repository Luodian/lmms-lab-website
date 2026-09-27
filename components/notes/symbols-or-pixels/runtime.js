/* eslint-disable */
// Figure runtime for the "Symbols or Pixels?" note, carried over from the report page.
// mount(D, base) draws Figures 1-5 into the skeletons rendered by figures.tsx and returns unmount().
export function mount(D, base) {
  'use strict';
  var ac = new AbortController();
  var SIG = { signal: ac.signal };
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = { pair: D.primary.pair, hint: D.primary.hint, cut: D.primary.cut, time: 'batched', costCut: '0.9', ex: 0, exModel: null, task: null };
  var PAIR = { '5B': { video: 'G5', text: 'S4', name: 'Qwen3.5-4B' }, '27B': { video: 'G27', text: 'S27', name: 'Qwen3.6-27B' } };
  var CELLS = [['both', 'Both solve', 'c-both'], ['text_only', 'Text only', 'c-lang'], ['video_only', 'Video only', 'c-video'], ['neither', 'Neither', 'c-neither']];
  var KIND = { correct: ['Correct', 'ok'], wrong: ['Incorrect', 'bad'], no_answer: ['Unparsable', 'bad'], truncated: ['Truncated at 2,048 tokens', 'bad'] };

  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function stext(attrs, parent, s) { var e = svg('text', attrs, parent); e.textContent = s; return e; }
  function minus(s) { return String(s).replace(/-/g, '−'); }
  function pts(d) { return minus((d >= 0 ? '+' : '') + (d * 100).toFixed(1)); }
  function ciPts(c) { return '[' + pts(c[0]) + ', ' + pts(c[1]) + ']'; }
  function ciR(c) { return '[' + c[0].toFixed(2) + ', ' + c[1].toFixed(2) + ']'; }
  function xr(v) { return v >= 20 ? Math.round(v).toLocaleString('en-US') + '×' : v.toFixed(1) + '×'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function secs(s) { return s >= 100 ? s.toFixed(0) + ' s' : s >= 10 ? s.toFixed(1) + ' s' : s >= 1 ? s.toFixed(2) + ' s' : s.toFixed(3) + ' s'; }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function pow10(e) { return '10' + String(e).split('').map(function (c) { return SUP[c]; }).join(''); }
  function flops(f) { var e = Math.floor(Math.log10(f)); return (f / Math.pow(10, e)).toFixed(1) + '×' + pow10(e); }
  function armName(k) { var a = D.arms[k]; return a.label + (a.hint ? ', ' + a.hint : ''); }
  function sizeOf(model) { return model === 'S4' ? '4B' : model === 'S9' ? '9B' : model === 'S27' ? '27B' : model; }
  function cfgText() { var p = PAIR[state.pair]; return state.pair + ' pair (' + p.video + ' vs ' + p.name + ') · ' + state.hint + ' prompt · video threshold v2 ≥ ' + state.cut; }
  function view() { return D.contrast[state.pair + '|' + state.hint][state.cut]; }

  /* tooltip: hover with a mouse, focus with the keyboard, tap on touch */
  var tip = document.createElement('div');
  tip.className = 'sp-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);
  var tipOwner = null;
  function placeTip(x, y) {
    var pad = 12, w = tip.offsetWidth, h = tip.offsetHeight;
    var left = x + pad, top = y + pad;
    if (left + w > window.innerWidth - 8) left = x - w - pad;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = y - h - pad;
    if (top < 8) top = 8;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function showTip(node, html, x, y) {
    tip.innerHTML = html;
    tip.hidden = false;
    tipOwner = node;
    if (x == null) { var r = node.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    placeTip(x, y);
  }
  function hideTip(node) { if (!node || node === tipOwner) { tip.hidden = true; tipOwner = null; } }
  function bindTip(node, html, label) {
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'img');
    if (label) node.setAttribute('aria-label', label);
    node.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') showTip(node, html(), e.clientX, e.clientY); }, SIG);
    node.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' && tipOwner === node) placeTip(e.clientX, e.clientY); }, SIG);
    node.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') hideTip(node); }, SIG);
    node.addEventListener('focus', function () { showTip(node, html()); }, SIG);
    node.addEventListener('blur', function () { hideTip(node); }, SIG);
    node.addEventListener('click', function (e) {
      if (tipOwner === node && !tip.hidden && e.pointerType === 'touch') { hideTip(node); return; }
      showTip(node, html(), e.clientX, e.clientY);
    }, SIG);
  }
  document.addEventListener('pointerdown', function (e) { if (tipOwner && !tipOwner.contains(e.target)) hideTip(); }, SIG);
  window.addEventListener('scroll', function () { hideTip(); }, { passive: true, signal: ac.signal });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); }, SIG);

  function box(id) {
    var el = document.getElementById(id);
    el.textContent = '';
    return { el: el, w: Math.max(280, el.clientWidth) };
  }

  /* Figure 1: accuracy against cost */
  function renderCost() {
    var b = box('plot-cost'), W = b.w;
    var narrow = W < 560;
    var H = Math.round(Math.min(430, Math.max(300, W * 0.5)));
    var m = { l: narrow ? 44 : 58, r: narrow ? 30 : 44, t: 16, b: 50 };
    var mode = state.time, cut = state.costCut;
    var keys = Object.keys(D.arms);
    function xOf(a) { return mode === 'flops' ? a.flops : mode === 'b1' ? a.b1 : (a.kind === 'video' ? a.b1 : a.batched); }
    var xs = keys.map(function (k) { return xOf(D.arms[k]); });
    if (mode === 'batched') keys.forEach(function (k) { if (D.arms[k].kind === 'video') xs.push(D.arms[k].bound); });
    var lo = Math.floor(Math.log10(Math.min.apply(null, xs)) - 0.1), hi = Math.ceil(Math.log10(Math.max.apply(null, xs)) + 0.1);
    var X = function (v) { return m.l + (Math.log10(v) - lo) / (hi - lo) * (W - m.l - m.r); };
    var yMax = 0.7;
    var Y = function (v) { return m.t + (1 - v / yMax) * (H - m.t - m.b); };
    var s = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Solve rate against ' + (mode === 'flops' ? 'forward FLOPs' : 'GPU seconds') + ' per answer' }, b.el);
    for (var e = lo; e <= hi; e++) {
      var x = X(Math.pow(10, e));
      svg('line', { x1: x, x2: x, y1: m.t, y2: H - m.b, 'class': 'grid' }, s);
      var lab = mode === 'flops' ? pow10(e) : (e >= 0 ? Math.pow(10, e).toLocaleString('en-US') : Math.pow(10, e).toFixed(-e)) + ' s';
      if (!narrow || (e - lo) % 1 === 0) stext({ x: x, y: H - m.b + 17, 'class': 'tick', 'text-anchor': 'middle' }, s, lab);
    }
    for (var v = 0; v <= yMax + 1e-9; v += 0.1) {
      var y = Y(v);
      svg('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, 'class': 'grid' }, s);
      stext({ x: m.l - 8, y: y + 4, 'class': 'tick', 'text-anchor': 'end' }, s, v.toFixed(1));
    }
    stext({ x: (m.l + W - m.r) / 2, y: H - 10, 'class': 'axis-label', 'text-anchor': 'middle' }, s,
      mode === 'flops' ? 'Forward FLOPs per answer (log scale)' : (mode === 'b1' ? 'GPU time per answer (s), batch size 1 (log scale)' : 'GPU time per answer (s), text batched (log scale)'));
    stext({ x: 12, y: m.t + (H - m.t - m.b) / 2, 'class': 'axis-label', 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (m.t + (H - m.t - m.b) / 2) + ')' }, s, 'Solve rate');
    ['5B', '27B'].forEach(function (size) {
      var p = D.pairs[size + '|layout'], va = D.arms[p.video], ta = D.arms[p.text];
      var sv = cut === '0.9' ? va.s09 : va.s07, st = ta.s09;
      var x1 = X(xOf(ta)), y1 = Y(st.rate), x2 = X(xOf(va)), y2 = Y(sv.rate);
      svg('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'class': 'pair-line' }, s);
      var ratio = mode === 'flops' ? p.flops : mode === 'b1' ? p.b1 : p.batched;
      var t = stext({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 8, 'class': 'pair-ratio', 'text-anchor': 'middle' }, s, size + ': ' + xr(ratio) + (mode === 'flops' ? ' fewer FLOPs' : ' less GPU time'));
      t.setAttribute('paint-order', 'stroke');
      t.setAttribute('style', 'stroke: var(--surface)');
      t.setAttribute('stroke-width', '4');
    });
    keys.forEach(function (k) {
      var a = D.arms[k];
      var sv = a.kind === 'video' ? (cut === '0.9' ? a.s09 : a.s07) : a.s09;
      var x = X(xOf(a)), y = Y(sv.rate);
      var g = svg('g', { 'class': 'mark' }, s);
      var col = a.kind === 'video' ? 'video' : 'lang';
      svg('line', { x1: x, x2: x, y1: Y(sv.ci[0]), y2: Y(sv.ci[1]), 'class': 's-' + col, 'stroke-width': 1.6, opacity: 0.55 }, g);
      if (a.kind === 'video') {
        if (mode === 'batched') {
          var xb = X(a.bound);
          svg('line', { x1: xb + 6, x2: x - 7, y1: y, y2: y, 'class': 's-video', 'stroke-width': 1.2, 'stroke-dasharray': '2 3', opacity: 0.8 }, g);
          svg('rect', { x: xb - 5, y: y - 5, width: 10, height: 10, style: 'fill: var(--surface)', 'class': 's-video', 'stroke-width': 1.6 }, g);
        }
        svg('rect', { x: x - 6.5, y: y - 6.5, width: 13, height: 13, 'class': 'c-video', style: 'stroke: var(--surface)', 'stroke-width': 2 }, g);
        svg('rect', { x: x - 9, y: y - 9, width: 18, height: 18, 'class': 'focus-ring' }, g);
        stext({ x: x + 11, y: y + 4, 'class': 'pt-l', style: 'fill: var(--video)' }, g, a.model);
      } else {
        var r = a.model === 'S27' ? 7 : a.model === 'S9' ? 6 : 5.5;
        if (a.hint === 'layout') svg('circle', { cx: x, cy: y, r: r, 'class': 'c-lang', style: 'stroke: var(--surface)', 'stroke-width': 2 }, g);
        else svg('circle', { cx: x, cy: y, r: r - 1, style: 'fill: var(--surface)', 'class': 's-lang', 'stroke-width': 2.2 }, g);
        svg('circle', { cx: x, cy: y, r: r + 3, 'class': 'focus-ring' }, g);
        if (a.hint === 'layout') {
          var right = a.model === 'S9';
          stext({ x: right ? x + r + 5 : x - r - 5, y: y + 4, 'class': 'pt-l', style: 'fill: var(--lang)', 'text-anchor': right ? 'start' : 'end' }, g, sizeOf(a.model));
        }
      }
      svg('circle', { cx: x, cy: y, r: 14, 'class': 'hit' }, g);
      bindTip(g, function () {
        var h = '<b>' + esc(armName(k)) + '</b><br>';
        if (mode === 'flops') h += 'Forward FLOPs per answer: ' + flops(a.flops) + '<br>';
        else if (a.kind === 'video') h += 'GPU time per video: ' + secs(a.b1) + ' (batch size 1)' + (mode === 'batched' ? '<br>At 100% of peak: ≥ ' + secs(a.bound) : '') + '<br>';
        else h += 'GPU time per answer: ' + secs(mode === 'b1' ? a.b1 : a.batched) + (mode === 'b1' ? ' (batch size 1)' : ' (batched)') + '<br>';
        h += 'Solve rate' + (a.kind === 'video' ? ' at v2 ≥ ' + cut : '') + ': ' + sv.rate.toFixed(3) + ' ' + ciR(sv.ci);
        if (a.cap != null) h += '<br>Truncated at the decoding limit: ' + Math.round(a.cap * 100) + '%';
        return h;
      }, armName(k));
    });
  }

  /* rows shared by Figures 2 and 3 */
  function rowLayout(W, rowH) {
    var narrow = W < 560;
    var labelW = narrow ? 0 : Math.min(230, Math.round(W * 0.3));
    var valW = narrow ? 0 : 160;
    var rows = [], y = 6, prev = null;
    D.groups.forEach(function (g) {
      if (g.block !== prev) { rows.push({ header: g.block, y: y }); y += 22; prev = g.block; }
      rows.push({ g: g, y: y });
      y += narrow ? rowH + 16 : rowH;
    });
    return { narrow: narrow, labelW: labelW, valW: valW, rows: rows, height: y };
  }

  /* Figure 2: paired differences by group */
  function renderGroups() {
    var b = box('plot-groups'), W = b.w, v = view();
    var L = rowLayout(W, 30);
    var plotL = L.narrow ? 10 : L.labelW + 10, plotR = W - (L.narrow ? 10 : L.valW + 10);
    var H = L.height + 40;
    var span = 0.7;
    var X = function (d) { return plotL + (Math.max(-span, Math.min(span, d)) + span) / (2 * span) * (plotR - plotL); };
    var s = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Text minus video by group' }, b.el);
    [-60, -40, -20, 20, 40, 60].forEach(function (t) { svg('line', { x1: X(t / 100), x2: X(t / 100), y1: 0, y2: L.height, 'class': 'grid' }, s); });
    svg('line', { x1: X(0), x2: X(0), y1: 0, y2: L.height, 'class': 'zero' }, s);
    [-60, -40, -20, 0, 20, 40, 60].forEach(function (t) { stext({ x: X(t / 100), y: L.height + 15, 'class': 'tick', 'text-anchor': 'middle' }, s, t === 0 ? '0' : minus((t > 0 ? '+' : '') + t)); });
    stext({ x: X(-0.02), y: L.height + 33, 'class': 'axis-label', 'text-anchor': 'end' }, s, '← favors video');
    stext({ x: X(0.02), y: L.height + 33, 'class': 'axis-label' }, s, 'favors text →');
    L.rows.forEach(function (r) {
      if (r.header) { stext({ x: L.narrow ? 10 : 0, y: r.y + 14, 'class': 'block' }, s, r.header); return; }
      var g = v[r.g.key], meta = D.meta[r.g.key];
      var cy = L.narrow ? r.y + 34 : r.y + 15;
      var col = g.ci[0] > 0 ? 'lang' : g.ci[1] < 0 ? 'video' : 'level';
      var grp = svg('g', { 'class': 'mark' }, s);
      svg('rect', { x: 0, y: r.y, width: W, height: L.narrow ? 46 : 30, 'class': 'hit' }, grp);
      var labY = L.narrow ? r.y + 14 : cy + 4;
      var lt = stext({ x: L.narrow ? 10 : 0, y: labY, 'class': 'row-label' }, grp, r.g.label + ' ');
      var sub = svg('tspan', { 'class': 'row-sub' }, lt);
      sub.textContent = meta.tasks + ' tasks';
      stext({ x: W - (L.narrow ? 10 : 0), y: labY, 'class': 'row-val', 'text-anchor': 'end' }, grp, pts(g.diff) + ' ' + ciPts(g.ci));
      svg('line', { x1: X(g.ci[0]), x2: X(g.ci[1]), y1: cy, y2: cy, 'class': 's-' + col, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, grp);
      svg('circle', { cx: X(g.diff), cy: cy, r: 5.5, 'class': 'c-' + col, style: 'stroke: var(--surface)', 'stroke-width': 2 }, grp);
      svg('circle', { cx: X(g.diff), cy: cy, r: 9, 'class': 'focus-ring' }, grp);
      bindTip(grp, function () {
        return '<b>' + esc(r.g.label) + '</b> · ' + meta.tasks + ' tasks (' + meta.in_domain + ' in-domain, ' + meta.pixel + ' with pixel answers)<br>' +
          'Text ' + g.text.rate.toFixed(3) + ' ' + ciR(g.text.ci) + ' · Video ' + g.video.rate.toFixed(3) + ' ' + ciR(g.video.ci) + '<br>' +
          'Text − video: ' + pts(g.diff) + ' pp ' + ciPts(g.ci);
      }, r.g.label + ': text − video ' + pts(g.diff) + ' pp');
    });
  }

  /* Figure 3: outcomes per sample */
  function renderAgree() {
    var b = box('plot-agree'), W = b.w, v = view();
    var L = rowLayout(W, 30);
    var plotL = L.narrow ? 10 : L.labelW + 10, plotR = W - (L.narrow ? 10 : L.valW + 10);
    var H = L.height + 6;
    var s = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Outcomes per sample by group' }, b.el);
    L.rows.forEach(function (r) {
      if (r.header) { stext({ x: L.narrow ? 10 : 0, y: r.y + 14, 'class': 'block' }, s, r.header); return; }
      var g = v[r.g.key], tot = CELLS.reduce(function (n, c) { return n + g.cells[c[0]]; }, 0);
      var by = L.narrow ? r.y + 24 : r.y + 5, bh = 20;
      var labY = L.narrow ? r.y + 14 : r.y + 19;
      var lt = stext({ x: L.narrow ? 10 : 0, y: labY, 'class': 'row-label' }, s, r.g.label + ' ');
      var sub = svg('tspan', { 'class': 'row-sub' }, lt);
      sub.textContent = tot + ' samples';
      var best = Math.max(g.text.rate, g.video.rate);
      stext({ x: W - (L.narrow ? 10 : 0), y: labY, 'class': 'row-val', 'text-anchor': 'end' }, s, 'union ' + g.union.rate.toFixed(2) + ' · best ' + best.toFixed(2));
      var x = plotL, width = plotR - plotL;
      CELLS.forEach(function (c, i) {
        var n = g.cells[c[0]], w = n / tot * width;
        if (n === 0) return;
        var seg = svg('g', { 'class': 'mark' }, s);
        var gap = i < 3 ? 2 : 0;
        svg('rect', { x: x, y: by, width: Math.max(0.5, w - gap), height: bh, rx: 2, 'class': c[2] }, seg);
        svg('rect', { x: x - 1, y: by - 1, width: Math.max(0.5, w - gap) + 2, height: bh + 2, rx: 3, 'class': 'focus-ring' }, seg);
        if (w - gap >= 26) stext({ x: x + (w - gap) / 2, y: by + 14, 'class': 'seg-label' + (c[0] === 'neither' ? ' dark' : ''), 'text-anchor': 'middle' }, seg, String(n));
        bindTip(seg, function () {
          return '<b>' + esc(r.g.label) + '</b><br>' + c[1] + ': ' + n + ' of ' + tot + ' samples (' + Math.round(n / tot * 100) + '%)';
        }, r.g.label + ', ' + c[1] + ': ' + n + ' of ' + tot);
        x += w;
      });
      svg('rect', { x: plotL - 0.5, y: by - 0.5, width: width + 1, height: bh + 1, rx: 2, 'class': 'bar-outline' }, s);
    });
  }

  /* Figure 4: failure kinds and video score distribution */
  function renderFail() {
    var b = box('plot-fail'), W = b.w;
    var stack = W < 720;
    var textW = stack ? W : Math.round(W * 0.55), histW = stack ? W : W - textW - 28;
    var arms = ['S4 layout', 'S4 direct', 'S9 layout', 'S9 direct', 'S27 layout', 'S27 direct'];
    var kinds = [['correct', 'Correct', 'c-lang'], ['wrong', 'Incorrect', 'c-wrong'], ['no_answer', 'Unparsable', 'c-noans'], ['truncated', 'Truncated', 'c-trunc']];
    var rowH = 30, textH = 24 + arms.length * rowH;
    var histH = 2 * 118 + 20;
    var H = stack ? textH + 24 + histH : Math.max(textH, histH);
    var s = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Text answer outcomes and video score distributions' }, b.el);
    var defs = svg('defs', null, s);
    var pat = svg('pattern', { id: 'hatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    svg('rect', { width: 5, height: 5, 'class': 'c-trunc' }, pat);
    svg('line', { x1: 0, y1: 0, x2: 0, y2: 5, style: 'stroke: var(--ink)', 'stroke-opacity': 0.28, 'stroke-width': 1.4 }, pat);
    stext({ x: 0, y: 12, 'class': 'block' }, s, 'Text answers');
    var labW = Math.min(150, Math.round(textW * 0.36)), bx = labW + 8, bw = textW - bx;
    var current = PAIR[state.pair].text + ' ' + state.hint;
    arms.forEach(function (k, i) {
      var f = D.fail[k].overall, tot = kinds.reduce(function (n, c) { return n + f[c[0]]; }, 0);
      var y = 24 + i * rowH;
      stext({ x: 0, y: y + 15, 'class': 'row-label' + (k === current ? ' hl-row' : '') }, s, armName(k));
      var x = bx;
      kinds.forEach(function (c, j) {
        var n = f[c[0]], w = n / tot * bw, gap = j < kinds.length - 1 ? 2 : 0;
        if (n === 0) return;
        var seg = svg('g', { 'class': 'mark' }, s);
        var ra = { x: x, y: y + 2, width: Math.max(0.5, w - gap), height: 20, rx: 2 };
        if (c[0] === 'truncated') ra.fill = 'url(#hatch)'; else ra['class'] = c[2];
        svg('rect', ra, seg);
        svg('rect', { x: x - 1, y: y + 1, width: Math.max(0.5, w - gap) + 2, height: 22, rx: 3, 'class': 'focus-ring' }, seg);
        if (w - gap >= 28) stext({ x: x + (w - gap) / 2, y: y + 16, 'class': 'seg-label' + (c[0] === 'truncated' || c[0] === 'no_answer' ? ' dark' : ''), 'text-anchor': 'middle' }, seg, String(n));
        bindTip(seg, function () { return '<b>' + esc(armName(k)) + '</b><br>' + c[1] + ': ' + n + ' of ' + tot + ' answers (' + Math.round(n / tot * 100) + '%)'; }, armName(k) + ', ' + c[1] + ': ' + n);
        x += w;
      });
    });
    var ox = stack ? 0 : textW + 28, oy = stack ? textH + 24 : 0;
    var hmax = Math.max.apply(null, D.vhist.G5.hist.concat(D.vhist.G27.hist));
    ['G27', 'G5'].forEach(function (vk, i) {
      var y0 = oy + i * 118, ph = 78, top = y0 + 20;
      var hx = function (v) { return ox + 28 + v * (histW - 36); };
      stext({ x: ox, y: y0 + 12, 'class': 'block' }, s, vk + ' video scores');
      svg('rect', { x: hx(0.7), y: top, width: hx(0.9) - hx(0.7), height: ph, 'class': 'band' }, s);
      [0, 0.5, 0.7, 0.9, 1].forEach(function (t) { stext({ x: hx(t), y: top + ph + 14, 'class': 'tick', 'text-anchor': 'middle' }, s, String(t)); });
      var hist = D.vhist[vk].hist;
      hist.forEach(function (n, j) {
        var bar = svg('g', { 'class': 'mark' }, s);
        var hgt = n / hmax * ph, x0 = hx(j / 10) + 1, w = hx((j + 1) / 10) - hx(j / 10) - 2;
        svg('rect', { x: x0, y: top + ph - hgt, width: w, height: Math.max(0.5, hgt), rx: 1.5, 'class': 'c-video' }, bar);
        svg('rect', { x: x0, y: top, width: w, height: ph, 'class': 'hit' }, bar);
        svg('rect', { x: x0 - 1, y: top + ph - hgt - 1, width: w + 2, height: Math.max(0.5, hgt) + 2, 'class': 'focus-ring' }, bar);
        bindTip(bar, function () { return '<b>' + vk + '</b><br>v2 score ' + (j / 10).toFixed(1) + '–' + ((j + 1) / 10).toFixed(1) + ': ' + n + ' of ' + D.samples + ' videos'; }, vk + ', scores ' + (j / 10).toFixed(1) + ' to ' + ((j + 1) / 10).toFixed(1) + ': ' + n);
      });
      svg('line', { x1: hx(0.9), x2: hx(0.9), y1: top - 4, y2: top + ph, 'class': 'zero' }, s);
      svg('line', { x1: hx(0.7), x2: hx(0.7), y1: top - 4, y2: top + ph, 'class': 'zero', 'stroke-dasharray': '3 3' }, s);
      svg('line', { x1: hx(0), x2: hx(1), y1: top + ph, y2: top + ph, 'class': 'zero' }, s);
      var o = D.vhist[vk].overall;
      stext({ x: ox + histW, y: y0 + 12, 'class': 'row-val', 'text-anchor': 'end' }, s, o.solved + ' ≥ 0.9 · ' + o.near + ' in [0.7, 0.9) · ' + o.below + ' < 0.7');
    });
  }

  /* Figure 5: task map */
  function taskDiff(t) {
    var p = PAIR[state.pair], cut = parseFloat(state.cut);
    var tt = t.text[p.text + ' ' + state.hint], vv = t.video[p.video];
    var kt = tt.filter(Boolean).length, kv = vv.filter(function (x) { return x >= cut; }).length;
    return { kt: kt, kv: kv, d: (kt - kv) / 5 };
  }
  function cellColor(d) {
    if (d === 0) return 'var(--div-mid)';
    var pct = Math.round(28 + 72 * Math.abs(d));
    return 'color-mix(in oklab, ' + (d > 0 ? 'var(--lang-mark)' : 'var(--video-mark)') + ' ' + pct + '%, var(--div-mid))';
  }
  function renderTaskMap() {
    var el = document.getElementById('taskmap');
    el.textContent = '';
    var all = [];
    Object.keys(D.classes).forEach(function (cls) {
      var ts = D.tasks.filter(function (t) { return t.cls === cls; }).map(function (t) { return { t: t, s: taskDiff(t) }; });
      ts.sort(function (a, b) { return b.s.d - a.s.d || (a.t.id < b.t.id ? -1 : 1); });
      var row = document.createElement('div'); row.className = 'tm-row';
      var lab = document.createElement('div'); lab.className = 'tm-label';
      lab.innerHTML = esc(D.classes[cls]) + ' <small>' + ts.length + ' tasks</small>';
      var cells = document.createElement('div'); cells.className = 'tm-cells';
      ts.forEach(function (x) {
        var t = x.t, sc = x.s;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tm-cell' + (t.ex.length ? ' has-ex' : '');
        btn.style.background = cellColor(sc.d);
        btn.setAttribute('aria-label', t.id + ' ' + t.name + ': text ' + sc.kt + ' of 5, video ' + sc.kv + ' of 5' + (t.ex.length ? ', has an example' : ''));
        if (state.task === t.task) btn.setAttribute('aria-current', 'true');
        btn.tabIndex = all.length === 0 ? 0 : -1;
        var html = function () {
          var p = PAIR[state.pair], v = t.video[p.video].map(function (x) { return x.toFixed(2); }).join(', ');
          return '<b>' + esc(t.id) + '</b> ' + esc(t.name) + '<br>' + (t.split === 'in' ? 'In-domain' : 'Out-of-domain') + (t.px ? ' · pixel answer' : '') +
            '<br>' + p.name + ' (' + state.hint + '): ' + sc.kt + ' of 5 · ' + p.video + ': ' + sc.kv + ' of 5<br>' + p.video + ' v2 scores: ' + v +
            (t.ex.length ? '<br>Has an example: click to show it' : '');
        };
        btn.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') showTip(btn, html(), e.clientX, e.clientY); }, SIG);
        btn.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' && tipOwner === btn) placeTip(e.clientX, e.clientY); }, SIG);
        btn.addEventListener('pointerleave', function () { hideTip(btn); }, SIG);
        btn.addEventListener('focus', function () { showTip(btn, html()); }, SIG);
        btn.addEventListener('blur', function () { hideTip(btn); }, SIG);
        btn.setAttribute('data-task', t.task);
        btn.addEventListener('click', function () { pickTask(t, sc); }, SIG);
        cells.appendChild(btn);
        all.push(btn);
      });
      row.appendChild(lab); row.appendChild(cells); el.appendChild(row);
    });
    el.onkeydown = function (e) {
      var i = all.indexOf(document.activeElement);
      if (i < 0) return;
      var j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      j = Math.max(0, Math.min(all.length - 1, j));
      all[i].tabIndex = -1; all[j].tabIndex = 0; all[j].focus();
    };
  }
  function pickTask(t, sc) {
    state.task = t.task;
    var info = document.getElementById('tm-info');
    var p = PAIR[state.pair];
    var msg = t.id + ' ' + t.name + ': ' + p.name + ' solves ' + sc.kt + ' of 5, ' + p.video + ' ' + sc.kv + ' of 5.';
    if (t.ex.length) {
      state.ex = t.ex[0];
      info.textContent = msg + ' Showing its example below.';
      renderExplorer();
      var target = document.getElementById('ex-pick');
      var r = target.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.7) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      info.textContent = msg + ' No example media for this task; the dotted cells have one.';
    }
    markTask();
  }
  function markTask() {
    document.querySelectorAll('#taskmap .tm-cell').forEach(function (c) {
      if (c.getAttribute('data-task') === state.task) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
    });
  }

  /* Figure 5: explorer */
  var picker = document.getElementById('ex-pick');
  picker.textContent = '';
  (function buildPicker() {
    CELLS.forEach(function (c) {
      var og = document.createElement('optgroup');
      og.label = c[1] + ' (27B, layout, v2 ≥ 0.9)';
      D.examples.forEach(function (e, i) {
        if (e.cell !== c[0]) return;
        var o = document.createElement('option');
        o.value = String(i);
        o.textContent = e.id + ' #' + e.idx + ' · ' + e.name + ' · ' + (e.split === 'in' ? 'in-domain' : 'out-of-domain');
        og.appendChild(o);
      });
      picker.appendChild(og);
    });
    picker.addEventListener('change', function () { state.ex = parseInt(picker.value, 10); state.task = D.examples[state.ex].task; renderExplorer(); markTask(); }, SIG);
    var order = Array.prototype.map.call(picker.querySelectorAll('option'), function (o) { return parseInt(o.value, 10); });
    function step(k) { var i = order.indexOf(state.ex); state.ex = order[(i + k + order.length) % order.length]; state.task = D.examples[state.ex].task; renderExplorer(); markTask(); }
    document.getElementById('ex-prev').addEventListener('click', function () { step(-1); }, SIG);
    document.getElementById('ex-next').addEventListener('click', function () { step(1); }, SIG);
    state.ex = order[0];
    state.task = D.examples[state.ex].task;
  })();
  document.querySelectorAll('.tabs button').forEach(function (bt) {
    bt.addEventListener('click', function () { state.exModel = bt.getAttribute('data-m'); renderExplorer(); }, SIG);
  });
  function setVideo(id, src) {
    var v = document.getElementById(id);
    v.muted = true;
    if (v.getAttribute('src') !== src) {
      v.setAttribute('src', src);
      if (!reduceMotion && id !== 'ex-gt') { v.autoplay = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
  }
  function renderExplorer() {
    var e = D.examples[state.ex], cut = parseFloat(state.cut);
    picker.value = String(state.ex);
    var cellName = CELLS.filter(function (c) { return c[0] === e.cell; })[0][1].toLowerCase();
    document.getElementById('ex-why').textContent = e.id + ' #' + e.idx + ', ' + D.classes[e.cls].toLowerCase() + ', ' + (e.split === 'in' ? 'in-domain' : 'out-of-domain') + '. Selected as “' + cellName + '” in the primary configuration.';
    var img = document.getElementById('ex-first');
    img.src = base + e.media.first;
    img.alt = 'First frame of ' + e.id + ' sample ' + e.idx;
    document.getElementById('ex-prompt').textContent = e.prompt;
    document.getElementById('ex-ref').textContent = e.reference;
    setVideo('ex-gt', base + e.media.gt);
    ['G27', 'G5'].forEach(function (vk) {
      setVideo('ex-' + vk.toLowerCase(), base + e.media[vk]);
      var sc = e.video[vk], ok = sc >= cut;
      document.getElementById('ex-' + vk.toLowerCase() + '-cap').innerHTML = '<b>' + vk + '</b> v2 score ' + sc.toFixed(3) + ' <span class="chip ' + (ok ? 'ok">✓ solved' : 'bad">✗ not solved') + ' at ≥ ' + state.cut + '</span>';
    });
    var model = state.exModel || PAIR[state.pair].text;
    document.querySelectorAll('.tabs button').forEach(function (bt) { bt.setAttribute('aria-selected', String(bt.getAttribute('data-m') === model)); });
    var t = e.text[model + ' ' + state.hint];
    var k = KIND[t.kind];
    document.getElementById('ex-verdict').innerHTML = '<span class="chip ' + k[1] + '">' + (k[1] === 'ok' ? '✓ ' : '✗ ') + k[0] + '</span> ' + esc((model === 'S27' ? 'Qwen3.6-27B' : 'Qwen3.5-4B') + ', ' + state.hint + ' prompt, ' + t.tokens + ' tokens generated');
    document.getElementById('ex-ans').textContent = t.answer || '(none)';
    document.getElementById('ex-grade').textContent = 'Grader: ' + t.why;
    document.getElementById('ex-out').textContent = t.content;
    document.getElementById('ex-tprompt').textContent = t.prompt;
  }

  function renderCfg() { document.querySelectorAll('[data-cfg]').forEach(function (el) { el.textContent = 'Showing: ' + cfgText(); }); }
  function renderContrast() { renderCfg(); renderGroups(); renderAgree(); renderFail(); renderTaskMap(); renderExplorer(); }

  document.querySelectorAll('.seg').forEach(function (seg) {
    var key = seg.getAttribute('data-key');
    seg.querySelectorAll('button').forEach(function (bt) {
      bt.addEventListener('click', function () {
        state[key] = bt.getAttribute('data-v');
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === bt)); });
        if (key === 'pair') state.exModel = null;
        if (key === 'time' || key === 'costCut') renderCost(); else renderContrast();
      }, SIG);
    });
  });

  var last = {};
  function onResize() {
    [['plot-cost', renderCost], ['plot-groups', renderGroups], ['plot-agree', renderAgree], ['plot-fail', renderFail]].forEach(function (p) {
      var w = document.getElementById(p[0]).clientWidth;
      if (last[p[0]] !== w) { last[p[0]] = w; p[1](); }
    });
  }
  var pending = false;
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { if (!pending) { pending = true; requestAnimationFrame(function () { pending = false; onResize(); }); } });
    ['plot-cost', 'plot-groups', 'plot-agree', 'plot-fail'].forEach(function (id) { ro.observe(document.getElementById(id)); });
  } else {
    window.addEventListener('resize', onResize, SIG);
  }
  renderCost();
  renderContrast();
  onResize();

  return function unmount() {
    ac.abort();
    if (ro) ro.disconnect();
    var tm = document.getElementById('taskmap');
    if (tm) tm.onkeydown = null;
    tip.remove();
  };
}

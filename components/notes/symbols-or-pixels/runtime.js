/* eslint-disable */
// Figure runtime for the "Symbols or Pixels?" note, carried over from the report page.
// mount(D, base) draws Figures 1-5 into the skeletons rendered by figures.tsx and returns unmount().
export function mount(D, base) {
  'use strict';
  var ac = new AbortController();
  var SIG = { signal: ac.signal };
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = { pair: D.primary.pair, hint: D.primary.hint, cut: D.primary.cut, costCut: '0.9', ex: 0, exModel: null, task: null };
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

  /* Figure 1: solve rate against forward FLOPs, with a Pareto frontier, model highlighting,
     a data table and PNG export */
  var costHL = {}, costTable = false, statusTimer = null;
  function solveOf(a, cut) { return a.kind === 'video' ? (cut === '0.9' ? a.s09 : a.s07) : a.s09; }
  function byFlops(p, q) { return D.arms[p].flops - D.arms[q].flops; }
  // Pareto frontier of the point estimates: no other configuration has both fewer FLOPs and a higher solve rate.
  function frontier(cut) {
    var best = -1;
    return Object.keys(D.arms).sort(byFlops).filter(function (k) {
      var r = solveOf(D.arms[k], cut).rate;
      if (r <= best) return false;
      best = r;
      return true;
    });
  }
  function costName(k) { return armName(k) + (D.arms[k].hint ? ' prompt' : ''); }
  function costSub(cut) { return '95 tasks × 5 samples · a video counts as solved at v2 ≥ ' + cut + ' · text is graded on the decision'; }
  function renderCost() {
    // Hidden behind the table: drawn again when the chart comes back.
    if (costTable || !document.getElementById('plot-cost').clientWidth) return;
    var b = box('plot-cost'), W = b.w;
    var narrow = W < 560;
    var H = Math.round(Math.min(440, Math.max(320, W * 0.5)));
    var m = { l: narrow ? 40 : 54, r: narrow ? 10 : 18, t: 14, b: 46 };
    var cut = state.costCut, keys = Object.keys(D.arms), fr = frontier(cut);
    var logs = keys.map(function (k) { return Math.log10(D.arms[k].flops); });
    var lo = Math.min.apply(null, logs) - (narrow ? 0.35 : 0.5), hi = Math.max.apply(null, logs) + (narrow ? 0.3 : 0.4);
    var XL = function (l) { return m.l + (l - lo) / (hi - lo) * (W - m.l - m.r); };
    var X = function (v) { return XL(Math.log10(v)); };
    var yMax = 0.7, y0 = H - m.b;
    var Y = function (v) { return m.t + (1 - v / yMax) * (y0 - m.t); };
    var s = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Solve rate against forward FLOPs per answer, video threshold v2 ≥ ' + cut }, b.el);
    for (var i = 0; i <= 7; i++) {
      var y = Y(i / 10);
      svg('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, 'class': i ? 'grid' : 'zero' }, s);
      stext({ x: m.l - 8, y: y + 4, 'class': 'tick', 'text-anchor': 'end' }, s, (i / 10).toFixed(1));
    }
    // Log axis: labeled powers of ten and unlabeled ticks at 2-9 times each.
    for (var e = Math.floor(lo); e <= Math.ceil(hi); e++) {
      for (var j = 1; j <= 9; j++) {
        var l = e + Math.log10(j);
        if (l < lo || l > hi) continue;
        var x = XL(l);
        svg('line', { x1: x, x2: x, y1: y0, y2: y0 + (j === 1 ? 6 : 3), 'class': 'zero' }, s);
        if (j === 1) stext({ x: x, y: y0 + 20, 'class': 'tick', 'text-anchor': 'middle' }, s, pow10(e));
      }
    }
    stext({ x: (m.l + W - m.r) / 2, y: H - 6, 'class': 'axis-label', 'text-anchor': 'middle' }, s, 'Forward FLOPs per answer (log scale)');
    var yc = m.t + (y0 - m.t) / 2;
    stext({ x: 12, y: yc, 'class': 'axis-label', 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + yc + ')' }, s, 'Solve rate');

    var lines = svg('g', null, s), marks = svg('g', null, s), labels = svg('g', null, s);
    // Label obstacles: marks and placed labels must stay clear; lines, then whiskers, are avoided when there is room.
    var P = {}, hard = [], soft = [], segs = [];
    keys.forEach(function (k) {
      var a = D.arms[k], sv = solveOf(a, cut);
      var p = P[k] = { x: X(a.flops), y: Y(sv.rate), r: a.kind === 'video' ? 7 : a.model === 'S27' ? 7 : a.model === 'S9' ? 6 : 5.5 };
      hard.push({ x0: p.x - p.r - 2, y0: p.y - p.r - 2, x1: p.x + p.r + 2, y1: p.y + p.r + 2 });
      soft.push({ x0: p.x - 5, y0: Y(sv.ci[1]) - 1, x1: p.x + 5, y1: Y(sv.ci[0]) + 1 });
    });
    var pairs = ['5B', '27B'].map(function (size) {
      var q = D.pairs[size + '|layout'], a = P[q.text], c = P[q.video];
      var models = D.arms[q.text].model + ' ' + D.arms[q.video].model;
      svg('line', { x1: a.x, y1: a.y, x2: c.x, y2: c.y, 'class': 'pair-line', 'data-models': models }, lines);
      segs.push([a.x, a.y, c.x, c.y, size]);
      return { a: a, c: c, size: size, models: models, text: size + ': ' + xr(q.flops) + ' fewer FLOPs' };
    });
    svg('path', { d: fr.map(function (k, n) { return (n ? 'L' : 'M') + P[k].x + ',' + P[k].y; }).join(''), 'class': 'frontier' }, lines);
    for (var n = 1; n < fr.length; n++) segs.push([P[fr[n - 1]].x, P[fr[n - 1]].y, P[fr[n]].x, P[fr[n]].y, 'frontier']);

    keys.forEach(function (k) {
      var a = D.arms[k], sv = solveOf(a, cut), p = P[k], x = p.x, y = p.y;
      var g = svg('g', { 'class': 'mark', 'data-model': a.model, 'data-arm': k }, marks);
      var col = a.kind === 'video' ? 'video' : 'lang';
      // One path for the whisker and its end caps, so the translucent stroke does not double up at the joins.
      var ya = Y(sv.ci[0]), yb = Y(sv.ci[1]);
      svg('path', { d: 'M' + (x - 4) + ',' + ya + 'H' + (x + 4) + 'M' + x + ',' + ya + 'V' + yb + 'M' + (x - 4) + ',' + yb + 'H' + (x + 4), 'class': 's-' + col, fill: 'none', 'stroke-width': 1.6, opacity: 0.55 }, g);
      if (a.kind === 'video') {
        svg('rect', { x: x - 6.5, y: y - 6.5, width: 13, height: 13, 'class': 'c-video', style: 'stroke: var(--surface)', 'stroke-width': 2 }, g);
        svg('rect', { x: x - 9, y: y - 9, width: 18, height: 18, 'class': 'focus-ring' }, g);
      } else {
        if (a.hint === 'layout') svg('circle', { cx: x, cy: y, r: p.r, 'class': 'c-lang', style: 'stroke: var(--surface)', 'stroke-width': 2 }, g);
        else svg('circle', { cx: x, cy: y, r: p.r - 1, style: 'fill: var(--surface)', 'class': 's-lang', 'stroke-width': 2.2 }, g);
        svg('circle', { cx: x, cy: y, r: p.r + 3, 'class': 'focus-ring' }, g);
      }
      svg('circle', { cx: x, cy: y, r: 14, 'class': 'hit' }, g);
      bindTip(g, function () {
        var h = '<b>' + esc(costName(k)) + '</b><br>Forward FLOPs per answer: ' + flops(a.flops) + '<br>';
        h += 'Solve rate' + (a.kind === 'video' ? ' at v2 ≥ ' + cut : '') + ': ' + sv.rate.toFixed(3) + ' ' + ciR(sv.ci);
        if (a.cap != null) h += '<br>Truncated at the decoding limit: ' + Math.round(a.cap * 100) + '%';
        if (fr.indexOf(k) >= 0) h += '<br>On the Pareto frontier';
        return h;
      }, costName(k));
    });

    // Labels go to the first free spot around their point, in priority order: video names, the pair
    // ratios, then layout and direct points. A label with no free spot is dropped; its tooltip remains.
    function free(bx, sets) {
      if (bx.x0 < m.l || bx.x1 > W - m.r || bx.y0 < m.t || bx.y1 > y0 - 2) return false;
      return sets.every(function (set) { return set.every(function (o) { return bx.x0 >= o.x1 || bx.x1 <= o.x0 || bx.y0 >= o.y1 || bx.y1 <= o.y0; }); });
    }
    // Liang-Barsky: does the segment cross the box?
    function crosses(bx, sg) {
      var t0 = 0, t1 = 1, dx = sg[2] - sg[0], dy = sg[3] - sg[1];
      var pk = [-dx, dx, -dy, dy], qk = [sg[0] - bx.x0, bx.x1 - sg[0], sg[1] - bx.y0, bx.y1 - sg[1]];
      for (var i = 0; i < 4; i++) {
        if (pk[i] === 0) { if (qk[i] < 0) return false; continue; }
        var r = qk[i] / pk[i];
        if (pk[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
        else { if (r < t0) return false; if (r < t1) t1 = r; }
      }
      return true;
    }
    // spots(w, h) lists the top-left corners of the label's padded box to try; own is the pair line a
    // ratio label belongs to, which it may touch.
    function place(t, spots, own) {
      t.setAttribute('x', 0); t.setAttribute('y', 0);
      var bb = t.getBBox(), w = bb.width + 4, h = bb.height + 2, pick = null;
      var cand = spots(w, h).map(function (c) { return { x0: c[0], y0: c[1], x1: c[0] + w, y1: c[1] + h }; });
      // Tiers of [avoid whiskers, avoid lines], strictest first.
      [[true, true], [false, true], [true, false], [false, false]].some(function (tier) {
        return cand.some(function (b) {
          if (free(b, tier[0] ? [hard, soft] : [hard]) && !(tier[1] && segs.some(function (sg) { return sg[4] !== own && crosses(b, sg); }))) pick = b;
          return !!pick;
        });
      });
      if (!pick) { t.remove(); return; }
      t.setAttribute('x', pick.x0 + 2);
      t.setAttribute('y', pick.y0 + 1 - bb.y);
      hard.push(pick);
    }
    // Right, left, above, below, then the four diagonals, each 3 px clear of the mark.
    function around(p) {
      var g = p.r + 3;
      return function (w, h) {
        return [[p.x + g, p.y - h / 2], [p.x - g - w, p.y - h / 2], [p.x - w / 2, p.y - g - h], [p.x - w / 2, p.y + g],
          [p.x + 2, p.y - g - h], [p.x - 2 - w, p.y - g - h], [p.x + 2, p.y + g], [p.x - 2 - w, p.y + g]];
      };
    }
    var HALO = { 'paint-order': 'stroke', 'stroke-width': 4, 'stroke-linejoin': 'round' };
    function label(k) {
      var a = D.arms[k], attrs = { 'class': 'pt-l', 'data-model': a.model, style: 'fill: var(--' + (a.kind === 'video' ? 'video' : 'lang') + '); stroke: var(--surface)' };
      for (var h in HALO) attrs[h] = HALO[h];
      place(stext(attrs, labels, a.kind === 'video' ? a.model : sizeOf(a.model) + ' ' + a.hint), around(P[k]));
    }
    keys.filter(function (k) { return D.arms[k].kind === 'video'; }).forEach(label);
    pairs.forEach(function (q) {
      // Just above or below the line at points along it, clear of the line across the label's width.
      var spots = function (w, h) {
        var out = [], dx = q.c.x - q.a.x, dy = q.c.y - q.a.y;
        [0.5, 0.6, 0.4, 0.7, 0.3].forEach(function (f) {
          var x = q.a.x + f * dx;
          var yl = q.a.y + (x - w / 2 - q.a.x) / dx * dy, yr = q.a.y + (x + w / 2 - q.a.x) / dx * dy;
          out.push([x - w / 2, Math.min(yl, yr) - 4 - h], [x - w / 2, Math.max(yl, yr) + 4]);
        });
        return out;
      };
      var attrs = { 'class': 'pair-ratio', 'data-models': q.models, style: 'stroke: var(--surface)' };
      for (var h in HALO) attrs[h] = HALO[h];
      place(stext(attrs, labels, q.text), spots, q.size);
    });
    keys.filter(function (k) { return D.arms[k].hint === 'layout'; }).forEach(label);
    keys.filter(function (k) { return D.arms[k].hint === 'direct'; }).forEach(label);
    applyHL();
  }

  function applyHL() {
    var plot = document.getElementById('plot-cost');
    plot.classList.toggle('has-hl', Object.keys(costHL).some(function (k) { return costHL[k]; }));
    plot.querySelectorAll('[data-model], [data-models]').forEach(function (n) {
      var ms = (n.getAttribute('data-model') || n.getAttribute('data-models')).split(' ');
      n.classList.toggle('hl', ms.some(function (x) { return costHL[x]; }));
    });
  }

  function renderCostTable() {
    if (!costTable) return;
    var cut = state.costCut, fr = frontier(cut);
    document.getElementById('cost-table').innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Configuration</th><th>Method</th>' +
      '<th>FLOPs per answer</th><th>Solve rate</th><th>95% CI</th><th>On frontier</th></tr></thead><tbody>' +
      Object.keys(D.arms).sort(byFlops).map(function (k) {
        var a = D.arms[k], sv = solveOf(a, cut);
        return '<tr><td>' + esc(costName(k)) + '</td><td>' + (a.kind === 'video' ? 'Video' : 'Text') + '</td><td>' + flops(a.flops) +
          '</td><td>' + sv.rate.toFixed(3) + '</td><td>' + ciR(sv.ci) + '</td><td>' + (fr.indexOf(k) >= 0 ? 'Yes' : 'No') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function say(msg, keep) {
    var st = document.getElementById('cost-status');
    st.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = keep ? null : setTimeout(function () { st.textContent = ''; }, 5000);
  }

  function copyLink() {
    var url = location.origin + location.pathname + '#fig-cost';
    var fail = function () { say('Could not copy. Link to this figure: ' + url, true); };
    if (!navigator.clipboard || !navigator.clipboard.writeText) { fail(); return; }
    navigator.clipboard.writeText(url).then(function () { say('Link copied: ' + url); }, fail);
  }

  // PNG export: a standalone SVG with the title, a drawn legend, the chart (computed styles inlined, since
  // the page stylesheet does not travel with it) and a source line, rasterized at 2x on a canvas.
  var EXPORT_CSS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity',
    'opacity', 'paint-order', 'font-family', 'font-size', 'font-weight', 'letter-spacing', 'text-anchor', 'visibility'];
  function inlineStyles(src, dst) {
    var cs = getComputedStyle(src);
    dst.setAttribute('style', EXPORT_CSS.map(function (p) { return p + ':' + cs.getPropertyValue(p); }).join(';'));
    for (var i = 0; i < src.children.length; i++) inlineStyles(src.children[i], dst.children[i]);
  }
  function exportPNG() {
    var src = document.querySelector('#plot-cost svg');
    if (costTable || !src) { say('Show the chart to download it.'); return; }
    var fig = getComputedStyle(document.getElementById('fig-cost'));
    var v = function (name) { return fig.getPropertyValue(name).trim(); };
    var font = getComputedStyle(src).fontFamily, pad = 20;
    var W = +src.getAttribute('width'), H = +src.getAttribute('height'), TW = W + 2 * pad;
    var out = svg('svg', { width: TW });
    var bg = svg('rect', { x: 0, y: 0, width: TW, fill: getComputedStyle(document.querySelector('#fig-cost .fig-body')).backgroundColor }, out);
    var put = function (x, y, size, weight, fill, str) {
      return stext({ x: x, y: y, style: 'font-family:' + font + ';font-size:' + size + 'px;font-weight:' + weight + ';fill:' + fill }, out, str);
    };
    put(pad, pad + 16, 18, 700, v('--ink'), 'Solve rate vs. forward FLOPs per answer');
    put(pad, pad + 38, 13, 400, v('--muted'), costSub(state.costCut));
    var meas = document.createElement('canvas').getContext('2d');
    meas.font = '13px ' + font;
    var keyItems = [['sq', v('--video-mark'), 'Video, VBVR-Pro fine-tuned'], ['dot', v('--lang-mark'), 'Text, layout prompt'], ['ring', v('--lang-mark'), 'Text, direct prompt'],
      ['dots', v('--ink'), 'Pareto frontier'], ['dash', v('--muted'), 'Size-matched pair']];
    var lx = pad, ly = pad + 66;
    keyItems.forEach(function (it) {
      var sw = it[0] === 'dots' || it[0] === 'dash' ? 22 : 12, w = sw + 6 + meas.measureText(it[2]).width;
      if (lx > pad && lx + w > TW - pad) { lx = pad; ly += 22; }
      var cy = ly - 4.5;
      if (it[0] === 'sq') svg('rect', { x: lx, y: cy - 6, width: 12, height: 12, fill: it[1] }, out);
      else if (it[0] === 'dot') svg('circle', { cx: lx + 6, cy: cy, r: 6, fill: it[1] }, out);
      else if (it[0] === 'ring') svg('circle', { cx: lx + 6, cy: cy, r: 5, fill: 'none', stroke: it[1], 'stroke-width': 2 }, out);
      else svg('line', { x1: lx, x2: lx + sw, y1: cy, y2: cy, stroke: it[1], 'stroke-width': it[0] === 'dots' ? 2.2 : 1.5, 'stroke-dasharray': it[0] === 'dots' ? '0.1 5' : '4 4', 'stroke-linecap': it[0] === 'dots' ? 'round' : 'butt' }, out);
      put(lx + sw + 6, ly, 13, 400, v('--ink-2'), it[2]);
      lx += w + 18;
    });
    var top = ly + 12, TH = top + H + 34;
    var plot = src.cloneNode(true);
    inlineStyles(src, plot);
    plot.setAttribute('x', pad);
    plot.setAttribute('y', top);
    out.appendChild(plot);
    put(pad, TH - 14, 11.5, 400, v('--muted'), 'Figure 1 · Symbols or Pixels? · lmms-lab.com/notes/symbols-or-pixels');
    out.setAttribute('height', TH);
    out.setAttribute('viewBox', '0 0 ' + TW + ' ' + TH);
    bg.setAttribute('height', TH);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'), k = 2;
      c.width = TW * k;
      c.height = TH * k;
      var ctx = c.getContext('2d');
      ctx.scale(k, k);
      ctx.drawImage(img, 0, 0, TW, TH);
      c.toBlob(function (blob) {
        if (!blob) { say('PNG export failed.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'symbols-or-pixels-figure-1-v2-' + state.costCut + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        say('Downloaded ' + a.download);
      }, 'image/png');
    };
    img.onerror = function () { console.error('[symbols-or-pixels] PNG export: the chart SVG did not load as an image'); say('PNG export failed.'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(out));
  }

  (function bindCost() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('#fig-cost .cost-tabs [role="tab"]'));
    function pick(bt, focus) {
      state.costCut = bt.getAttribute('data-cut');
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === bt)); x.tabIndex = x === bt ? 0 : -1; });
      if (focus) bt.focus();
      document.getElementById('cost-sub').textContent = costSub(state.costCut);
      renderCost();
      renderCostTable();
    }
    tabs.forEach(function (bt, i) {
      bt.addEventListener('click', function () { pick(bt); }, SIG);
      bt.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (j === null) return;
        e.preventDefault();
        pick(tabs[(j + tabs.length) % tabs.length], true);
      }, SIG);
    });
    document.querySelectorAll('#fig-cost .cost-chips button').forEach(function (bt) {
      var id = bt.getAttribute('data-model');
      var hint = function () { return costHL[id] ? 'Click to remove the highlight' : 'Click to highlight'; };
      bt.addEventListener('click', function () {
        costHL[id] = !costHL[id];
        bt.setAttribute('aria-pressed', String(costHL[id]));
        applyHL();
        if (tipOwner === bt) tip.innerHTML = hint();
      }, SIG);
      bt.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') showTip(bt, hint(), e.clientX, e.clientY); }, SIG);
      bt.addEventListener('pointerleave', function () { hideTip(bt); }, SIG);
    });
    var panel = document.getElementById('cost-panel');
    document.querySelectorAll('#fig-cost .cost-tool').forEach(function (bt) {
      bt.addEventListener('click', function () {
        var act = bt.getAttribute('data-act');
        if (act === 'link') { copyLink(); return; }
        if (act === 'png') { exportPNG(); return; }
        costTable = !costTable;
        panel.classList.toggle('show-table', costTable);
        document.getElementById('plot-cost').hidden = costTable;
        document.getElementById('cost-table').hidden = !costTable;
        bt.setAttribute('aria-pressed', String(costTable));
        bt.setAttribute('aria-label', costTable ? 'Show the chart' : 'Show the data table');
        bt.title = costTable ? 'Show chart' : 'Show table';
        if (costTable) renderCostTable(); else renderCost();
      }, SIG);
    });
  })();

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
      var xa = X(g.ci[0]), xb = X(g.ci[1]);
      svg('path', { d: 'M' + xa + ',' + (cy - 5) + 'V' + (cy + 5) + 'M' + xa + ',' + cy + 'H' + xb + 'M' + xb + ',' + (cy - 5) + 'V' + (cy + 5), 'class': 's-' + col, fill: 'none', 'stroke-width': 2.4 }, grp);
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
  // One example per outcome of the primary configuration (e.pick = e.cell), plus one near-miss video.
  function pickName(e) {
    return e.pick === 'near_miss' ? 'Near-miss video' : CELLS.filter(function (c) { return c[0] === e.cell; })[0][1];
  }
  (function buildPicker() {
    D.examples.forEach(function (e, i) {
      var o = document.createElement('option');
      o.value = String(i);
      o.textContent = pickName(e) + ' · ' + e.id + ' #' + e.idx + ' · ' + e.name;
      picker.appendChild(o);
    });
    picker.addEventListener('change', function () { state.ex = parseInt(picker.value, 10); state.task = D.examples[state.ex].task; renderExplorer(); markTask(); }, SIG);
    var order = Array.prototype.map.call(picker.querySelectorAll('option'), function (o) { return parseInt(o.value, 10); });
    function step(k) { var i = order.indexOf(state.ex); state.ex = order[(i + k + order.length) % order.length]; state.task = D.examples[state.ex].task; renderExplorer(); markTask(); }
    document.getElementById('ex-prev').addEventListener('click', function () { step(-1); }, SIG);
    document.getElementById('ex-next').addEventListener('click', function () { step(1); }, SIG);
    state.ex = order[0];
    state.task = D.examples[state.ex].task;
  })();
  document.querySelectorAll('#fig-explorer .tabs button').forEach(function (bt) {
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
    var why = e.pick === 'near_miss' ? 'the near-miss video (G27 v2 between 0.7 and 0.9)' : '“' + pickName(e).toLowerCase() + '”';
    document.getElementById('ex-why').textContent = e.id + ' #' + e.idx + ', ' + D.classes[e.cls].toLowerCase() + ', ' + (e.split === 'in' ? 'in-domain' : 'out-of-domain') + '. Selected as ' + why + ' in the primary configuration.';
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
    document.querySelectorAll('#fig-explorer .tabs button').forEach(function (bt) { bt.setAttribute('aria-selected', String(bt.getAttribute('data-m') === model)); });
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
        renderContrast();
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
  // Figure 1 places its labels by measured text width; measure again once the web font has loaded.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!ac.signal.aborted) renderCost(); });

  return function unmount() {
    ac.abort();
    clearTimeout(statusTimer);
    if (ro) ro.disconnect();
    var tm = document.getElementById('taskmap');
    if (tm) tm.onkeydown = null;
    tip.remove();
  };
}

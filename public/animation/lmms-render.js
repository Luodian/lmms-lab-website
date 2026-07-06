/* LMMs-Lab morph renderer — shared by the HTML player and the GIF encoder.
   Depends on window.LMMSFont (pixelfont.js). Call LMMSRender.make() to get a
   renderer R, then R.scene(mode, ctx, W, H, t, pal, now):
     mode : 'b' (single-line lockup morph) | 'c' (hero pivot)
     t    : loop phase 0..1
     pal  : R.pal('light'|'dark')
     now  : ms for idle float; pass 0 for a perfectly seamless loop (GIF). */
(function (global) {
  function make() {
    const R = {
      CY: [56, 240, 231],   // #38F0E7
      MG: [251, 49, 94],    // #FB315E
      _ol: false,

      pal(theme) {
        return theme === 'dark'
          ? { ground: '#0c0b0a', grid: 'rgba(232,227,218,0.045)', shadow: 'rgba(0,0,0,0.55)', isDark: true }
          : { ground: '#faf9f7', grid: 'rgba(28,27,24,0.05)', shadow: 'rgba(24,20,15,0.20)', isDark: false };
      },

      rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; },
      mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; },

      ground(ctx, W, H, pal) {
        // The dotted ground is static per theme/size — pre-render it once and
        // blit each frame so the loop stays well inside a 60/120 Hz budget.
        const key = W + 'x' + H + ':' + pal.ground;
        if (!this._bg || this._bg.key !== key) {
          const cv = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(W, H);
          cv.width = W; cv.height = H;
          const g = cv.getContext('2d');
          g.fillStyle = pal.ground; g.fillRect(0, 0, W, H);
          g.fillStyle = pal.grid;
          for (let y = 24; y < H; y += 42) for (let x = 24; x < W; x += 42) g.fillRect(x, y, 2, 2);
          this._bg = { key, cv };
        }
        ctx.drawImage(this._bg.cv, 0, 0);
      },

      drawStr(ctx, str, ox, oy, cell, color, alpha, pal, shadow) {
        if (alpha <= 0.001) return;
        const F = window.LMMSFont;
        const cells = F.layout(str).cells;
        if (this._ol) {
          const ow = Math.max(1.3, Math.min(cell * 0.15, 3));
          ctx.fillStyle = 'rgba(18,15,11,' + alpha + ')';
          for (const c of cells) ctx.fillRect(ox + c.c * cell - ow, oy + c.r * cell - ow, cell + 2 * ow, cell + 2 * ow);
        } else if (shadow && !pal.isDark) {
          ctx.fillStyle = 'rgba(24,20,15,' + (0.14 * alpha) + ')';
          const d = cell * 0.16;
          for (const c of cells) ctx.fillRect(ox + c.c * cell + d, oy + c.r * cell + d, cell, cell);
        }
        ctx.fillStyle = this.rgba(color, alpha);
        for (const c of cells) ctx.fillRect(ox + c.c * cell, oy + c.r * cell, cell, cell);
      },

      drawGlyphScaled(ctx, ch, oxpx, oy, cell, scale, color, alpha) {
        if (alpha <= 0.002) return;
        const F = window.LMMSFont, rows = F.rows(ch), gw = rows[0].length;
        const cx = oxpx + gw / 2 * cell, cy = oy + 2.5 * cell;
        ctx.save();
        ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
        if (this._ol) {
          const ow = Math.max(1.3, Math.min(cell * 0.15, 3));
          ctx.fillStyle = 'rgba(18,15,11,' + alpha + ')';
          for (let r = 0; r < 5; r++) for (let c = 0; c < gw; c++) if (rows[r][c] === '#') ctx.fillRect(oxpx + c * cell - ow, oy + r * cell - ow, cell + 2 * ow, cell + 2 * ow);
        }
        ctx.fillStyle = this.rgba(color, alpha);
        for (let r = 0; r < 5; r++) for (let c = 0; c < gw; c++) if (rows[r][c] === '#') ctx.fillRect(oxpx + c * cell, oy + r * cell, cell, cell);
        ctx.restore();
      },

      drawWordSwap(ctx, oxpx, oy, cell, oldStr, newStr, swap, pal, baseAlpha) {
        const F = window.LMMSFont, spread = 0.45;
        const gO = F.glyphs(oldStr).list, retract = F.clamp01(swap / 0.58), nO = gO.length;
        for (let i = 0; i < nO; i++) {
          const g = gO[i], delay = (1 - (nO > 1 ? i / (nO - 1) : 0)) * spread;
          const p = F.clamp01((retract - delay) / (1 - spread));
          if (p >= 1) continue;
          const fx = oxpx + g.gx * cell, x = F.lerp(fx, oxpx, p * 0.8);
          this.drawGlyphScaled(ctx, g.ch, x, oy, cell, F.lerp(1, 0.5, p), this.CY, (1 - p) * baseAlpha);
        }
        const gN = F.glyphs(newStr).list, appear = F.clamp01((swap - 0.42) / 0.58), nN = gN.length;
        for (let i = 0; i < nN; i++) {
          const g = gN[i], delay = (nN > 1 ? i / (nN - 1) : 0) * spread;
          const p = F.clamp01((appear - delay) / (1 - spread));
          if (p <= 0) continue;
          const fx = oxpx + g.gx * cell, x = F.lerp(oxpx, fx, p);
          this.drawGlyphScaled(ctx, g.ch, x, oy, cell, F.lerp(0.5, 1, p), this.CY, p * baseAlpha);
        }
      },

      drawFlip(ctx, ch, ox, oy, cell, alpha, pal, flipFn) {
        const F = window.LMMSFont;
        const rows = F.rows(ch), gw = rows[0].length;
        const centerY = oy + 2.5 * cell;
        const rects = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < gw; c++) {
          if (rows[r][c] !== '#') continue;
          const f = flipFn(c, gw);
          const ang = Math.PI * f, cosv = Math.cos(ang), ac = Math.abs(cosv);
          const dy = (oy + r * cell + cell / 2) - centerY;
          const pcy = centerY + dy * cosv;
          const ph = Math.max(cell * 0.1, cell * ac);
          let k = (0.5 + 0.5 * ac) * (cosv < 0 ? 0.84 : 1);
          let col = [this.CY[0] * k, this.CY[1] * k, this.CY[2] * k];
          if (ac < 0.4) col = this.mix(col, this.MG, (1 - ac / 0.4) * 0.9);
          rects.push({ x: ox + c * cell, y: pcy - ph / 2, w: cell, h: ph, col, ac });
        }
        if (this._ol) {
          const ow = Math.max(1.3, Math.min(cell * 0.15, 3));
          ctx.fillStyle = 'rgba(18,15,11,' + alpha + ')';
          for (const Rc of rects) { const oyv = ow * Math.max(0.32, Rc.ac); ctx.fillRect(Rc.x - ow, Rc.y - oyv, Rc.w + 2 * ow, Rc.h + 2 * oyv); }
        }
        for (const Rc of rects) { ctx.fillStyle = this.rgba(Rc.col, alpha); ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); }
      },

      drawMark(ctx, cx, cy, w, alpha, rot, pal) {
        if (alpha <= 0.001) return;
        const F = window.LMMSFont, h = w * F.MARK_AR;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.strokeStyle = this.rgba(this.MG, alpha);
        ctx.lineWidth = w * 0.062; ctx.lineCap = 'butt';
        for (const s of F.MARK) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + s[0][0] * w, -h / 2 + s[0][1] * h);
          ctx.lineTo(-w / 2 + s[1][0] * w, -h / 2 + s[1][1] * h);
          ctx.stroke();
        }
        ctx.restore();
      },

      phases(t) {
        const F = window.LMMSFont, s = F.seg, e = F.easeInOut;
        const expand = t < 0.09 ? 0 : t < 0.28 ? e(s(t, 0.09, 0.28)) : t < 0.86 ? 1 : 1 - e(s(t, 0.86, 1.0));
        const tail = t < 0.42 ? 0 : t < 0.55 ? e(s(t, 0.42, 0.55)) : t < 0.74 ? 1 : t < 0.86 ? 1 - e(s(t, 0.74, 0.86)) : 0;
        const suffix = Math.max(1 - e(s(t, 0.09, 0.17)), e(s(t, 0.90, 1.0)));
        return { expand, tail, suffix };
      },

      flipFnFor(t, spread) {
        const F = window.LMMSFont;
        spread = spread == null ? 0.12 : spread;
        return (c, gw) => {
          const delay = gw > 1 ? (c / (gw - 1)) * spread : 0;
          if (t < 0.40) return 0;
          if (t < 0.74) { const rc = F.clamp01((F.seg(t, 0.40, 0.60) - delay) / (1 - spread)); return F.physFlip(rc); }
          const rc = F.clamp01((F.seg(t, 0.74, 0.86) - delay) / (1 - spread)); return 1 - F.physFlip(rc);
        };
      },

      scene(mode, ctx, W, H, t, pal, now) {
        now = now || 0;
        this._ol = (mode === 'b' || mode === 'c');
        this.ground(ctx, W, H, pal);
        const bob = Math.sin(now / 1000 * 1.1) * 2.2;
        ctx.save(); ctx.translate(0, bob);
        if (mode === 'c') this.sceneC(ctx, W, H, t, pal, now);
        else this.sceneAB(mode, ctx, W, H, t, pal, now);
        ctx.restore();
      },

      sceneAB(mode, ctx, W, H, t, pal, now) {
        const F = window.LMMSFont, L = F.lerp, e = F.easeInOut, s = F.seg;
        const ph = this.phases(t);
        const inits = [
          { ch: 'L', w: 3, rem: 'ARGE' },
          { ch: 'M', w: 5, remA: 'ULTIMODAL', remB: 'ORLD', flip: true },
          { ch: 'M', w: 5, rem: 'ODEL' },
        ];
        const lockGx = [0, 4, 10];
        const eCell = 15, lockCell = 30;
        const lockW = 35, lockOX = (W - lockW * lockCell) / 2, lockOY = (H - 5 * lockCell) / 2;

        let eX = [], eY = [], remX = [];
        const slideP = e(F.clamp01((ph.tail - 0.3) / 0.65));
        const midW = L(F.measure('ULTIMODAL'), F.measure('ORLD'), slideP);
        const x0 = 0, x1 = F.measure('LARGE') + 4, x2 = x1 + 5 + 1 + midW + 4;
        const blockW = x2 + F.measure('MODEL'), blockX = (W - blockW * eCell) / 2, y = (H - 5 * eCell) / 2;
        const xs = [x0, x1, x2];
        for (let i = 0; i < 3; i++) { eX[i] = blockX + xs[i] * eCell; eY[i] = y; remX[i] = eX[i] + (inits[i].w + 1) * eCell; }

        const flipAmt = t < 0.40 ? 0 : t <= 0.74 ? e(s(t, 0.40, 0.60)) : 1 - e(s(t, 0.74, 0.86));
        // At rest the mark sits on 'Lab' exactly as in the logo lockup, then
        // flies to the middle M to serve as the flip pivot while expanded.
        const lcxLab = lockOX + 30.5 * lockCell, lcyLab = lockOY + 2.5 * lockCell;
        const ecx1 = eX[1] + 2.5 * eCell, ecy1 = eY[1] + 2.5 * eCell;
        const pivCx = L(lcxLab, ecx1, ph.expand), pivCy = L(lcyLab, ecy1, ph.expand);
        const markW = L(10.5 * lockCell, 10 * eCell, ph.expand);
        const bgRot = L(-0.12, -0.14 + Math.sin(now / 1000 * 0.5) * 0.035, ph.expand) + flipAmt * 0.42;
        this.drawMark(ctx, pivCx, pivCy, markW, 1, bgRot, pal);

        this.drawStr(ctx, 's-Lab', lockOX + 16 * lockCell, lockOY, lockCell, this.CY, ph.suffix, pal, true);

        for (let i = 0; i < 3; i++) {
          const it = inits[i];
          const lcx = lockOX + (lockGx[i] + it.w / 2) * lockCell, lcy = lockOY + 2.5 * lockCell;
          const ecx = eX[i] + it.w / 2 * eCell, ecy = eY[i] + 2.5 * eCell;
          const ei = ph.expand;
          const cell = L(lockCell, eCell, ei);
          const cx = L(lcx, ecx, ei), cy = L(lcy, ecy, ei);
          const ox = cx - it.w / 2 * cell, oy = cy - 2.5 * cell;

          const remA = e(s(t, 0.14, 0.30));
          const remOut = 1 - e(s(t, 0.86, 0.98));
          const rvis = remA * remOut;
          const rox = remX[i], roy = eY[i];
          if (it.flip) {
            this.drawWordSwap(ctx, rox, roy, eCell, it.remA, it.remB, ph.tail, pal, rvis);
          } else {
            this.drawStr(ctx, it.rem, rox, roy, eCell, this.CY, rvis, pal, true);
          }

          if (it.flip && t >= 0.40 && ei > 0.5) {
            this.drawFlip(ctx, 'M', ox, oy, cell, 1, pal, this.flipFnFor(t, 0.12));
          } else {
            this.drawStr(ctx, it.ch, ox, oy, cell, this.CY, 1, pal, true);
          }
        }

        // Near rest the logo paints the mark over the glyphs; fading a second
        // copy on top (same geometry) crossfades the paint order without a pop.
        const overlay = 1 - F.clamp01(ph.expand * 3);
        if (overlay > 0.001) this.drawMark(ctx, pivCx, pivCy, markW, overlay, bgRot, pal);
      },

      sceneC(ctx, W, H, t, pal, now) {
        const F = window.LMMSFont, e = F.easeInOut, s = F.seg, L = F.lerp;
        const ph = this.phases(t);
        const lockCell = 24, lockW = 35;
        const lockOX = (W - lockW * lockCell) / 2, lockOY = (H - 5 * lockCell) / 2;
        const lockA = Math.max(1 - e(s(t, 0.09, 0.24)), e(s(t, 0.90, 1.0)));
        if (lockA > 0.01) {
          this.drawStr(ctx, 'LMMs', lockOX, lockOY, lockCell, this.CY, lockA, pal, true);
          this.drawStr(ctx, 's-Lab', lockOX + 16 * lockCell, lockOY, lockCell, this.CY, lockA, pal, true);
          this.drawMark(ctx, lockOX + 30.5 * lockCell, lockOY + 2.5 * lockCell, 10.5 * lockCell, lockA * 0.96, -0.12, pal);
        }

        const heroA = e(s(t, 0.12, 0.30)) * (1 - e(s(t, 0.86, 0.99)));
        const heroCell = 72, hgw = 5;
        const hx = (W - hgw * heroCell) / 2, hy = (H - 5 * heroCell) / 2 - 58;
        const cx = hx + hgw / 2 * heroCell, cy = hy + 2.5 * heroCell;

        const flipRaw = t < 0.4 ? 0 : t < 0.74 ? F.physFlip(F.seg(t, 0.40, 0.60)) : 1 - F.physFlip(F.seg(t, 0.74, 0.86));
        const pivotRot = -0.1 + Math.sin(now / 1000 * 0.5) * 0.02 + flipRaw * 0.42;
        this.drawMark(ctx, cx, cy, heroCell * 6.2, heroA, pivotRot, pal);

        if (heroA > 0.01) {
          this.drawFlip(ctx, 'M', hx, hy, heroCell, heroA, pal, this.flipFnFor(t, 0.12));
        }

        const pCell = 12;
        const slideP = F.easeInOut(F.clamp01((ph.tail - 0.3) / 0.65));
        const midW = L(F.measure('MULTIMODAL'), F.measure('WORLD'), slideP);
        const totalC = F.measure('LARGE') + 4 + midW + 4 + F.measure('MODEL');
        const px0 = (W - totalC * pCell) / 2, py = hy + 5 * heroCell + 66;
        this.drawStr(ctx, 'LARGE', px0, py, pCell, this.CY, heroA, pal, true);
        const midX = px0 + (F.measure('LARGE') + 4) * pCell;
        this.drawWordSwap(ctx, midX, py, pCell, 'MULTIMODAL', 'WORLD', ph.tail, pal, heroA);
        const modX = midX + (midW + 4) * pCell;
        this.drawStr(ctx, 'MODEL', modX, py, pCell, this.CY, heroA, pal, true);
      },
    };
    return R;
  }
  global.LMMSRender = { make };
})(typeof window !== 'undefined' ? window : globalThis);

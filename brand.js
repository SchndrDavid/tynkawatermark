// Společné prvky značky Pánský kadeřník – sdílí je stránky Grafika a Loga.
(function (g) {
  'use strict';

  const C = {
    bg: '#121213', panel: '#1c1d1f', frame: '#2e3033', ink: '#ece6da', cream: '#f4f0e8',
    muted: '#8a8c8f', soft: '#c9cacc', dots: '#4a4c50', dotsMuted: '#2e3033',
    accent: '#9E814D', dark: '#161617',
  };

  // Nůžky v kruhu (souřadnice 0–1000). accent = null → bez kruhu.
  function drawLogo(ctx, x, y, size, ink, accent) {
    const k = size / 1000, rad = Math.PI / 180;
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.lineCap = 'round';
    if (accent) {
      ctx.strokeStyle = accent; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(500, 500, 390, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.translate(500, 500); ctx.rotate(-45 * rad);
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 40;
    ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
    for (const [rot, x1, cy] of [[-21, -220, 62], [21, -150, -62]]) {
      ctx.save(); ctx.rotate(rot * rad);
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(280, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(-150, cy, 62, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function logoSVG(ink, accent, bg) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">` +
      (bg ? `<rect width="1000" height="1000" fill="${bg}"/>` : '') +
      (accent ? `<circle cx="500" cy="500" r="390" fill="none" stroke="${accent}" stroke-width="12"/>` : '') +
      `<g transform="translate(500 500) rotate(-45)" fill="none" stroke="${ink}" stroke-width="40" stroke-linecap="round">` +
      `<circle r="36" fill="${ink}" stroke="none"/>` +
      `<g transform="rotate(-21)"><line x1="-220" y1="0" x2="280" y2="0"/><circle cx="-150" cy="62" r="62"/></g>` +
      `<g transform="rotate(21)"><line x1="-150" y1="0" x2="280" y2="0"/><circle cx="-150" cy="-62" r="62"/></g>` +
      `</g></svg>`;
  }

  // Knírek (viewBox 120 × 40)
  const STACHE = 'M60 16 C64 9 72 7 80 11 C88 15 94 20 102 18 C108 16 110 11 107 8 C113 10 115 18 110 24 C103 31 88 30 78 26 C70 23 64 22 60 24 Z';
  function drawStache(ctx, cx, y, w, color) {
    const k = w / 120, path = new Path2D(STACHE);
    ctx.save(); ctx.fillStyle = color;
    ctx.translate(cx - w / 2, y); ctx.scale(k, k);
    ctx.fill(path);
    ctx.translate(120, 0); ctx.scale(-1, 1); ctx.fill(path);
    ctx.restore();
  }
  function stacheSVG(color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="1200" height="400"><g fill="${color}">` +
      `<path d="${STACHE}"/><path transform="matrix(-1 0 0 1 120 0)" d="${STACHE}"/></g></svg>`;
  }

  // Načtení písem před kreslením do canvasu
  function loadFonts() {
    if (!document.fonts) return Promise.resolve();
    return Promise.all([
      '400 40px "Bodoni Moda"', '500 40px "Bodoni Moda"',
      '300 40px Jost', '400 40px Jost', 'italic 300 40px Jost',
    ].map((f) => document.fonts.load(f).catch(() => {})));
  }

  // Uložení: na mobilu sdílení (→ Uložit do Fotek), na počítači stažení
  const coarse = matchMedia('(pointer: coarse)').matches;
  async function deliver(files, opts) {
    opts = opts || {};
    if (coarse && navigator.canShare && navigator.canShare({ files })) {
      try { await navigator.share({ files }); return; }
      catch (e) {
        if (e.name === 'AbortError') return;
        if (opts.wasLate) { toast('Připraveno – klepni ještě jednou.'); return; }
      }
    }
    for (const f of files) {
      const a = document.createElement('a'), url = URL.createObjectURL(f);
      a.href = url; a.download = f.name; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      await new Promise((r) => setTimeout(r, 350));
    }
    toast(files.length > 1 ? `Staženo ${files.length} souborů` : 'Staženo');
  }
  function canvasFile(canvas, name, type) {
    type = type || 'image/png';
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(new File([b], name, { type, lastModified: Date.now() })) : rej(new Error('toBlob'))), type, 0.95));
  }
  function textFile(text, name, type) { return new File([text], name, { type, lastModified: Date.now() }); }

  let tt;
  function toast(m) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.append(t); }
    t.textContent = m; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function registerSW() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  g.Brand = { C, drawLogo, logoSVG, drawStache, stacheSVG, loadFonts, deliver, canvasFile, textFile, toast, registerSW };
})(window);

/* Animated chibi for the menus: the idle art from chars.json drawn on a canvas, breathing (slight squash at the feet)
   and blinking (half → closed → half, sometimes twice), like the idle in the fight engines.
   CHIBI.set(canvas, id) points a canvas at a character; one animation loop draws every visible chibi canvas. */
const CHIBI = (() => {
  let D = null; const IM = {}, CV = new Map(); let raf = 0;
  const ready = fetch('chars.json').then(r => r.json()).then(d => { D = d; for (const k in d) { const c = d[k]; IM[k] = { base: img(c.src), half: img(c.blink.half), closed: img(c.blink.closed) } } kick() });
  function img(src) { const i = new Image(); i.src = src; return i }
  function set(cv, id) {
    if (!cv) return; let s = CV.get(cv);
    if (!s) { s = { id: null, t0: performance.now() / 1000 + Math.random() * 3, next: 0, bt: -1, dbl: false }; CV.set(cv, s) }
    if (s.id !== id) { s.id = id; s.next = performance.now() / 1000 + 1 + Math.random() * 2; s.bt = -1; size(cv, s) }
    kick()
  }
  function size(cv, s) { if (!D || !D[s.id]) return; const c = D[s.id]; cv.width = c.w * 2; cv.height = c.h * 2 }
  function eye(s, t) { // blink timing, seconds: half .05 · closed .07 · half .05
    if (s.bt < 0) { if (t > s.next) { s.bt = t; s.dbl = Math.random() < .25 } else return 'open' }
    const u = t - s.bt, L = .17;
    if (u < L || (s.dbl && u > L + .12 && u < 2 * L + .12)) { const v = u < L ? u : u - L - .12; return v < .05 || v > .12 ? 'half' : 'closed' }
    if (u > (s.dbl ? 2 * L + .12 : L)) { s.bt = -1; s.next = t + 2.2 + Math.random() * 3.2 }
    return 'open'
  }
  function draw(cv, s, t) {
    const c = D && D[s.id], m = IM[s.id]; if (!c || !m || !m.base.complete) return;
    if (cv.width !== c.w * 2) size(cv, s);
    const x = cv.getContext('2d'), k = 2; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    const b = Math.sin((t - s.t0) * 2.3); // breathing: a little taller / narrower, anchored at the feet
    x.setTransform(k * (1 - .005 * b), 0, 0, k * (1 + .011 * b), c.ax * k, c.ay * k * 1); x.translate(-c.ax, -c.ay);
    x.drawImage(m.base, 0, 0, c.w, c.h);
    const e = eye(s, t); if (e !== 'open') { const r = c.blink.rect, p = m[e]; if (p && p.complete) x.drawImage(p, r[0], r[1], r[2], r[3]) }
  }
  function loop() {
    raf = 0; const t = performance.now() / 1000; let any = false;
    for (const [cv, s] of CV) { if (!cv.isConnected) { CV.delete(cv); continue } if (cv.offsetParent === null) continue; any = true; draw(cv, s, t) }
    if (any || CV.size) raf = requestAnimationFrame(loop)
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop) }
  return { set, ready };
})();

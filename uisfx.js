/* Menu sounds. Recorded files in sfx/ui_<name>.mp3 are used when present; otherwise a short synth stand-in plays.
   Names: click, back, lock, found, count, go */
const UISFX = (() => {
  let ac = null, bus = null; const BUF = {}, TRIED = {};
  const NAMES = ['click', 'back', 'lock', 'found', 'count', 'go'];
  let vol = .7; try { const v = JSON.parse(localStorage.getItem('mf_vol') || 'null'); if (v && v.s != null) vol = v.s / 100 } catch (e) {}
  function init() {
    if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return }
    bus = ac.createGain(); bus.gain.value = vol; bus.connect(ac.destination);
    for (const n of NAMES) if (!TRIED[n]) { TRIED[n] = 1; fetch('sfx/ui_' + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(b => b && ac.decodeAudioData(b)).then(d => { if (d) BUF[n] = d }).catch(() => {}) }
  }
  function tone(f, d, { type = 'sine', v = .2, at = 0, f2 = null } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + .02)
  }
  const SYN = {
    click: () => tone(1250, .05, { type: 'triangle', v: .14 }),
    back: () => tone(700, .07, { type: 'triangle', v: .12, f2: 480 }),
    lock: () => { tone(220, .09, { type: 'square', v: .07 }); tone(180, .12, { type: 'square', v: .07, at: .07 }) },
    found: () => { tone(784, .14, { v: .16 }); tone(1046, .16, { v: .16, at: .08 }); tone(1568, .3, { v: .14, at: .16 }) },
    count: () => tone(880, .09, { v: .16 }),
    go: () => { tone(1318, .3, { v: .18 }); tone(1760, .35, { v: .12, at: .04 }) },
  };
  function play(n) {
    init(); if (!ac) return; if (ac.state === 'suspended') ac.resume();
    const b = BUF[n]; if (b) { const s = ac.createBufferSource(); s.buffer = b; s.connect(bus); s.start(); return }
    SYN[n] && SYN[n]()
  }
  return { play, init };
})();

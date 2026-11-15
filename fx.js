/* Item and pet effects (design: docs "สรุประบบเกม" → เอฟเฟกต์ไอเทม / เอฟเฟกต์สัตว์เลี้ยง, 15 พ.ย.).
   Every value list has 6 entries: upgrade level +0 … +5.
   Stats are added straight onto the character's base stats [โจมตี, ป้องกัน, สปีด, เสน่ห์] (4–10 each). */
const FX = (() => {
  const S = { atk: 0, def: 1, spd: 2, cha: 3 }, SN = ['โจมตี', 'ป้องกัน', 'สปีด', 'เสน่ห์'];
  const T = { // stat steps by tier and how many stats the thing raises
    c3main: [2, 3, 3, 4, 4, 5], c3: [1, 2, 2, 3, 3, 4], c4: [1, 2, 2, 3, 3, 4], s2: [1, 2, 2, 3, 3, 4], s3: [1, 1, 2, 2, 3, 3],
    M: [2, 2, 3, 3, 4, 4], Y: [1, 2, 2, 3, 3, 4], G: [1, 1, 2, 2, 3, 3], // effect items / pets also add 2 stats: Magnum Opus·Celestial / Symphony·Mythic / Guardian
    e1: [1, 2, 2, 3, 3, 4], e2: [1, 1, 2, 2, 3, 3], f3: [1, 1, 2, 2, 3, 3], f4: [1, 1, 1, 2, 2, 3], p2: [1, 1, 2, 2, 3, 3], p3: [1, 1, 1, 2, 2, 2],
  };
  const st = (spec) => ({ stat: spec }); // {atk:[...], ...}
  const mk = (list, steps, main) => { const o = {}; for (const k of list) o[k] = k === main ? T.c3main : steps; return st(o) };
  const D = {
    // ---- items: Magnum Opus ----
    'i:crestring': { stat: { def: T.M, cha: T.M }, k: 'autoLow', v: [10, 20, 30, 40, 50, 60], t: 'โดนตี lv1–2 กันได้อัตโนมัติ 100% · โดน lv3 ลดดาเมจ {v}%' },
    'i:cleforigin': { stat: { cha: T.M, spd: T.M }, k: 'rainbowAll', v: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5], t: 'ลูกศรทุกตัวเป็นสีรุ้ง คะแนนต่อลูกศร ×{v}' },
    'i:pianosigil': { stat: { cha: T.M, def: T.M }, k: 'teamShare', v: [10, 20, 30, 40, 50, 60], t: 'เพื่อนร่วมทีมได้ {v}% ของ ZP ที่เรากดได้ (โหมดทีม / บอส)' },
    'i:requiemwings': { stat: { spd: [20, 21, 22, 23, 24, 25] } },
    'i:symphonyorb': { stat: { cha: T.M, spd: T.M }, k: 'combo', v: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6], t: 'PERFECT ติดกันครบ 5 ชุด คะแนน ×{v} จนกว่าจะพลาด' },
    // ---- Symphony ----
    'i:maestrogloves': { stat: { atk: T.Y, spd: T.Y }, k: 'pierce', v: [10, 15, 20, 25, 30, 35], t: 'ตีเข้า ดาเมจหลังหักการกันแล้ว +{v}%' },
    'i:phoenixlyre': { stat: { atk: T.Y, cha: T.Y }, k: 'perfectHit', v: [10, 20, 30, 40, 50, 60], t: 'ตีด้วย PERFECT แรงขึ้น {v}%' },
    'i:musicbox': { stat: { cha: T.Y, def: T.Y }, k: 'rainbowHalf', v: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5], t: 'ลูกศรครึ่งหนึ่ง (สุ่ม) เป็นสีรุ้ง คะแนน ×{v}' },
    'i:aurorabow': { stat: { cha: T.Y, atk: T.Y }, k: 'rainbowUp', v: [5, 10, 15, 20, 25, 30], t: 'คะแนนลูกศรสีรุ้ง +{v}%' },
    'i:crownchords': { k: 'allStat', v: [20, 40, 60, 80, 100, 120], t: 'ค่าสเตตัสทั้งหมด +{v}% จากพื้นฐาน' },
    'i:royaltrumpet': { stat: { spd: T.Y, atk: T.Y }, k: 'startGauge', v: [10, 20, 30, 40, 50, 60], t: 'เริ่มเกมพร้อมเกจ {v}%' },
    'i:prismcrystal': { stat: { def: T.Y, spd: T.Y }, k: 'failCut', v: [30, 35, 40, 45, 50, 55], t: 'กดกันแล้วกันไม่ได้ ดาเมจลด {v}%' },
    // ---- Concerto (3–4 stats, ⭐ = main) ----
    'i:baton': mk(['atk', 'spd', 'cha'], T.c3, 'atk'), 'i:ocarina': mk(['cha', 'spd', 'def'], T.c3, 'cha'), 'i:encoreribbon': mk(['atk', 'def', 'spd', 'cha'], T.c4),
    'i:echoring': mk(['def', 'cha', 'atk'], T.c3, 'def'), 'i:starmic': mk(['cha', 'atk', 'spd'], T.c3, 'cha'), 'i:flutebrooch': mk(['spd', 'cha', 'def'], T.c3, 'spd'),
    'i:thunderdrum': mk(['atk', 'spd', 'def'], T.c3, 'atk'), 'i:velvetcape': mk(['atk', 'def', 'spd', 'cha'], T.c4),
    // ---- Sonata (2–3) ----
    'i:tuningfork': mk(['spd', 'cha'], T.s2), 'i:whistle': mk(['atk', 'spd'], T.s2), 'i:drumstickpin': mk(['atk', 'spd', 'cha'], T.s3), 'i:harmonica': mk(['cha', 'def'], T.s2),
    'i:sneakers': mk(['spd', 'def'], T.s2), 'i:castanet': mk(['atk', 'cha'], T.s2), 'i:vinylbadge': mk(['def', 'cha', 'spd'], T.s3), 'i:pianoscarf': mk(['def', 'atk'], T.s2),
    'i:cymbalbangle': mk(['atk', 'def', 'spd'], T.s3), 'i:speakerpack': mk(['atk', 'def', 'cha'], T.s3),
    // ---- Étude (1–2) ----
    'i:badge': mk(['def'], T.e1), 'i:metronome': mk(['spd'], T.e1), 'i:wristband': mk(['atk', 'spd'], T.e2), 'i:guitarpick': mk(['atk'], T.e1), 'i:sheetclip': mk(['cha'], T.e1),
    'i:rosin': mk(['cha', 'spd'], T.e2), 'i:trebleclip': mk(['cha', 'def'], T.e2), 'i:pencil': mk(['atk', 'cha'], T.e2), 'i:cassette': mk(['def', 'spd'], T.e2), 'i:bellbracelet': mk(['atk', 'def'], T.e2),
    // ---- pets: Celestial / Mythic ----
    'p:phoenixchick': { stat: { atk: T.M, spd: T.M }, k: 'petHit', v: [20, 30, 40, 50, 60, 70], t: 'ตีเข้า ดาเมจบวกเพิ่ม {v}% (สัตว์ช่วยตี)' },
    'p:starwhale': { stat: { cha: T.M, def: T.M }, k: 'charmTick', v: [20, 18, 16, 14, 12, 10], x: 40, t: 'ได้ ZP = เสน่ห์ × 40 ทุก {v} วิ' },
    'p:crestgriffin': { stat: { def: T.M, atk: T.M }, k: 'autoGuard', v: [90, 80, 70, 60, 50, 40], cut: 1, t: 'กันให้อัตโนมัติ 100% · คูลดาวน์ {v} วิ' },
    'p:harpdragon': { stat: { atk: T.Y, cha: T.Y }, k: 'petHit', v: [10, 15, 20, 25, 30, 35], t: 'ตีเข้า ดาเมจบวกเพิ่ม {v}%' },
    'p:moonrabbit': { stat: { cha: T.Y, spd: T.Y }, k: 'charmTick', v: [20, 18, 16, 14, 12, 10], x: 20, t: 'ได้ ZP = เสน่ห์ × 20 ทุก {v} วิ' },
    'p:crystalfly': { stat: { def: T.Y, cha: T.Y }, k: 'autoGuard', v: [90, 80, 70, 60, 50, 40], cut: .5, t: 'กันให้อัตโนมัติ ลดดาเมจ 50% · คูลดาวน์ {v} วิ' },
    // ---- Guardian ----
    'p:flamesparrow': { stat: { atk: T.G, spd: T.G }, k: 'petStrike', v: [500, 550, 600, 650, 700, 750], every: [50, 47, 44, 41, 38, 35], t: 'ตีศัตรูเอง {v} ZP กันไม่ได้ · ทุก {e} วิ' },
    'p:frostfox': { stat: { def: T.G, spd: T.G }, k: 'dmgCut', v: [5, 10, 15, 20, 25, 30], t: 'ดาเมจที่ได้รับลด {v}% (กันหรือไม่กันก็ได้)' },
    'p:thunderpup': { k: 'first', stat: { spd: [2, 4, 6, 8, 10, 12] }, t: 'ตีชนกันสปีดเท่ากัน ได้ตีก่อนเสมอ' },
    'p:lanterncat': { stat: { cha: T.G, def: T.G }, k: 'flatTick', v: [80, 90, 100, 110, 120, 130], every: [30, 28, 26, 24, 22, 20], up: [1, 1.5, 2, 2.5, 3, 3.5], t: 'ได้ {v} ZP ทุก {e} วิ · ZP จากการกด +{u}%' },
    // ---- Familiar (3–4) / Sprite (2–3) ----
    'p:metroowl': mk(['spd', 'def', 'cha'], T.f3), 'p:drumjelly': mk(['atk', 'def', 'spd', 'cha'], T.f4), 'p:tambee': mk(['spd', 'cha', 'atk'], T.f3),
    'p:choirghost': mk(['atk', 'def', 'spd', 'cha'], T.f4), 'p:recordswallow': mk(['spd', 'atk', 'cha'], T.f3),
    'p:noteling': mk(['cha', 'spd'], T.p2), 'p:bubblefish': mk(['def', 'cha'], T.p2), 'p:puffcloud': mk(['def', 'cha', 'spd'], T.p3),
    'p:scorecrane': mk(['spd', 'atk'], T.p2), 'p:bellbat': mk(['atk', 'def', 'cha'], T.p3),
  };
  const L = lv => Math.max(0, Math.min(5, lv | 0));
  // human-readable effect at a level
  function text(key, lv) {
    const d = D[key]; if (!d) return 'รอกำหนด'; const i = L(lv), out = [];
    if (d.stat) out.push(Object.entries(d.stat).map(([s, a]) => SN[S[s]] + ' +' + a[i]).join(' · '));
    if (d.t) out.push(d.t.replace('{v}', d.v ? d.v[i] : '').replace('{e}', d.every ? d.every[i] : '').replace('{u}', d.up ? d.up[i] : ''));
    return out.join(' · ');
  }
  // everything one side carries, flattened: {stat:[4], k: value, ...}
  function build(keys) {
    const r = { add: [0, 0, 0, 0], pct: 0 };
    for (const [key, lv] of keys) {
      const d = D[key]; if (!d) continue; const i = L(lv);
      if (d.stat) for (const [s, a] of Object.entries(d.stat)) r.add[S[s]] += a[i];
      if (d.k === 'allStat') r.pct += d.v[i];
      else if (d.k === 'first') r.first = true;
      else if (d.k === 'petStrike') r.petStrike = { dmg: d.v[i], every: d.every[i] };
      else if (d.k === 'flatTick') r.flatTick = { zp: d.v[i], every: d.every[i], up: d.up[i] };
      else if (d.k === 'charmTick') r.charmTick = { x: d.x, every: d.v[i] };
      else if (d.k === 'autoGuard') r.autoGuard = { cd: d.v[i], cut: d.cut };
      else if (d.k === 'rainbowAll' || d.k === 'rainbowHalf') { r[d.k] = d.v[i]; }
      else if (d.k) r[d.k] = (r[d.k] || 0) + d.v[i];
    }
    return r;
  }
  return { D, text, build, SN };
})();

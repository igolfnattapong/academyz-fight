/* Wallet, items, pets, boxes and tickets (stored in this browser for now; moves to the server with online play).
   Design: docs "สรุประบบเกม" → ระบบเงินและบัตร / ร้านค้า / กล่องสุ่ม. Prices and rates are drafts. */
const INV = (() => {
  const K = 'mf_inv';
  const RANK = { S: { col: '#f5b800', dup: 20 }, A: { col: '#a46bff', dup: 8 }, B: { col: '#2f8cff', dup: 4 }, C: { col: '#2fae62', dup: 2 }, D: { col: '#8c95a1', dup: 1 } };
  const I = (r, id, en, th) => ({ id, en, th, r });
  const ITEMS = [
    I('D', 'badge', 'Academy Badge', 'เข็มกลัดนักเรียน'), I('D', 'metronome', 'Metronome Charm', 'ที่ห้อยเมโทรนอม'), I('D', 'wristband', 'Rhythm Wristband', 'ริสแบนด์จังหวะ'),
    I('D', 'guitarpick', 'Guitar Pick', 'ปิ๊กกีตาร์'), I('D', 'sheetclip', 'Sheet Clip', 'คลิปหนีบโน้ต'), I('D', 'rosin', 'Rosin Cube', 'ก้อนยางสน'),
    I('D', 'trebleclip', 'Treble Hairclip', 'กิ๊บกุญแจซอล'), I('D', 'pencil', 'Practice Pencil', 'ดินสอซ้อมโน้ต'), I('D', 'cassette', 'Cassette Keychain', 'พวงกุญแจเทปคาสเซ็ต'),
    I('D', 'bellbracelet', 'Bell Bracelet', 'กำไลกระดิ่ง'),
    I('C', 'tuningfork', 'Tuning Fork', 'ส้อมเสียง'), I('C', 'whistle', 'Silver Whistle', 'นกหวีดเงิน'), I('C', 'drumstickpin', 'Drumstick Pin', 'ปิ่นไม้กลอง'),
    I('C', 'harmonica', 'Harmonica Necklace', 'สร้อยฮาร์โมนิก้า'), I('C', 'sneakers', 'Beat Sneakers', 'รองเท้าจังหวะ'), I('C', 'castanet', 'Castanet Earrings', 'ต่างหูคาสทาเนต'),
    I('C', 'vinylbadge', 'Vinyl Badge', 'เข็มกลัดแผ่นเสียง'), I('C', 'pianoscarf', 'Piano Key Scarf', 'ผ้าพันคอคีย์เปียโน'), I('C', 'cymbalbangle', 'Cymbal Bangle', 'กำไลฉาบ'),
    I('C', 'speakerpack', 'Speaker Backpack', 'กระเป๋าลำโพง'),
    I('B', 'baton', "Conductor's Baton", 'ไม้บาตอง'), I('B', 'ocarina', 'Golden Ocarina', 'โอการิน่าทอง'), I('B', 'encoreribbon', 'Encore Ribbon', 'ริบบิ้นอังคอร์'),
    I('B', 'echoring', 'Echo Ring', 'แหวนเสียงสะท้อน'), I('B', 'starmic', 'Starlight Mic', 'ไมค์แสงดาว'), I('B', 'flutebrooch', 'Silver Flute Brooch', 'เข็มกลัดฟลุตเงิน'),
    I('B', 'thunderdrum', 'Thunder Drum Pendant', 'จี้กลองสายฟ้า'), I('B', 'velvetcape', 'Velvet Cape', 'ผ้าคลุมกำมะหยี่'),
    I('A', 'maestrogloves', 'Maestro Gloves', 'ถุงมือมาเอสโตร'), I('A', 'phoenixlyre', 'Phoenix Lyre', 'พิณฟีนิกซ์'), I('A', 'musicbox', 'Moonlight Music Box', 'กล่องดนตรีแสงจันทร์'),
    I('A', 'aurorabow', 'Aurora Bow', 'คันชักออโรร่า'), I('A', 'crownchords', 'Crown of Chords', 'มงกุฎคอร์ด'), I('A', 'royaltrumpet', 'Royal Trumpet', 'แตรราชสำนัก'),
    I('A', 'prismcrystal', 'Prism Crystal', 'คริสตัลปริซึม'),
    I('S', 'crestring', 'Crimson Crest Ring', 'แหวนตราแดง'), I('S', 'cleforigin', 'Clef of Origin', 'กุญแจซอลต้นกำเนิด'), I('S', 'pianosigil', 'Grand Piano Sigil', 'ตราแกรนด์เปียโน'),
    I('S', 'requiemwings', 'Requiem Wings', 'ปีกเรเควียม'), I('S', 'symphonyorb', 'Symphony Orb', 'ลูกแก้วซิมโฟนี'),
  ];
  const PETS = [
    I('D', 'noteling', 'Noteling', 'ภูตโน้ต'), I('D', 'bubblefish', 'Bubble Fish', 'ปลาฟองสบู่'), I('D', 'puffcloud', 'Puff Cloud', 'เมฆปุย'),
    I('D', 'scorecrane', 'Score Crane', 'นกกระเรียนกระดาษโน้ต'), I('D', 'bellbat', 'Bell Bat', 'ค้างคาวกระดิ่ง'),
    I('C', 'metroowl', 'Metro Owl', 'นกฮูกเมโทรนอม'), I('C', 'drumjelly', 'Drum Jelly', 'แมงกะพรุนกลอง'), I('C', 'tambee', 'Tambourine Bee', 'ผึ้งแทมบูรีน'),
    I('C', 'choirghost', 'Choir Ghost', 'ผีน้อยคอรัส'), I('C', 'recordswallow', 'Record Swallow', 'นกนางแอ่นแผ่นเสียง'),
    I('B', 'flamesparrow', 'Flame Sparrow', 'นกกระจอกเพลิง'), I('B', 'frostfox', 'Frost Fox', 'จิ้งจอกน้ำแข็ง'), I('B', 'thunderpup', 'Thunder Pup', 'ลูกหมาสายฟ้า'),
    I('B', 'lanterncat', 'Lantern Cat', 'แมวโคมไฟ'),
    I('A', 'harpdragon', 'Harp Dragonling', 'มังกรพิณ'), I('A', 'moonrabbit', 'Moon Rabbit', 'กระต่ายจันทร์'), I('A', 'crystalfly', 'Crystal Butterfly', 'ผีเสื้อคริสตัล'),
    I('S', 'phoenixchick', 'Phoenix Chick', 'ลูกนกฟีนิกซ์'), I('S', 'starwhale', 'Star Whale', 'วาฬดารา'), I('S', 'crestgriffin', 'Crest Griffin', 'กริฟฟินตราโรงเรียน'),
  ];

  // tier names used everywhere instead of S/A/B/C/D
  const TIER = {
    item: { D: 'Étude', C: 'Sonata', B: 'Concerto', A: 'Symphony', S: 'Magnum Opus' },
    pet: { D: 'Sprite', C: 'Familiar', B: 'Guardian', A: 'Mythic', S: 'Celestial' },
  };
  const tierName = (kind, r) => TIER[kind === 'pet' ? 'pet' : 'item'][r];
  // student classes (characters) and each character's signature SPECIAL item (effects still to be decided)
  const CLASSES = [
    { id: 'rookie', en: 'Rookie', th: 'นักเรียนทั่วไป' }, { id: 'enforcer', en: 'Enforcer', th: 'สารวัตรนักเรียน' },
    { id: 'gifted', en: 'Gifted', th: 'เด็กกิฟต์' }, { id: 'council', en: 'Council Head', th: 'ประธานนักเรียน' }, { id: 'legacy', en: 'Legacy', th: 'ศิษย์เก่า' },
  ];
  const CHAR_CLASS = { hero: 'rookie', heroine: 'rookie', fire: 'rookie', ice: 'rookie', katana: 'rookie' }; // all 5 are the first class for now
  const SIGNATURE = {
    hero: { th: 'หูฟัง', need: 'ชนะครบ 20 ครั้ง' }, heroine: { th: 'สมุดกับปากกา', need: 'เล่นครบ 50 ครั้ง' },
    fire: { th: 'สนับมือเพลิง', need: 'ชนะด้วยท่าเลเวล 3 ครบ 30 ครั้ง' }, ice: { th: 'เข็มกลัดเกล็ดหิมะ', need: 'กันสำเร็จ (GUARD!!!) ครบ 100 ครั้ง' },
    katana: { th: 'พู่ห้อยดาบ', need: 'ได้ PERFECT ครบ 2,000 ครั้ง' },
  };
  const LOOK = {
    badge: 'เข็มกลัดตราโรงเรียนสีเงิน', metronome: 'เมโทรนอมจิ๋วห้อยกระเป๋า', wristband: 'ริสแบนด์ผ้าสีแดงลายโน้ต', guitarpick: 'ปิ๊กสีแดงร้อยสร้อย',
    sheetclip: 'คลิปทองเหลืองหนีบกระดาษโน้ต', rosin: 'ก้อนยางสนไวโอลินสีอำพัน', trebleclip: 'กิ๊บพลาสติกสีแดงรูปกุญแจซอล', pencil: 'ดินสอแดงหัวยางลบรูปโน้ต',
    cassette: 'เทปคาสเซ็ตจิ๋วห้อยพวงกุญแจ', bellbracelet: 'กำไลเชือกแดงห้อยกระดิ่งเล็ก', tuningfork: 'ส้อมเสียงเงินมีคลื่นเสียงจางๆ', whistle: 'นกหวีดห้อยคอสายแดง',
    drumstickpin: 'ไม้กลองคู่ไขว้เป็นกิ๊บผม', harmonica: 'ฮาร์โมนิก้าจิ๋วห้อยคอ', sneakers: 'รองเท้าผ้าใบขาวเส้นแดง', castanet: 'คาสทาเนตจิ๋วสีแดงดำ',
    vinylbadge: 'แผ่นเสียงดำฉลากแดง', pianoscarf: 'ผ้าพันคอลายคีย์เปียโนขาวดำ', cymbalbangle: 'กำไลทองเหลืองรูปฉาบ', speakerpack: 'กระเป๋าเป้มีลำโพงกลมด้านหน้า',
    baton: 'ไม้บาตองด้ามทอง ปลายเรืองแสง', ocarina: 'โอการิน่าทองสลักลาย', encoreribbon: 'โบว์แดงขอบทองระย้ายาว', echoring: 'แหวนเงินฝังคริสตัลฟ้า มีวงเสียงรอบ',
    starmic: 'ไมค์ทองประดับดาว', flutebrooch: 'ฟลุตเงินจิ๋วติดอก', thunderdrum: 'กลองจิ๋วลายสายฟ้าสีฟ้า', velvetcape: 'ผ้าคลุมแดงขลิบทอง ลายบรรทัดห้าเส้น',
    maestrogloves: 'ถุงมือขาวปักกุญแจซอลทอง', phoenixlyre: 'พิณไลร์จิ๋วรูปปีกนกไฟ', musicbox: 'กล่องดนตรีเงินมีพระจันทร์เสี้ยว', aurorabow: 'คันชักไวโอลินเรืองแสงหลายสี',
    crownchords: 'มงกุฎทองรูปโน้ตเรียงกัน', royaltrumpet: 'แตรทองห้อยธงแดง', prismcrystal: 'คริสตัลลอยได้ หักแสงเป็นสีรุ้ง',
    crestring: 'แหวนทองฝังทับทิมแดง สลักตราโรงเรียน', cleforigin: 'กุญแจซอลทองลอยได้ มีออร่าสีรุ้ง', pianosigil: 'วงเวททองรูปเปียโนลอยหลังตัว',
    requiemwings: 'ปีกทำจากโน้ตดนตรีสีแดงทอง', symphonyorb: 'ลูกแก้วมีวงออร์เคสตราจิ๋วข้างใน',
    noteling: 'โน้ตเขบ็ตสีดำมีหน้าตา ปีกเล็กสองข้าง', bubblefish: 'ปลาทองในฟองสบู่ใส', puffcloud: 'เมฆขาวก้อนกลม หน้ายิ้ม มีโน้ตลอยออกมา',
    scorecrane: 'นกกระเรียนพับจากกระดาษโน้ต', bellbat: 'ค้างคาวกลมๆ ตัวเป็นกระดิ่งทอง', metroowl: 'นกฮูกตัวสามเหลี่ยม หางเป็นเข็มเมโทรนอม',
    drumjelly: 'หัวเป็นกลองแดง หนวดเป็นสายริบบิ้น', tambee: 'ผึ้งอ้วน ปีกเป็นแทมบูรีน', choirghost: 'ผีผ้าห่มขาวใส่คอปกแดง อ้าปากร้องเพลง',
    recordswallow: 'นกนางแอ่นดำ ปีกลายร่องแผ่นเสียง', flamesparrow: 'นกกลมสีส้มแดง หางเป็นเปลวไฟ', frostfox: 'จิ้งจอกขาวฟ้าตัวลอย หางเกล็ดหิมะ',
    thunderpup: 'ลูกหมาเหลืองนั่งบนก้อนเมฆ หูสายฟ้า', lanterncat: 'แมวดำกอดโคมไฟกระดาษแดง ลอยได้', harpdragon: 'มังกรน้อยสีแดง ปีกเป็นพิณสายทอง',
    moonrabbit: 'กระต่ายขาวนั่งบนพระจันทร์เสี้ยว', crystalfly: 'ผีเสื้อปีกคริสตัลฟ้า ลายบรรทัดห้าเส้น', phoenixchick: 'ลูกนกไฟแดงทอง มีมงกุฎเปลวไฟ',
    starwhale: 'วาฬน้อยสีกรมท่า ตัวมีดาวกะพริบ', crestgriffin: 'กริฟฟินน้อยแดงทอง สวมผ้าคลุมตรากุญแจซอล (มาสคอตโรงเรียน)',
  };
  const byId = {}; for (const x of ITEMS) byId['i:' + x.id] = { ...x, kind: 'item', img: 'art/items/' + x.id + '.png', tier: TIER.item[x.r], look: LOOK[x.id] };
  for (const x of PETS) byId['p:' + x.id] = { ...x, kind: 'pet', img: 'art/pets/' + x.id + '.png', tier: TIER.pet[x.r], look: LOOK[x.id] };
  // boxes: [high, low] rank, chance of the high one, pity (the high rank is certain on that pull), prices
  const BOX = [
    { id: 'd', th: 'ธรรมดา', hi: 'C', lo: 'D', p: .20, pity: 10, cost: { coin: 200 } },
    { id: 'c', th: 'พิเศษ', hi: 'B', lo: 'C', p: .15, pity: 15, cost: { coin: 600 } },
    { id: 'b', th: 'หายาก', hi: 'A', lo: 'B', p: .10, pity: 20, cost: { coin: 2000, gem: 40 } },
    { id: 'a', th: 'ตำนาน', hi: 'S', lo: 'A', p: .03, pity: 50, cost: { gem: 120 } },
  ];
  const PACKS = [
    { id: 'coin_s', th: 'Crest Coin ถุงเล็ก', give: { coin: 500 }, cost: { gem: 10 } },
    { id: 'coin_m', th: 'Crest Coin ถุงกลาง', give: { coin: 2500 }, cost: { gem: 45 } },
    { id: 'coin_l', th: 'Crest Coin หีบใหญ่', give: { coin: 6000 }, cost: { gem: 90 } },
    { id: 'rune_s', th: 'Rune Shard ชุดเล็ก', give: { rune: 5 }, cost: { gem: 20 }, week: 1 },
    { id: 'rune_m', th: 'Rune Shard ชุดกลาง', give: { rune: 25 }, cost: { gem: 90 }, week: 1 },
    { id: 'rune_l', th: 'Rune Shard ชุดใหญ่', give: { rune: 50 }, cost: { gem: 170 }, week: 1 },
  ];
  const RUNE_WEEK = 3; // Rune Shard packs a player can buy per week (so players who don't top up keep up)
  // entry tickets: free ones refill one at a time up to the cap; bought ones can go past it
  const TICK = { ranked: { th: 'บัตรแรงค์', cap: 10, every: 3600e3, cost: { coin: 100 }, day: 10 }, boss: { th: 'บัตรล่าบอส', cap: 5, every: 3 * 3600e3, cost: { coin: 300 }, day: 5 } };
  const BOOST = { exp: { th: 'บัตรคูณ EXP ×2 (1 ชม.)', cost: { gem: 30 } }, coin: { th: 'บัตรคูณ Crest Coin ×2 (1 ชม.)', cost: { gem: 30 } } };
  const COIN = { win: 50, draw: 30, lose: 20 }, RANKED_X = 1.2, BOT_X = .3;
  const CUR = { coin: 'Crest Coin', gem: 'Z-Gem', rune: 'Rune Shard' };
  const day = () => new Date().toDateString(), week = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toDateString() };
  function fresh() {
    return { coin: 5000, gem: 300, rune: 0, test: 1, // test-period money: there is no way to top up yet
      own: {}, pity: {}, eq: { item: [null, null, null], special: [null, null], pet: null },
      tick: { ranked: { n: 10, t: Date.now() }, boss: { n: 5, t: Date.now() } }, bought: { day: day(), ranked: 0, boss: 0, week: week(), rune: 0 }, boost: {} };
  }
  function load() {
    let v = null; try { v = JSON.parse(localStorage.getItem(K) || 'null') } catch (e) {}
    if (!v || typeof v.coin !== 'number') v = fresh();
    const now = Date.now();
    for (const k in TICK) { const t = v.tick[k] || (v.tick[k] = { n: TICK[k].cap, t: now }); if (t.n >= TICK[k].cap) t.t = now; else { const add = Math.floor((now - t.t) / TICK[k].every); if (add > 0) { t.n = Math.min(TICK[k].cap, t.n + add); t.t = t.n >= TICK[k].cap ? now : t.t + add * TICK[k].every } } }
    if (!v.lv) v.lv = {};
    // test period: every item and pet is unlocked so all effects can be tried (levels set in the library)
    if (v.test && !v.allOwn) { for (const k in byId) v.own[k] = 1; v.allOwn = 1; }
    if (v.bought.day !== day()) Object.assign(v.bought, { day: day(), ranked: 0, boss: 0 });
    if (v.bought.week !== week()) Object.assign(v.bought, { week: week(), rune: 0 });
    return v;
  }
  const save = v => { try { localStorage.setItem(K, JSON.stringify(v)) } catch (e) {} };
  const can = (v, cost) => Object.entries(cost).every(([c, n]) => v[c] >= n);
  const pay = (v, cost) => { for (const [c, n] of Object.entries(cost)) v[c] -= n };
  // one pull from a box of kind 'item' | 'pet'
  function pull(v, kind, b) {
    const key = kind + b.id, list = (kind === 'pet' ? PETS : ITEMS);
    v.pity[key] = (v.pity[key] || 0) + 1;
    const hi = v.pity[key] >= b.pity || Math.random() < b.p; if (hi) v.pity[key] = 0;
    const pool = list.filter(x => x.r === (hi ? b.hi : b.lo)), x = pool[Math.floor(Math.random() * pool.length)];
    const id = (kind === 'pet' ? 'p:' : 'i:') + x.id, had = !!v.own[id];
    let rune = 0; if (had) { rune = RANK[x.r].dup; v.rune += rune } else v.own[id] = 1;
    return { ...byId[id], key: id, isNew: !had, rune };
  }
  // buy n boxes (10 → 11) with currency cur; returns {ok, got[], msg}
  function open(kind, boxId, n, cur) {
    const v = load(), b = BOX.find(x => x.id === boxId); if (!b || !(cur in b.cost)) return { ok: false, msg: 'ซื้อไม่ได้' };
    const cost = { [cur]: b.cost[cur] * n }; if (!can(v, cost)) return { ok: false, msg: CUR[cur] + ' ไม่พอ' };
    pay(v, cost); const got = []; for (let i = 0; i < (n === 10 ? 11 : n); i++) got.push(pull(v, kind, b)); save(v); return { ok: true, got, v };
  }
  function buyPack(id) {
    const v = load(), p = PACKS.find(x => x.id === id); if (!p) return { ok: false };
    if (p.week && v.bought.rune >= RUNE_WEEK) return { ok: false, msg: 'สัปดาห์นี้ซื้อแพ็ก Rune Shard ครบ ' + RUNE_WEEK + ' ครั้งแล้ว' };
    if (!can(v, p.cost)) return { ok: false, msg: 'Z-Gem ไม่พอ' };
    pay(v, p.cost); for (const [c, n] of Object.entries(p.give)) v[c] += n; if (p.week) v.bought.rune++; save(v); return { ok: true, v };
  }
  function buyTicket(k) {
    const v = load(), t = TICK[k]; if (v.bought[k] >= t.day) return { ok: false, msg: 'วันนี้ซื้อ' + t.th + 'ครบ ' + t.day + ' ใบแล้ว' };
    if (!can(v, t.cost)) return { ok: false, msg: 'Crest Coin ไม่พอ' };
    pay(v, t.cost); v.tick[k].n++; v.bought[k]++; save(v); return { ok: true, v };
  }
  function buyBoost(k) {
    const v = load(), b = BOOST[k]; if (!can(v, b.cost)) return { ok: false, msg: 'Z-Gem ไม่พอ' };
    pay(v, b.cost); v.boost[k] = Math.max(Date.now(), v.boost[k] || 0) + 3600e3; save(v); return { ok: true, v };
  }
  const boostOn = (v, k) => (v.boost[k] || 0) > Date.now();
  // coins for one finished game (bots pay less so nobody farms them)
  function reward(res, ranked, vsBot) {
    const v = load(); let n = (COIN[res] || 0) * (ranked ? RANKED_X : 1) * (vsBot ? BOT_X : 1); if (boostOn(v, 'coin')) n *= 2;
    n = Math.round(n); v.coin += n; save(v); return n;
  }
  function equip(slot, i, key) { const v = load(); if (key && !v.own[key]) return v; if (slot === 'pet') v.eq.pet = key; else { if (key) v.eq[slot] = v.eq[slot].map(k => k === key ? null : k); v.eq[slot][i] = key } save(v); return v }
  const level = (k, v) => ((v || load()).lv || {})[k] || 0;
  function setLevel(k, n) { const v = load(); v.lv[k] = Math.max(0, Math.min(5, n)); save(v); return v }
  // what one side carries into a game: [[key, level], ...]
  function gear() { const v = load(); const ks = [...v.eq.item, ...v.eq.special, v.eq.pet].filter(k => k && v.own[k]); return ks.map(k => [k, level(k, v)]) }
  const pet = () => { const v = load(); return v.eq.pet && v.own[v.eq.pet] ? v.eq.pet.slice(2) : null };
  return { level, setLevel, gear, TIER, tierName, CLASSES, CHAR_CLASS, SIGNATURE, load, save, open, buyPack, buyTicket, buyBoost, boostOn, reward, equip, pet, can, byId, ITEMS, PETS, RANK, BOX, PACKS, TICK, BOOST, CUR, RUNE_WEEK };
})();

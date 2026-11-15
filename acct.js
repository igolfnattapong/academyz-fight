/* Player account (local for now, moves to the server with online play).
   Account level from EXP: Lv10 unlocks RANKED, Lv25 unlocks TEAM.
   Rank points (RP) from ranked games set the tier; the tier sets the song tempo of ranked matches. */
const ACCT = (() => {
  const K = 'mf_acct';
  const EXP = { win: 100, draw: 60, lose: 40 };          // EXP per game
  const RP = { win: 25, draw: 5, lose: -20 };            // rank points per ranked game (never below 0)
  const UNLOCK = { ranked: 10, team: 25 };
  // tiers every 100 RP; bpm = tempo of ranked matches in that tier (the song is sped up / slowed down to it)
  const TIERS = [
    { name: 'BRONZE', th: 'บรอนซ์', col: '#b9773e', bpm: 120 },
    { name: 'SILVER', th: 'ซิลเวอร์', col: '#8f9bb0', bpm: 132 },
    { name: 'GOLD', th: 'โกลด์', col: '#e0a800', bpm: 144 },
    { name: 'PLATINUM', th: 'แพลทินัม', col: '#2bb3a5', bpm: 156 },
    { name: 'DIAMOND', th: 'ไดมอนด์', col: '#4a7dff', bpm: 168 },
    { name: 'MASTER', th: 'มาสเตอร์', col: '#c8243a', bpm: 180 },
  ];
  const need = lv => 100 + 50 * (lv - 1);                // EXP to go from lv to lv+1 (Lv10 ≈ 45 games, Lv25 ≈ 270 games)
  const load = () => { try { const a = JSON.parse(localStorage.getItem(K) || 'null'); if (a && a.lv) return a } catch (e) {} return { lv: 1, exp: 0, rp: 0, games: 0 } };
  const save = a => { try { localStorage.setItem(K, JSON.stringify(a)) } catch (e) {} };
  const tier = rp => TIERS[Math.min(TIERS.length - 1, Math.floor(Math.max(0, rp) / 100))];
  const unlocked = (a, mode) => a.lv >= (UNLOCK[mode] || 0);
  // apply one finished game; returns what changed so the result screen can show it
  function award(res, ranked) {
    const a = load(), before = { lv: a.lv, rp: a.rp, tier: tier(a.rp).name };
    let gain = EXP[res] || 0; if (typeof INV !== 'undefined' && INV.boostOn(INV.load(), 'exp')) gain *= 2; a.exp += gain; a.games = (a.games || 0) + 1;
    while (a.exp >= need(a.lv)) { a.exp -= need(a.lv); a.lv++ }
    let drp = 0; if (ranked) { drp = RP[res] || 0; a.rp = Math.max(0, a.rp + drp) }
    save(a);
    return { exp: gain, lv: a.lv, lvUp: a.lv > before.lv, rp: a.rp, drp, tier: tier(a.rp), tierUp: tier(a.rp).name !== before.tier && a.rp > before.rp, a };
  }
  return { load, save, need, tier, unlocked, award, UNLOCK, TIERS };
})();

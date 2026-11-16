/* Online accounts: progress kept on the server (users/<uid>) so an account plays the same on every device.
   The game keeps working from localStorage as before; for a signed-in account every change to the keys below is
   copied up (a second after the last change), and a newer server copy is brought down when the game opens.
   Guests stay on their device only.
   Names: names/<key> = uid of the account holding that name (one name, one account). */
const CLOUD = (() => {
  const KEYS = ['mf_acct', 'mf_inv', 'mf_name', 'mf_avatar'], AT = 'mf_cloud_at';
  const ls = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch (e) {} } };
  const hex = s => [...new TextEncoder().encode(s.toLowerCase())].map(b => b.toString(16).padStart(2, '0')).join('');
  const key = u => 'n' + hex(u);                                   // names/<key> (Firebase keys can't hold . # $ [ ] /)
  const email = u => 'u' + hex(u) + '@players.academyzfight.com'; // the account's sign-in id; players never see it
  const pass = pw => 'mfz|' + pw;                                 // Firebase wants 6+ characters; the game asks for 4+
  let t = null, quiet = false;
  const snap = () => { const v = {}; for (const k of KEYS) v[k] = ls.get(k); return v };
  async function pushNow() {
    clearTimeout(t); t = null; if (!NET.acct) return;
    const at = NET.now(); quiet = true; ls.set(AT, String(at)); quiet = false;
    await NET.set('users/' + NET.uid, { ...snap(), at });
  }
  const push = () => { if (quiet || !NET.acct) return; clearTimeout(t); t = setTimeout(pushNow, 1000) };
  // every write the game makes to its progress keys goes up too
  const raw = Storage.prototype.setItem, rawDel = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { raw.call(this, k, v); if (this === localStorage && KEYS.includes(k)) push() };
  Storage.prototype.removeItem = function (k) { rawDel.call(this, k); if (this === localStorage && KEYS.includes(k)) push() };
  addEventListener('pagehide', () => { if (t) pushNow() });
  function apply(v) { quiet = true; for (const k of KEYS) ls.set(k, v[k] ?? null); ls.set(AT, String(v.at || 0)); ls.set('mf_session', v.mf_name || 'ผู้เล่น'); quiet = false }
  // on opening the game: newer on the server → take it (returns true: the page should reload); newer here → send it
  async function boot() {
    const u = await NET.init(); if (!u || !NET.acct) return false;
    const v = await NET.get('users/' + u), mine = +ls.get(AT) || 0;
    if (v && (v.at || 0) > mine) { apply(v); return true }
    if (!v || mine > (v.at || 0)) await pushNow();
    return false;
  }
  // sign up: claim the name, turn this browser's guest id into the account, send the progress up
  async function signUp(name, pw, pic) {
    const u = await NET.init(); if (!u) throw new Error('offline');
    if (NET.acct) await NET.auth.out();
    const k = key(name), c = await NET.tx('names/' + k, cur => cur == null || cur === u ? u : undefined);
    if (!c || !c.ok) throw Object.assign(new Error('taken'), { code: 'taken' });
    try { await NET.auth.up(email(name), pass(pw)) } catch (e) { NET.remove('names/' + k); throw e }
    quiet = true; ls.set('mf_name', name); ls.set('mf_session', name); ls.set('mf_avatar', pic || null); quiet = false;
    await pushNow();
  }
  // sign in: switch to the account and bring its progress down (the page reloads afterwards)
  async function signIn(name, pw) {
    const u = await NET.init(); if (!u) throw new Error('offline');
    const uid = await NET.auth.in(email(name), pass(pw));
    const v = await NET.get('users/' + uid);
    if (v) apply(v); else { quiet = true; ls.set('mf_name', name); ls.set('mf_session', name); quiet = false }
    return uid;
  }
  // sign out: the account's progress leaves this device
  async function signOut() { clearTimeout(t); t = null; await NET.auth.out(); quiet = true; for (const k of [...KEYS, AT, 'mf_session']) ls.set(k, null); quiet = false }
  return { boot, signUp, signIn, signOut, pushNow };
})();

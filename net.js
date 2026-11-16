/* Online play (Firebase Realtime Database, anonymous sign-in).
   NET.init() resolves the signed-in uid, or null when online play is not available (no network, blocked, …):
   the game then keeps working with bots only.
   ?netmock=1 (remembered for the tab) swaps Firebase for a stand-in kept in this browser, so two tabs can
   play each other without a server — for testing.
   Data: online/<uid> {name,c,at} · rooms/<rid> {name,song,map,lock,pass,owner,at,st,start,p:{<uid>:player},chat,ev}
   (rooms/_lobby/chat is the lobby chat). */
const NET = (() => {
  const CFG = {
    apiKey: 'AIzaSyDiGDvEVg9ER4ctFpKprBvueXmm69l3uL4', authDomain: 'academyz-fight.firebaseapp.com',
    databaseURL: 'https://academyz-fight-default-rtdb.asia-southeast1.firebasedatabase.app', projectId: 'academyz-fight',
    storageBucket: 'academyz-fight.firebasestorage.app', messagingSenderId: '706006655294', appId: '1:706006655294:web:e21e74dd9cbd5bc88dcc6f',
  };
  const V = '10.12.2', CDN = n => `https://cdn.jsdelivr.net/npm/firebase@${V}/firebase-${n}-compat.js`;
  let mock = false; try { if (/[?&]netmock=1/.test(location.search)) sessionStorage.setItem('mf_netmock', '1'); mock = sessionStorage.getItem('mf_netmock') === '1' } catch (e) {}
  let api = null, uid = null, offset = 0, ready = null;
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s) });
  const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);

  // ---------- Firebase ----------
  async function fire() {
    await load(CDN('app')); await Promise.all([load(CDN('auth')), load(CDN('database'))]);
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CFG);
    // keep whoever is signed in on this browser (an account, or the guest's anonymous id); a first visit signs in anonymously
    const auth = firebase.auth(app);
    let user = await new Promise(ok => { const un = auth.onAuthStateChanged(u => { un(); ok(u) }) });
    if (!user) user = (await auth.signInAnonymously()).user;
    const db = firebase.database(app);
    db.ref('.info/serverTimeOffset').on('value', s => { offset = s.val() || 0 });
    const r = p => db.ref(p);
    return {
      uid: user.uid,
      get acct() { return !!(auth.currentUser && !auth.currentUser.isAnonymous) },
      // accounts: sign-up turns this browser's anonymous id into the account (progress carries over)
      up: (email, pw) => auth.currentUser.linkWithCredential(firebase.auth.EmailAuthProvider.credential(email, pw)).then(c => c.user.uid),
      in: (email, pw) => auth.signInWithEmailAndPassword(email, pw).then(c => c.user.uid),
      out: () => auth.signOut(),
      set: (p, v) => r(p).set(v), update: (p, v) => r(p).update(v), remove: p => r(p).remove(), push: (p, v) => { const k = r(p).push(); k.set(v); return k.key },
      get: p => r(p).once('value').then(s => s.val()),
      last: (p, n) => r(p).orderByKey().limitToLast(n).once('value').then(s => s.val()),
      on(p, cb) { const f = s => cb(s.val()); r(p).on('value', f); return () => r(p).off('value', f) },
      onAdd(p, cb, last) { const q = last ? r(p).limitToLast(last) : r(p); const f = s => cb(s.key, s.val()); q.on('child_added', f); return () => q.off('child_added', f) },
      onDisc(p, v) { const d = r(p).onDisconnect(); return v === null ? d.remove() : d.update(v) },
      cancelDisc(p) { return r(p).onDisconnect().cancel() },
      tx: (p, f) => r(p).transaction(f).then(x => ({ ok: x.committed, val: x.snapshot.val() })),
    };
  }

  // ---------- stand-in (one browser, many tabs) ----------
  function fake() {
    const K = 'mf_netfake', bc = 'BroadcastChannel' in window ? new BroadcastChannel('mf_netfake') : null;
    let me = sessionStorage.getItem('mf_netfake_uid'); if (!me) { me = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('mf_netfake_uid', me) }
    const read = () => { try { return JSON.parse(localStorage.getItem(K) || '{}') } catch (e) { return {} } };
    const parts = p => p.split('/').filter(Boolean);
    const at = (t, p) => parts(p).reduce((o, k) => o == null ? undefined : o[k], t);
    const put = (t, p, v) => { const ks = parts(p); let o = t; for (let i = 0; i < ks.length - 1; i++) { if (typeof o[ks[i]] !== 'object' || o[ks[i]] === null) o[ks[i]] = {}; o = o[ks[i]] } const l = ks[ks.length - 1]; if (v === null || v === undefined) delete o[l]; else o[l] = v };
    const L = []; let last = read();
    const fireAll = () => { last = read(); for (const l of L) l.check() };
    const write = f => { const t = read(); f(t); localStorage.setItem(K, JSON.stringify(t)); bc && bc.postMessage(1); setTimeout(fireAll, 0) };
    if (bc) bc.onmessage = fireAll; addEventListener('storage', e => { if (e.key === K) fireAll() });
    const disc = []; addEventListener('pagehide', () => write(t => { for (const [p, v] of disc) { if (v === null) put(t, p, null); else for (const k in v) put(t, p + '/' + k, v[k]) } }));
    const AK = 'mf_netfake_auth', au = () => { try { return JSON.parse(localStorage.getItem(AK) || '{}') } catch (e) { return {} } };
    const err = code => Promise.reject(Object.assign(new Error(code), { code }));
    return {
      uid: me,
      get acct() { return sessionStorage.getItem('mf_netfake_acct') === '1' },
      up(email, pw) { const A = au(); if (A[email]) return err('auth/email-already-in-use'); A[email] = { pw, uid: me }; localStorage.setItem(AK, JSON.stringify(A)); sessionStorage.setItem('mf_netfake_acct', '1'); return Promise.resolve(me) },
      in(email, pw) { const a = au()[email]; if (!a || a.pw !== pw) return err('auth/invalid-credential'); sessionStorage.setItem('mf_netfake_uid', a.uid); sessionStorage.setItem('mf_netfake_acct', '1'); return Promise.resolve(a.uid) },
      out() { sessionStorage.removeItem('mf_netfake_uid'); sessionStorage.removeItem('mf_netfake_acct'); return Promise.resolve() },
      set: (p, v) => Promise.resolve(write(t => put(t, p, JSON.parse(JSON.stringify(v))))),
      update: (p, v) => Promise.resolve(write(t => { for (const k in v) put(t, p + '/' + k, v[k] === undefined ? null : JSON.parse(JSON.stringify(v[k]))) })),
      remove: p => Promise.resolve(write(t => put(t, p, null))),
      push(p, v) { const k = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); write(t => put(t, p + '/' + k, JSON.parse(JSON.stringify(v)))); return k },
      get: p => Promise.resolve(at(read(), p) ?? null),
      last(p, n) { const v = at(read(), p); if (!v) return Promise.resolve(null); const o = {}; for (const k of Object.keys(v).sort().slice(-n)) o[k] = v[k]; return Promise.resolve(o) },
      on(p, cb) { let s; const l = { check() { const v = at(last, p) ?? null, j = JSON.stringify(v); if (j !== s) { s = j; cb(v === null ? null : JSON.parse(j)) } } }; L.push(l); setTimeout(() => l.check(), 0); return () => L.splice(L.indexOf(l), 1) },
      onAdd(p, cb, n) { const seen = new Set(); let first = true; const l = { check() { const v = at(last, p) || {}; let ks = Object.keys(v).sort(); if (first && n) ks = ks.slice(-n); first = false; for (const k of ks) if (!seen.has(k)) { seen.add(k); cb(k, v[k]) } } }; L.push(l); setTimeout(() => l.check(), 0); return () => L.splice(L.indexOf(l), 1) },
      onDisc(p, v) { disc.push([p, v]); return Promise.resolve() },
      cancelDisc(p) { for (let i = disc.length - 1; i >= 0; i--) if (disc[i][0] === p) disc.splice(i, 1); return Promise.resolve() },
      tx(p, f) { let res; write(t => { const nv = f(at(t, p) ?? null); res = nv; if (nv !== undefined) put(t, p, nv) }); return Promise.resolve({ ok: res !== undefined, val: res }) },
    };
  }

  function init() {
    if (!ready) ready = (async () => {
      try { api = mock ? fake() : await timeout(fire(), 12000); uid = api.uid; return uid }
      catch (e) { console.warn('online play unavailable:', e && e.message); api = null; return null }
    })();
    return ready;
  }
  const call = (k) => (...a) => api ? api[k](...a) : Promise.resolve(null);
  // play statistics (stats.html): stats/d/<day, Bangkok time>/u/<uid> = who came that day · /g/<key> = one finished game
  const day = () => new Date(Date.now() + offset + 7 * 3600e3).toISOString().slice(0, 10);
  const visit = name => init().then(u => { if (u) api.update('stats/d/' + day() + '/u/' + u, { n: String(name || '').slice(0, 16), at: Date.now() + offset }).catch(() => {}) });
  const game = (rec, key) => init().then(u => { if (!u) return; const p = 'stats/d/' + day() + '/g/', v = { ...rec, u, at: Date.now() + offset };
    (key ? api.set(p + key + '_' + u, v) : Promise.resolve(api.push(p, v))).catch(() => {}) });
  return {
    init, get on() { return !!api }, get uid() { return uid }, get mock() { return mock }, get acct() { return !!(api && api.acct) },
    auth: { up: (e, p) => api.up(e, p), in: (e, p) => api.in(e, p), out: () => api ? api.out() : Promise.resolve() },
    now: () => Date.now() + offset,
    visit, game, day,
    set: call('set'), update: call('update'), remove: call('remove'), get: call('get'), last: call('last'), onDisc: call('onDisc'), cancelDisc: call('cancelDisc'), tx: call('tx'),
    push: (p, v) => api ? api.push(p, v) : null,
    sub: (p, cb) => api ? api.on(p, cb) : () => {},
    subAdd: (p, cb, n) => api ? api.onAdd(p, cb, n) : () => {},
  };
})();

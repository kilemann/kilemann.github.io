'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, makeFetch, run, plain, ALLE } = require('./load');

const kort = l => (l.env.el('grid').innerHTML.match(/<a class="card"/g) || []).length;
const søk = (l, tekst) => { l.env.el('q').value = tekst; l.env.el('q').dispatch('input'); };

/* ---------- grunnfunksjoner (finnes fra før) ---------- */
test('Starter med alle fem appene som kort, og telleren stemmer', () => {
  const l = load({ fetch: makeFetch({}) });
  assert.equal(kort(l), 5);
  assert.equal(l.env.el('count').textContent, '(5)');
  for (const n of ['Himmelur', 'Størrelsen teller', 'Lommespiller', 'Kronekikk', 'Solblikk']) assert.match(l.env.el('grid').innerHTML, new RegExp('<h2>' + n + '</h2>'));
});

test('Hvert kort lenker relativt til appen, så det følger med hvis brukernavnet endres', () => {
  const l = load({ fetch: makeFetch({}) });
  for (const a of l.api.APPS) { assert.match(a.url, /^\/[\w.]+\/$/, a.name); assert.ok(l.env.el('grid').innerHTML.includes(`href="${a.url}"`)); assert.ok(l.api.ICONS[a.icon], `${a.name}: ukjent ikon`); }
});

test('Søk: ignorerer store/små bokstaver og aksenter, og søker i navn og tekst', () => {
  const l = load({ fetch: makeFetch({}) });
  søk(l, 'HIMMEL'); assert.equal(kort(l), 1); assert.equal(l.env.el('count').textContent, '(1)');
  søk(l, 'valutakurser'); assert.equal(kort(l), 1);
  søk(l, 'musikk'); assert.match(l.env.el('grid').innerHTML, /Lommespiller/);
  søk(l, ''); assert.equal(kort(l), 5);
});

test('Søk uten treff viser «ingen apper»-teksten, og skjuler den igjen', () => {
  const l = load({ fetch: makeFetch({}) });
  søk(l, 'finnes ikke'); assert.equal(kort(l), 0); assert.equal(l.env.el('empty').hidden, false);
  søk(l, 'kron'); assert.equal(l.env.el('empty').hidden, true);
});

test('esc gjør farlige tegn ufarlige', () => {
  const l = load({ fetch: makeFetch({}) });
  assert.equal(l.api.esc('<b>"x"&</b>'), '&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;');
});

/* ---------- ny funksjon: versjon i hvert kort ---------- */
test('lesVersjon: godtar bare vanlige versjonsnummer (x.y.z) og gir ellers null', () => {
  const l = load({ fetch: makeFetch({}) });
  assert.equal(l.api.lesVersjon({ version: '1.7.0' }), '1.7.0');
  assert.equal(l.api.lesVersjon({ version: '12.0.31' }), '12.0.31');
  for (const d of [null, undefined, {}, { version: 1.7 }, { version: '' }, { version: '1.7' }, { version: 'v1.7.0' }, { version: '<img src=x>' }, { version: '1.7.0<script>' }, 'tekst', []])
    assert.equal(l.api.lesVersjon(d), null, JSON.stringify(d));
});

test('Versjon vises i hvert kort når den er hentet, med tilgjengelig tekst', async () => {
  const l = load({ fetch: makeFetch(ALLE) });
  await run(l.env);
  const h = l.env.el('grid').innerHTML;
  assert.equal((h.match(/class="ver"/g) || []).length, 5);
  for (const v of ['v1.7.0', 'v1.6.0', 'v1.5.0', 'v0.1.1']) assert.ok(h.includes('>' + v + '<'), v);
  assert.match(h, /aria-label="Versjon 1\.7\.0"/);
});

test('Versjonen hører til riktig app', async () => {
  const l = load({ fetch: makeFetch(ALLE) });
  await run(l.env);
  const deler = l.env.el('grid').innerHTML.split('<a class="card"').slice(1);
  const v = n => deler.find(d => d.includes(`<h2>${n}</h2>`)).match(/class="ver"[^>]*>(v[\d.]+)</)[1];
  assert.equal(v('Himmelur'), 'v1.7.0'); assert.equal(v('Størrelsen teller'), 'v1.6.0');
  assert.equal(v('Lommespiller'), 'v1.5.0'); assert.equal(v('Kronekikk'), 'v1.5.0');
  assert.equal(v('Solblikk'), 'v0.1.1');
});

test('Henter package.json fra selve appens adresse (versjonen som faktisk ligger ute), uten gammel mellomlagring', async () => {
  const log = [];
  const l = load({ fetch: makeFetch(ALLE, log) });
  await run(l.env);
  assert.deepEqual(log.map(x => x.url).sort(), ['/Runlikehell.io/package.json', '/himmelur.io/package.json', '/kronesjekk.io/package.json', '/solblikk.io/package.json', '/strteller.io/package.json']);
  assert.ok(log.every(x => x.init && x.init.cache === 'no-cache'));
});

test('Kortene vises med en gang, uten å vente på nettet', () => {
  const l = load({ fetch: () => new Promise(() => {}) });   // svarer aldri
  assert.equal(kort(l), 5);
  assert.ok(!l.env.el('grid').innerHTML.includes('class="ver"'));
});

test('Feil på én app (404, nettfeil, ødelagt svar, ugyldig versjon) skjuler bare den appens versjon', async () => {
  for (const feil of [{ ok: false, status: 404 }, new TypeError('offline'), { bad: true }, { json: { version: '<script>' } }, { json: {} }]) {
    const l = load({ fetch: makeFetch({ ...ALLE, 'strteller.io': feil }) });
    await run(l.env);
    const h = l.env.el('grid').innerHTML;
    assert.equal((h.match(/class="ver"/g) || []).length, 4, JSON.stringify(feil));
    assert.equal(kort(l), 5);
    assert.ok(!h.includes('<script>'));
  }
});

test('Uten nett i det hele tatt virker siden som før', async () => {
  const l = load({ fetch: makeFetch({ x: new TypeError('offline') }) });
  await run(l.env);
  assert.equal(kort(l), 5);
  assert.ok(!l.env.el('grid').innerHTML.includes('class="ver"'));
});

test('Tidsavbrudd: hengende forespørsel avbrytes etter 8 sekunder', async () => {
  let avbrutt = 0;
  const l = load({ fetch: (url, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => { avbrutt++; rej(Object.assign(new Error('avbrutt'), { name: 'AbortError' })); })) });
  await run(l.env, 7999); assert.equal(avbrutt, 0);
  await run(l.env, 2); assert.equal(avbrutt, 5);
  assert.equal(kort(l), 5);
});

test('Søk etter at versjonene er hentet beholder versjonene i kortene som er igjen', async () => {
  const l = load({ fetch: makeFetch(ALLE) });
  await run(l.env);
  søk(l, 'himmel');
  assert.equal(kort(l), 1);
  assert.ok(l.env.el('grid').innerHTML.includes('>v1.7.0<'));
  søk(l, '');
  assert.equal((l.env.el('grid').innerHTML.match(/class="ver"/g) || []).length, 5);
});

test('Versjoner som kommer inn mens du søker, tegnes inn uten å endre søket', async () => {
  let slipp; const port = new Promise(r => { slipp = r; });
  const l = load({ fetch: async (url, init) => { await port; return makeFetch(ALLE)(url, init); } });
  søk(l, 'kron');
  assert.equal(kort(l), 1);
  slipp(); await run(l.env);
  assert.equal(kort(l), 1);
  assert.ok(l.env.el('grid').innerHTML.includes('>v1.5.0<'));
  assert.equal(l.env.el('count').textContent, '(1)');
});

test('Versjonsvisningen gir ikke feil for ukjent app lagt til senere', async () => {
  const l = load({ fetch: makeFetch(ALLE) });
  l.api.APPS.push({ name: 'Ny', text: 'x', url: '/ny.io/', icon: 'stjerne' });
  await l.api.loadVersions(); l.api.render();
  assert.equal(kort(l), 6);
});

/* ---------- 1.4.0: Solblikk ---------- */
test('Solblikk har eget kort med kamera-og-sol-ikon og lenker til /solblikk.io/', () => {
  const l = load({ fetch: makeFetch({}) });
  const app = l.api.APPS.find(a => a.name === 'Solblikk');
  assert.ok(app, 'Solblikk mangler');
  assert.equal(app.url, '/solblikk.io/');
  assert.equal(app.icon, 'kamera');
  assert.match(l.api.ICONS.kamera, /<svg[\s\S]*<\/svg>/);
  søk(l, 'solbane'); assert.equal(kort(l), 1); assert.match(l.env.el('grid').innerHTML, /Solblikk/);
});

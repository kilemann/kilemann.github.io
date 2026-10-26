'use strict';
/* Utgivelsesregler: versjonsnummeret skal være likt overalt, og endringsloggen skal være ført nyeste først. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const les = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const V = JSON.parse(les('package.json')).version;
const nyere = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };

test('package.json har et gyldig versjonsnummer', () => assert.match(V, /^\d+\.\d+\.\d+$/));
test('Kommentaren øverst i index.html har samme versjon', () => assert.ok(les('index.html').includes(`/* Kilemannens apper v${V}\n`)));
test('Bunnteksten har samme versjon', () => assert.ok(les('index.html').includes(`<footer>Samleside v${V}</footer>`)));
test('Endringsloggen i index.html er ført nyeste først, og første linje er gjeldende versjon', () => {
  const v = [...les('index.html').matchAll(/^   (\d+\.\d+\.\d+)  /gm)].map(m => m[1]);
  assert.ok(v.length >= 5);
  assert.equal(v[0], V);
  for (let i = 1; i < v.length; i++) assert.ok(nyere(v[i - 1], v[i]), `${v[i - 1]} før ${v[i]}`);
});

'use strict';
const path = require('node:path');
const { loadApp } = require('./harness');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'index.html');
const NAMES = ['APPS', 'ICONS', 'esc', 'norm', 'render', 'versions', 'lesVersjon', 'loadVersions'];

/* Simulert nett: routes = { 'himmelur.io': { json: {...} } | { ok:false,status:404 } | Error } */
function makeFetch(routes = {}, log = []) {
  return async (url, init) => {
    log.push({ url, init });
    for (const [key, r] of Object.entries(routes)) {
      if (!url.includes(key)) continue;
      if (r instanceof Error) throw r;
      return { ok: r.ok !== false, status: r.status || 200, json: async () => { if (r.bad) throw new SyntaxError('ugyldig json'); return r.json; } };
    }
    throw new TypeError('ingen rute for ' + url);
  };
}

function load(opts = {}) {
  return loadApp(HTML, NAMES, {
    ...opts,
    prepare: env => { env.el('empty').hidden = true; if (opts.prepare) opts.prepare(env); },
  });
}
const flush = () => new Promise(r => setImmediate(r));
async function run(env, ms = 0) { for (let i = 0; i < 5; i++) await flush(); if (ms) env.advance(ms); for (let i = 0; i < 5; i++) await flush(); }
const plain = x => JSON.parse(JSON.stringify(x));

const ALLE = {
  'himmelur.io': { json: { version: '1.7.0' } },
  'strteller.io': { json: { version: '1.6.0' } },
  'Runlikehell.io': { json: { version: '1.5.0' } },
  'kronesjekk.io': { json: { version: '1.5.0' } },
  'solblikk.io': { json: { version: '0.1.1' } },
};
module.exports = { load, makeFetch, run, flush, plain, ALLE, ROOT, HTML };

'use strict';

import { slice } from './utils';
import browser from "webextension-polyfill";

const defaults = {
  targetReferrersAny: 'no',
  targetHostsAny: 'yes',
  targetLocalesAny: 'yes',
  targetReferrers: ['www.google.com'],
  targetHosts: [],
  targetLocales: [],
  preferredLang: 'en-US,en,*;q=0.5',
  showBadge: 'yes',
  suspended: 'no',
};

async function load() {
  let results;
  try {
    results = await browser.storage.local.get();
  } catch (e) {
    console.error('Load config failed', e);
  }

  return withDefaults(results);
}

async function save(config) {
  const filtered = slice(config, Object.keys(defaults));
  try {
    await browser.storage.local.set(filtered);
  } catch (e) {
    console.error('Save config failed', e);
  }
}

function withDefaults(config, onlyKeys) {
  const c = {};
  const filtered = onlyKeys ? slice(defaults, onlyKeys) : defaults;
  for (const [k, defaultValue] of Object.entries(filtered)) {
    c[k] = config[k] || defaultValue;
  }
  return c;
}

export { defaults, load, save, withDefaults };

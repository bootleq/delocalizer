'use strict';

import browser from 'webextension-polyfill';
import { over, lensPath } from 'ramda';

function isBlank(v) {
  const type = typeof v;

  if (v == null) return true;

  if (type === 'object' && Object.keys(v).length === 0) {
    return true;
  }

  if (type === 'string') {
    return v.length === 0;
  }

  return false;
}

function slice(o, keys) {
  return Object.fromEntries(
    keys
    .filter(k => k in o)
    .map(k => [k, o[k]])
  );
}

function updatePath(path, fn) {
  return over(lensPath(path), fn);
}

function translator(prefix) {
  return (k, ...args) => {
    let key = k;
    if (prefix && k.startsWith('_')) {
      key = `${prefix}${key}`;
    }
    return browser.i18n.getMessage(key, ...args);
  };
}

async function getBrowserInfo() {
  if (Object.prototype.hasOwnProperty.call(browser.runtime, 'getBrowserInfo')) {
    return await browser.runtime.getBrowserInfo();
  }

  return {name: 'chrome'}; // return dummy object for chrome is enough
}

export { isBlank, slice, translator, updatePath, getBrowserInfo };

'use strict';

// Example:
//  Matches `/zh-TW` in https://developer.mozilla.org/zh-TW/docs/Mozilla/Add-ons
const pathname = new RegExp([
  /^\//,                // beginning /
  /(?:[a-zA-Z]{2})/,    // en
  /(?:[\-_]\w{2,4})?/,  // -US or _US (optional) or even _USxx
  /(?=\/)/,             // ending / (exclusive)
].map(r => r.source).join(''));

// Example:
//  Matches `zh-hant.` in https://zh-hant.reactjs.org/docs/getting-started.html
const subdomain = new RegExp([
  /^/,                  // beginning
  /(?:[a-zA-Z]{2})/,    // en
  /(?:[\-_]\w{2,4})?/,  // -US or _US (optional) or even _USxx
  /(?:\.)/,             // ending .
].map(r => r.source).join(''));

const URLLocalePatterns = {pathname: pathname, subdomain: subdomain };

export default URLLocalePatterns;

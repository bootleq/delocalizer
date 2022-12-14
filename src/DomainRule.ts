'use strict';

const generalLocalePattern = new RegExp([
  /(?:[a-zA-Z]{2})/,    // en
  /(?:[-_]\w{2,4})?/,  // -US or _US (optional) or even -hant
].map(r => r.source).join(''));

class DomainRule {
  fromLocale: string;
  position: string;
  domain: string;
  toLocale: string;
  enabled: 'yes' | 'no';
  key?: number;

  constructor(config?) {
    this.fromLocale = config?.fromLocale ?? '*';    // zh, zh-TW, .etc. "*" for any locales
    this.position   = config?.position   ?? 'sub.'; // "sub." | "/path"
    this.domain     = config?.domain     ?? '';
    this.toLocale   = config?.toLocale   ?? '';     // leave blank for auto detection
    this.enabled    = config?.enabled    ?? 'yes';

    this.key = null; // for options UI only, not persistent
  }
}

// Find "fromLocale" segement in URL, to be replaced with "toLocale".
function match(rule, url) {
  const { domain, fromLocale, toLocale, position, enabled } = rule;
  const { hostname } = url;
  let seg;

  if (enabled === 'no') return;
  if (!hostname.endsWith(domain)) return;

  switch (position) {
  case 'sub.':
    seg = hostname.substring(0, hostname.length - domain.length);

    if (seg === '') return;

    if (toLocale !== '' && seg.startsWith(toLocale)) return;

    if (fromLocale === '*') {
      return seg;
    } else {
      return seg.startsWith(fromLocale) ? seg : undefined;
    }
  case '/path':
    seg = url.pathname.split('/')[1];

    if (!seg || !generalLocalePattern.test(seg)) return;

    if (fromLocale === '*') {
      return seg.startsWith(toLocale) ? undefined : `/${seg}`;
    } else if (seg.startsWith(fromLocale)){
      if (toLocale === '' || !seg.startsWith(toLocale)) {
        return `/${seg}`;
      }
    }
    break;
  }
}

function replaceMatchedSegment(rule, originURL, matched) {
  const url = new URL(originURL);
  const { toLocale, position } = rule;

  switch (position) {
  case 'sub.':
    url.hostname = url.host.replace(matched, toLocale === '' ? '' : `${toLocale}.`);
    break;
  case '/path':
    url.pathname = url.pathname.replace(matched, toLocale === '' ? '' : `/${toLocale}`);
    break;
  }

  return url.href;
}

function searchAndReplace(rules, inputUrl) {
  let seg;
  const url = new URL(inputUrl);

  const matchedRule = rules.find(r => {
    seg = match(r, url);
    return seg;
  });

  if (matchedRule) {
    return replaceMatchedSegment(matchedRule, url, seg);
  }
}

export { DomainRule, match, replaceMatchedSegment, searchAndReplace, generalLocalePattern };
export default DomainRule;

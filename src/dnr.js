'use strict';

import escRe from 'escape-string-regexp';
import { pipe, identity, clone, assocPath, chain as flatMap } from 'ramda';

import { generalLocalePattern } from './DomainRule';

// Translate DomainRule to DNR compatible objects
// https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest

const RedirectRule = {
  id: null,
  action: {
    type: 'redirect',
    redirect: {"regexSubstitution": null}
  },
  condition: {
    regexFilter: null,
    resourceTypes: ['main_frame']
  }
};

const ModifyHeaderRule = {
  id: null,
  action: {
    type: 'modifyHeaders',
    requestHeaders: [{header: 'accept-language', operation: 'set', value: null}]
  },
  condition: {
    regexFilter: null,
    resourceTypes: ['main_frame']
  }
};

function fromDomainRule(rule, config) {
  const { position, fromLocale, toLocale, domain } = rule;
  const { preferredLang } = config;

  let redirRule, seg, regexFilter, regexSub, headerRule;

  switch (position) {
  case 'sub.':
    seg = (fromLocale === '*') ? generalLocalePattern.source : `${escRe(fromLocale)}[^\\.]*`;
    regexFilter = `^https://(${seg})(?:\\.)(${escRe(domain)}/.*)`;
    regexSub = (toLocale === '') ? 'https://\\2' : `https://${toLocale}.\\2`;
    break;
  case '/path':
    seg = (fromLocale === '*') ? `/${generalLocalePattern.source}` : `/${escRe(fromLocale)}[^/]{0,5}`;
    regexFilter = `^https://((?:[^\\.]+\\.)?${escRe(domain)})${seg}(/.*|$)`;
    regexSub = (toLocale === '') ? 'https://\\1\\2' : `https://\\1/${toLocale}\\2`;
    break;
  }

  redirRule = pipe(
    assocPath(['condition', 'regexFilter'], regexFilter),
    assocPath(['action', 'redirect', 'regexSubstitution'], regexSub)
  )(clone(RedirectRule));

  if (toLocale === '') {
    switch (position) {
    case 'sub.':
      regexFilter = `https://${escRe(domain)}/.*`;
      break;
    case '/path':
      regexFilter = `https://[^\\.]+\\.${escRe(domain)}/.*`;
      break;
    }

    headerRule = pipe(
      assocPath(['action', 'requestHeaders', 0, 'value'], preferredLang),
      assocPath(['condition', 'regexFilter'], regexFilter)
    )(clone(ModifyHeaderRule));
  }

  return [redirRule, headerRule].filter(identity);
}

async function setup(config) {
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

  if (config.suspended === 'yes') {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map(({id}) => id)
    });
    return;
  }

  await chrome.declarativeNetRequest.setExtensionActionOptions({
    displayActionCountAsBadgeText: config.showBadge === 'yes'
  });

  const newRules = flatMap(r => fromDomainRule(r, config), config.domainRules);

  const initiatorDomains = (config.targetReferrersAny === 'no' && config.targetReferrers.length) ? config.targetReferrers : null;

  newRules.forEach((rule, index) => {
    if (initiatorDomains) {
      rule['condition']['initiatorDomains'] = initiatorDomains;
    }
    rule['id'] = index + 1;
  });

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules,
      removeRuleIds: oldRules.map(({id}) => id)
    });
  } catch (e) {
    console.error('Fail adding DNR rule', e, newRules);
  }
}

export { setup, fromDomainRule };

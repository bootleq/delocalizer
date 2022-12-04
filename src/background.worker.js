'use strict';

import browser from 'webextension-polyfill';

import { load as loadConfig, save as saveConfig, withDefaults } from './config';
import { setup as setDNRRules } from './dnr';
import { searchAndReplace } from './DomainRule';

let config = {
  targetReferrers: [],
  domainRules: [],
  preferredLang: '',
  showBadge: 'yes',
  suspended: 'no',
};

const state = {
  mutatedRequestCount: 0,
  actionRunningTabId: null  // flag for user action to force redirect, modify Accept-Language if in this tab
};

const messages = {
  error: {
    unsupportedURL: browser.i18n.getMessage('error_unsupportedURL'),
    URLLocaleMismatch: browser.i18n.getMessage('error_URLMismatchLocale'),
    unknownAction: browser.i18n.getMessage('error_unknownActionType'),
    other: browser.i18n.getMessage('error_otherError'),
  },
  flash: {
    executed: browser.i18n.getMessage("flash_executed"),
  }
};

function onStorageChange(changes) {
  const newConfig = Object.fromEntries(
    Object.entries(changes)
      .map(([k, {newValue}]) => [k, newValue])
      .filter(([k, v]) => v)
  );

  config = {...config, ...withDefaults(newConfig, Object.keys(changes))};
  updateActionIcon();
  setDNRRules(config);
}


// Browser Action handlers {{{
async function doDelocalize(url, tabId, sendResponse) {
  try {
    url = new URL(url);
  } catch (e) {
    sendResponse({status: 'error', msg: messages.error.unsupportedURL});
    return;
  }

  const newUrl = searchAndReplace(config.domainRules, url);

  if (newUrl) {
    state.actionRunningTabId = tabId;
    await browser.tabs.update({url: newUrl});
    sendResponse({status: 'success', msg: messages.flash.executed});
  } else {
    sendResponse({status: 'error', msg: messages.error.URLLocaleMismatch});
  }
}

async function doToggle(sendResponse) {
  const oldState = await browser.storage.local.get('suspended');
  const newState = oldState.suspended === 'yes' ? 'no' : 'yes';
  await browser.storage.local.set({suspended: newState});
  updateActionIcon();
  sendResponse();
}

async function doClearBadge(sendResponse) {
  state.mutatedRequestCount = 0;
  browser.action.setBadgeText({text: ''});
  sendResponse();
}
// }}}

function onMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
    case 'delocalize':
      doDelocalize(message.url, message.tabId, sendResponse);
      return true;
    case 'toggle':
      doToggle(sendResponse);
      return true;
    case 'clear-badge':
      doClearBadge(sendResponse);
      return true;
    }
  } catch (e) {
    sendResponse({status: 'error', msg: `${messages.error.other}${e}`});
  }

  sendResponse({status: 'error', msg: messages.error.unknownAction});
}

function updateActionIcon() {
  const iconPath = config.suspended === 'yes' ? 'icons/outline-128.png' : 'icons/128.png';
  browser.action.setIcon({path: iconPath});

  if (config.showBadge === 'no') {
    state.mutatedRequestCount = 0;
    browser.action.setBadgeText({text: ''});
  }
}

function onInstalled() {
  loadConfig().then(saveConfig); // save initial config for first time install
}

loadConfig().then(c => {
  config = c;
  setDNRRules(config);
  updateActionIcon();
});

browser.storage.onChanged.addListener(onStorageChange);

browser.action.setBadgeBackgroundColor({color: '#444'});
browser.runtime.onMessage.addListener(onMessage);

browser.runtime.onInstalled.addListener(onInstalled);

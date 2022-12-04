'use strict';

import browser from 'webextension-polyfill';

import { load as loadConfig, save as saveConfig, withDefaults } from './config';
import { searchAndReplace } from './DomainRule';

// Basic flow:
//
// onBeforeRequest     -> Detect referrer and target host/locale, if matches,
//                        redirect to new URL with locale part removed.
// onBeforeSendHeaders -> Detect a flag set by onBeforeRequest, then
//                        modify Accept-Language header.

let config = {
  targetReferrers: [],
  domainRules: [],
  preferredLang: '',
  showBadge: 'yes',
  suspended: 'no',
};

const mutatedRequests = new Set(); // flag request to avoid redirect loop
let mutatedRequestCount = 0;
let actionRunningTabId; // flag for user action to force redirect, modify Accept-Language if in this tab

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

function detectReferrer(url, {targetReferrersAny, targetReferrers}) {
  if (targetReferrersAny === 'yes') {
    return true;
  }

  if (!url) return false;

  const referrer = new URL(url);
  return targetReferrers.some(r => referrer.hostname.endsWith(r));
}

function mutateHeader(headers, name, newValue) {
  const header = headers.find(h => h.name.toLowerCase() === name);

  if (header) {
    // console.log(`Mutate header: ${header.value} -> ${newValue}`);
    header.value = newValue;
  }

  return headers;
}

function onBeforeRequest(details) {
  const { originUrl, url, requestId } = details;
  // console.log('onBeforeRequest', url, requestId);

  if (config.suspended === 'yes') return;
  if (mutatedRequests.has(requestId)) return;

  if (!detectReferrer(originUrl, config)) return;

  const newUrl = searchAndReplace(config.domainRules, url);
  if (newUrl) {
    mutatedRequests.add(requestId);
    return { redirectUrl: newUrl };
  }
}

function onBeforeSendHeaders(details) {
  const { requestHeaders: headers, requestId, tabId, url} = details;

  if (mutatedRequests.has(requestId) || tabId === actionRunningTabId) {
    mutateHeader(headers, 'accept-language', config.preferredLang);

    if (mutatedRequests.has(requestId)) {
      mutatedRequestCount = mutatedRequestCount + 1;
    }
  }
  actionRunningTabId = null;

  return {requestHeaders: headers};
}

function onErrorOccurred({ requestId }) {
  mutatedRequests.delete(requestId);
}

function onCompleted({ requestId }) {
  if (config.showBadge === 'yes' && mutatedRequests.has(requestId)) {
    mutatedRequests.delete(requestId);
    browser.browserAction.getBadgeText({}).then(t => {
      let num = Number.parseInt(t, 10);
      if (Number.isNaN(num)) {
        num = 0;
      }
      browser.browserAction.setBadgeText({text: `${num + 1}`});
    });
  }
}

const filter = {
  urls: ['<all_urls>'],
  types: ['main_frame'],
};

function onStorageChange(changes) {
  const newConfig = Object.fromEntries(
    Object.entries(changes)
      .map(([k, {newValue}]) => [k, newValue])
      .filter(([k, v]) => v)
  );

  config = {...config, ...withDefaults(newConfig, Object.keys(changes))};
  updateActionIcon();
  mutatedRequests.clear();
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
    actionRunningTabId = tabId;
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
  mutatedRequestCount = 0;
  browser.browserAction.setBadgeText({text: ''});
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
  browser.browserAction.setIcon({path: iconPath});

  if (config.showBadge === 'no') {
    mutatedRequestCount = 0;
    browser.browserAction.setBadgeText({text: ''});
  }
}

function onInstalled() {
  loadConfig().then(saveConfig); // save initial config for first time install
}

loadConfig().then(c => {
  config = c;
  updateActionIcon();
});

browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, ['blocking']);
browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, filter, ['blocking', 'requestHeaders']);
browser.webRequest.onErrorOccurred.addListener(onErrorOccurred, filter);
browser.webRequest.onCompleted.addListener(onCompleted, filter);
browser.storage.onChanged.addListener(onStorageChange);

browser.browserAction.setBadgeBackgroundColor({color: '#444'});
browser.runtime.onMessage.addListener(onMessage);

browser.runtime.onInstalled.addListener(onInstalled);

'use strict';

import browser from 'webextension-polyfill';
import { curry } from 'ramda';

import { load as loadConfig, save as saveConfig, withDefaults } from './config';
import { setup as setDNRRules } from './dnr';
import { searchAndReplace } from './DomainRule';
import actions from './actions';

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

function onMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
    case 'delocalize':
      actions.delocalize(
        message.url,
        message.tabId,
        curry(searchAndReplace)(config.domainRules),
        state,
        sendResponse
      );
      return true;
    case 'toggle':
      actions.toggle(sendResponse).then(() => {
        updateActionIcon();
        return true;
      });
      return true;
    case 'clear-badge':
      actions.clearBadge(state, sendResponse);
      return true;
    }
  } catch (e) {
    sendResponse({status: 'error', msg: `${browser.i18n.getMessage('error_otherError')}${e}`});
  }

  sendResponse({status: 'error', msg: browser.i18n.getMessage('error_unknownActionType')});
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

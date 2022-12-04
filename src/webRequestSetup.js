import browser from 'webextension-polyfill';

import { searchAndReplace } from './DomainRule';

// Basic flow:
//
// onBeforeRequest     -> Detect referrer and target host/locale, if matches,
//                        redirect to new URL with locale part removed.
// onBeforeSendHeaders -> Detect a flag set by onBeforeRequest, then
//                        modify Accept-Language header.

let config, state; // delegated states from parent module

const mutatedRequests = new Set(); // flag request to avoid redirect loop

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

  if (mutatedRequests.has(requestId) || tabId === state.actionRunningTabId) {
    mutateHeader(headers, 'accept-language', config.preferredLang);

    if (mutatedRequests.has(requestId)) {
      state.mutatedRequestCount += 1;
    }
  }
  state.actionRunningTabId = null;

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

const resetConfig = newConfig => {
  config = newConfig;
  mutatedRequests.clear();
};

const setup = (parentConfig, parentState) => {
  config = parentConfig;
  state = parentState;

  const filter = {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  };

  browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, ['blocking']);
  browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, filter, ['blocking', 'requestHeaders']);
  browser.webRequest.onErrorOccurred.addListener(onErrorOccurred, filter);
  browser.webRequest.onCompleted.addListener(onCompleted, filter);
}

export { setup, resetConfig };

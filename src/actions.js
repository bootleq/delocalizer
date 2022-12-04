import browser from 'webextension-polyfill';

async function delocalize(url, tabId, urlReplacer, state, sendResponse) {
  try {
    url = new URL(url);
  } catch (e) {
    sendResponse({status: 'error', msg: browser.i18n.getMessage('error_unsupportedURL')});
    return;
  }

  const newUrl = urlReplacer(url);

  if (newUrl) {
    state.actionRunningTabId = tabId;
    await browser.tabs.update({url: newUrl});
    sendResponse({status: 'success', msg: browser.i18n.getMessage("flash_executed")});
  } else {
    sendResponse({status: 'error', msg: browser.i18n.getMessage('error_URLMismatchLocale')});
  }
}

async function toggle(sendResponse) {
  const oldState = await browser.storage.local.get('suspended');
  const newState = oldState.suspended === 'yes' ? 'no' : 'yes';
  await browser.storage.local.set({suspended: newState});
  sendResponse();
}

async function clearBadge(state, sendResponse) {
  state.mutatedRequestCount = 0;
  await browser.browserAction.setBadgeText({text: ''});
  sendResponse();
}

const actions = { delocalize, toggle, clearBadge };

export default actions;

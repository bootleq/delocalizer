import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import classNames from 'classnames';

import { isBlank, translator } from './utils';
import './popup.scss';

const t = translator('popup');

const Main = () => {
  const [suspended, setSuspended] = useState();
  const [showBadge, setShowBadge] = useState();
  const [flash, setFlash] = useState({});

  useEffect(() => {
    browser.storage.local.get(['suspended', 'showBadge']).then(c => {
      setSuspended(c.suspended);
      setShowBadge(c.showBadge);
    });
    browser.storage.onChanged.addListener(c => {
      let v;
      v = c.suspended?.newValue;
      v && setSuspended(v);
      v = c.showBadge?.newValue;
      v && setShowBadge(v);
    });
  }, []);

  const onAction = (e) => {
    setFlash({});

    const $e = e.target;
    switch ($e.dataset.action) {
    case 'toggle':
      toggle();
      break;
    case 'delocalize-now':
      deLocalizeNow();
      break;
    case 'clear-badge':
      clearBadge();
      break;
    case 'open-options':
      openOptionsPage();
      break;
    default:
      return;
    }
  };

  function toggle() {
    browser.runtime.sendMessage({action: 'toggle'});
  };

  async function deLocalizeNow() {
    const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    const result = await browser.runtime.sendMessage({action: 'delocalize', tabId: tab.id, url: tab.url});
    setFlash(result);
    result?.status === 'success' && window.close();
  };

  function clearBadge() {
    browser.runtime.sendMessage({action: 'clear-badge'});
  };

  function openOptionsPage() {
    browser.runtime.openOptionsPage();
  };

  return (
    <>
      <ul>
        <li>
          <label>
            {t('_toggleAutoTrigger')}
            <input type='checkbox' data-action='toggle' className='toggle' checked={suspended === 'no'} onChange={onAction} />
          </label>
        </li>
        <li data-action='delocalize-now' onClick={onAction}>{t('_triggerOnPage')}</li>
        <li data-action='clear-badge' onClick={onAction} className={showBadge === 'no' ? 'disabled' : ''}>{t('_clearBadge')}</li>
        <li data-action='open-options' onClick={onAction}>{t('_openOptionsPage')}</li>
      </ul>
      <div className='flash-box'>
        {!isBlank(flash) &&
          <p className={classNames('flash', flash.status)}>
            {flash.msg}
            <span className='hide' onClick={() => setFlash({})} >✖</span>
          </p>
        }
      </div>
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Main />);

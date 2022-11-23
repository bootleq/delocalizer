import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import classNames from 'classnames';

import { isBlank, translator } from './utils';
import './popup.scss';

const t = translator('popup');

const Main = () => {
  const [suspended, setSuspended] = useState();
  const [flash, setFlash] = useState({});

  useEffect(() => {
    browser.storage.local.get('suspended').then(c => setSuspended(c.suspended));
    browser.storage.onChanged.addListener(c => {
      const newValue = c.suspended?.newValue;
      newValue && setSuspended(newValue);
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
    result?.success === 'success' && window.close();
  };

  function openOptionsPage() {
    browser.runtime.openOptionsPage();
  };

  return (
    <>
      <ul>
        <li data-action='toggle' onClick={onAction}>{suspended === 'yes' ? t('_enableAutoTrigger') : t('_disableAutoTrigger')}</li>
        <li data-action='delocalize-now' onClick={onAction}>{t('_triggerOnPage')}</li>
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

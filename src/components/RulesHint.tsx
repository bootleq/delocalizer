import React from 'react';
import browser from "webextension-polyfill";

import { translator } from '../utils';

const t = translator('options');

let uiLang = browser.i18n.getUILanguage();
if (uiLang.startsWith('en')) {
  uiLang = 'zh-TW';
}

type HintProps = {show: boolean, onToggleHint: () => void};
const Hint = ({show, onToggleHint}: HintProps) => {

  if (!show) {
    return;
  }

  return (
    <div id='rules-hint'>
      <button type='button' title={t('_domainRulesCloseHint')} onClick={onToggleHint}>✖</button>
      <dl className='samples'>
        <dt>{t('_domainRulesHintExample1')}<span className='field-term'>{t('_rulesThFind')}</span>{t('_domainRulesHintQuotedSubdomain')}</dt>
        <dd>
          <code>https://<var className='locale'>{uiLang}</var>.<var className='domain'>abc.com</var>/foo</code> <span className='to'>{t('_domainRulesHintTransTo')}</span><br />
          <code>https://<var className='locale'>en-US</var>.<var className='domain'>abc.com</var>/foo</code>
        </dd>

        <dt>{t('_domainRulesHintExample2')}<span className='field-term'>{t('_rulesThFind')}</span>{t('_domainRulesHintQuotedPath')}</dt>
        <dd>
          <code>https://<var className='domain'>abc.com</var>/<var className='locale'>{uiLang}</var>/foo</code> <span className='to'>{t('_domainRulesHintTransTo')}</span><br />
          <code>https://<var className='domain'>abc.com</var>/<var className='locale'>en-US</var>/foo</code>
        </dd>
      </dl>

      <div id='rules-hint-fields'>
        <dl>
          <dt><span className='field-term'>{t('_rulesThDomain')}</span><samp><var>abc.com</var></samp></dt>
          <dd>
            {t('_domainRulesHintDomainDefination')}
            <br />
            {t('_domainRulesHintDomainShortcut_preDomain')}<code>abc.com</code>{t('_domainRulesHintDomainShortcut_postDomain')}<code>xxx.abc.com</code>{t('_domainRulesHintDomainShortcut_tail')}
          </dd>
          <dt><span className='field-term'>{t('_rulesThLocales')}</span><samp><var>zh-TW</var> → <var>en-US</var></samp></dt>
          <dd>
            {t('_domainRulesHintLocalesDefination')}
            <p>
              {t('_domainRulesHintLocalesShortcut_preShort')}
              <code>xx</code>
              {t('_domainRulesHintLocalesShortcut_postShort')}
              <code>xx-XX</code>
              {t('_domainRulesHint_separators')}
              <code>xx_XX</code>
              {t('_domainRulesHint_separators')}
              <code>xx-xxxx</code>
              {t('_domainRulesHintLocalesShortcut_tail')}
            </p>
            <hr />
            <p>
              {t('_domainRulesHintLocalesFormer_preStar')}
              <code>*</code>
              {t('_domainRulesHintLocalesFormer_postStar')}
              <code>yy</code>
              {t('_domainRulesHint_separators')}
              <code>zz-ZZ</code>
              {t('_domainRulesHintLocalesFormer_tail')}
            </p>
            <p>
              {t('_domainRulesHintLocalesLatterBlank')}
              <br />
              {t('_domainRulesHintLocalesLatterBlankRestrict_pre')}
              <code>*</code>
              {t('_domainRulesHintLocalesLatterBlankRestrict_post')}
            </p>
          </dd>
        </dl>
      </div>
    </div>
  )
};

export default Hint;

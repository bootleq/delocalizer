import React from 'react';
import browser from "webextension-polyfill";

const uiLang = browser.i18n.getUILanguage();

const Hint = ({show, onToggleHint}) => {

  if (!show) {
    return;
  }

  return (
    <div id='rules-hint'>
      <button type='button' title={'close'} onClick={onToggleHint}>✖</button>
      <dl className='samples'>
        <dt>範例 1：<span className='field-term'>尋找</span>「子網域」</dt>
        <dd>
          <code>https://<var className='locale'>{uiLang}</var>.<var className='domain'>abc.com</var>/foo</code> <span className='to'>轉換成</span> <br />
          <code>https://<var className='locale'>en-US</var>.<var className='domain'>abc.com</var>/foo</code>
        </dd>

        <dt>範例 2：<span className='field-term'>尋找</span>「路徑」</dt>
        <dd>
          <code>https://<var className='domain'>abc.com</var>/<var className='locale'>{uiLang}</var>/foo</code> <span className='to'>轉換成</span> <br />
          <code>https://<var className='domain'>abc.com</var>/<var className='locale'>en-US</var>/foo</code>
        </dd>
      </dl>

      <div id='rules-hint-fields'>
        <dl>
          <dt><span className='field-term'>網域</span><samp><var>abc.com</var></samp></dt>
          <dd>
            指明要自動轉換的網站，請輸入網域名稱。
            <br />
            不必輸入子網域，例如只要輸入 <code>abc.com</code>，就能包含 <code>xxx.abc.com</code>。
          </dd>
          <dt><span className='field-term'>轉換語言</span><samp><var>zh-TW</var> → <var>en-US</var></samp></dt>
          <dd>
            分為前後兩項，前面是原網址中的「原始語言」，後面是要替換成的「目的語言」。
            <p>
              語言只輸入兩個字時（例如 <code>xx</code>），會自動包含 <code>xx-XX</code>、<code>xx_XX</code>、<code>xx-xxxx</code> 等變型。
            </p>
            <hr />
            <p>
              第一項可以輸入「<code>*</code>」，表示任何語言都可以，例如 <code>yy</code>、<code>zz-ZZ</code>。
            </p>
            <p>
              第二項可以留空，表示把語言部分換成空白，會送出替換用的 accept-language 標頭，交由網站伺服器判斷適合的語言。
              <br />
              選擇尋找「路徑」時，不能設定由 <code>*</code> 轉到空白，因為所有網址都會符合。
            </p>
          </dd>
        </dl>
      </div>
    </div>
  )
};

export default Hint;

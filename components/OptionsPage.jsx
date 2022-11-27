import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { load as loadConfig, save as saveConfig } from '../config';
import { translator } from '../utils';
import '../options.scss';

import TargetReferrers from './TargetReferrers';
import TargetHosts from './TargetHosts';
import TargetLocales from './TargetLocales';

const t = translator('options');

const prepopulate = (config) => { // Convert config -> form
  const {...form} = config;

  ['targetReferrers', 'targetHosts', 'targetLocales'].forEach(k => {
    if (form[k].length === 0) {
      form[k].push(''); // initial blank input
    }
    form[k] = form[k].reduce(
      (acc, item, idx) => ({...acc, [idx]: item}),
      {}
    );
  });

  return form;
};

const serialize = (form) => { // Convert form -> config
  const {...config} = form;

  ['targetReferrers', 'targetLocales', 'targetHosts'].forEach(k => {
    config[k] = Object.entries(config[k])
                  .filter(a => a[1].trim() !== '')
                  .sort(a => a[0])
                  .map(a => a[1].trim());
  });

  return config;
};

// Extra validation for Hosts, basic ones were simply checked by browser
const validate = ($form) => {
  const $hosts = Array.from($form.querySelectorAll('[name="targetHosts[]"]'));
  let valid = true;
  $hosts.forEach(h => h.setCustomValidity(''));

  $hosts.filter(h => h.matches('[value^="/"]:enabled')).forEach(h => {
    const pattern = h.value.substring(1);
    try {
      new RegExp(pattern);
    } catch (e) {
      h.setCustomValidity(t('error_invalidHostPattern'));
      valid = false;
    }
  });
  return valid;
};


const Form = () => {
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(true);

  const formRef = useRef();

  useEffect(() => {
    loadConfig().then(c => {
      setForm(prepopulate(c));
      setBusy(false);
    });
  }, []);

  function onTextChange(e) {
    const $e = e.target;
    const { name, value } = $e;
    setForm(prev => ({...prev, [name]: value}));
  }

  function onCheckSwitch(e) {
    const $e = e.target;
    const { name, checked } = $e;
    const value = checked ? 'yes' : 'no';
    setForm(prev => ({...prev, [name]: value}));
  }

  async function onSave(e) {
    e.preventDefault();
    const $form = formRef.current;
    $form.classList.add('validating');

    if (validate($form) && $form.checkValidity()) {
      $form.classList.remove('validating');
      setBusy(true);

      try {
        await saveConfig(serialize(form));
        setMsg({type: 'success', msg: t('_saved')});
        setBusy(false);
      } catch (e) {
        console.error('Save failed', e);
      }
    } else {
      setMsg({type: 'error', msg: t('_invalid')});
    }
  }

  function hideMsg() {
    setMsg({});
  }

  const commonListProps = { form, setForm, busy };

  return (
    <form ref={formRef}>
      <fieldset id='actions' disabled={busy}>
        {msg.type
          ? <span className={classNames('status-msg', msg.type)}>
              { msg.msg }
              <span onClick={hideMsg} >✖</span>
            </span>
          : <span className='save-reminder'>{t('_saveReminder')}</span>
        }
        <button onClick={onSave}>{t('_save')}</button>
      </fieldset>

      <h1>{t('_headerTriggerWhen')}</h1>

      <TargetReferrers {...commonListProps}></TargetReferrers>
      <TargetHosts {...commonListProps}></TargetHosts>
      <TargetLocales {...commonListProps}></TargetLocales>

      <h1>{t('_headerDetails')}</h1>

      <fieldset id='details' disabled={busy}>
        <label>
          {t('_showTransformedCount')}
          <input type='checkbox' className='toggle' name='showBadge' checked={form.showBadge === 'yes'} onChange={onCheckSwitch} />
        </label>

        <hr />

        <label>
          <span dangerouslySetInnerHTML={{__html: t('_headerReplacement')}} />
          <input type='text' name='preferredLang' value={form.preferredLang || ''} onChange={onTextChange} />
        </label>

        <small className='hint'>
          {t('_defaultValueIs')}<code>en-US,en,*;q=0.5</code>
        </small>
      </fieldset>
    </form>
  );
};

export default Form;

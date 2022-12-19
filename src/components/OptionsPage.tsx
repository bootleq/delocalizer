import React, { useState, useEffect, useRef } from 'react';
import { map, trim, dissoc } from 'ramda';
import clsx from 'clsx';

import { load as loadConfig, save as saveConfig } from '../config';
import DomainRule from '../DomainRule';
import { translator } from '../utils';
import '../options.scss';

import ImportExport from './ImportExport';
import TargetReferrers from './TargetReferrers';
import DomainRules from './DomainRules';

const t = translator('options');

export interface FormContract {
  targetReferrers: {[index: number]: string},
  targetReferrersAny: 'yes' | 'no',
  domainRules: DomainRule[],
  preferredLang: string,
  showBadge: 'yes' | 'no',
}

const prepopulate = (config) => { // Convert config -> form
  const {...form} = config;

  if (form['targetReferrers'].length === 0) {
    form['targetReferrers'].push(''); // initial blank input
  }
  form['targetReferrers'] = form['targetReferrers'].reduce(
    (acc, item, idx) => ({...acc, [idx]: item}),
    {}
  );

  if (form['domainRules'].length === 0) {
    form['domainRules'].push(new DomainRule());
  }
  form['domainRules'] = form['domainRules'].reduce(
    (acc, item, idx) => ([...acc, {...item, key: idx}]),
    []
  );

  return form;
};

const serialize = (form: FormContract) => { // Convert form -> config
  const {...config} = form;

  config['targetReferrers'] = Object.entries(config['targetReferrers'])
                                  .filter(a => a[1].trim() !== '')
                                  .sort(a => Number(a[0]))
                                  .map(a => a[1].trim());

  config['domainRules'] = config['domainRules']
                            .map(dissoc('key'))
                            .map(map(trim));

  return config;
};

// Extra validation for Hosts, basic ones were simply checked by browser
const validate = ($form: HTMLFormElement) => {
  let valid = true;

  const $rules = Array.from<HTMLTableRowElement>($form.querySelectorAll('#domain-rules tbody > tr'));
  $rules.forEach(tr => {
    const $inputs = ['position', 'fromLocale', 'toLocale'].reduce((acc, k) => ({...acc, [k]: tr.querySelector(`[name$='.${k}']`)}), {});

    $inputs['toLocale'].setCustomValidity('');

    if ($inputs['position'].value === '/path' && $inputs['fromLocale'].value === '*' && $inputs['toLocale'].value === '') {
      valid = false;
      $inputs['toLocale'].setCustomValidity(t('error_pathWildMatch'));
    }
  });

  return valid;
};

const Form = () => {
  const [form, setForm] = useState({} as FormContract);
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(true);

  const formRef = useRef();

  useEffect(() => {
    loadConfig().then(resetFormFromConfig);
  }, []);

  function resetFormFromConfig(config) {
    setForm(prepopulate(config));
    setBusy(false);
  }

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
          ? <span className={clsx('status-msg', msg.type)}>
              { msg.msg }
              <span onClick={hideMsg} >✖</span>
            </span>
          : <span className='save-reminder'>{t('_saveReminder')}</span>
        }
        <button onClick={onSave}>{t('_save')}</button>

        <ImportExport setBusy={setBusy} setMsg={setMsg} resetConfig={resetFormFromConfig}  />
      </fieldset>

      <fieldset id='domain-rules'>
        <DomainRules {...commonListProps}></DomainRules>
      </fieldset>

      <fieldset id='details' disabled={busy}>
        <TargetReferrers {...commonListProps}></TargetReferrers>

        <hr />

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

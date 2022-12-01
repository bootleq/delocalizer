import React, { useState, useEffect, useRef } from 'react';
import { assocPath, dissocPath } from 'ramda';

import { isBlank, translator } from '../utils';
import DomainRule from '../DomainRule';

const t = translator('options');

const RulePositionOptions = ({rule, ruleKey, onChange}) => {
  const options = [{value: 'sub.', label: '子網域'}, {value: '/path', label: '路徑'}];
  return (
    <select name={`domainRules.${ruleKey}.position`} value={rule.position} onChange={onChange}>
      {options.map(({value, label}) => (
        <option value={value} key={value}>{label}</option>
      ))}
    </select>
  );
};

const Rules = (props) => {
  const { form, setForm, disabled, items } = props;

  function onChange(e) {
    const $e = e.target;
    let { name, value } = $e;
    if ($e.type === 'checkbox') {
      value = $e.checked ? 'yes' : 'no';
    }
    setForm(prev => assocPath(name.split('.'), value, prev));
  }

  function onDelete(e) {
    const $e = e.target;
    let { name } = $e;
    setForm(prev => dissocPath(name.split('.'), prev));
  }

  return Object.entries(items).map(([key, r]) => (
    <tr key={key}>
      <td><input type='text' name={`domainRules.${key}.domain`} value={r.domain} onChange={onChange} required /></td>
      <td><RulePositionOptions rule={r} ruleKey={key} onChange={onChange} /></td>
      <td className='locale-dir'>
        <input type='text' name={`domainRules.${key}.fromLocale`} value={r.fromLocale} onChange={onChange} required />
        <span>→</span>
        <input type='text' name={`domainRules.${key}.toLocale`} value={r.toLocale} onChange={onChange} />
      </td>
      <td><input type='checkbox' className='toggle' name={`domainRules.${key}.enabled`} checked={r.enabled === 'yes'} onChange={onChange} /></td>
      <td>
        <input type='button' value={t('_delete')} name={`domainRules.${key}`} onClick={onDelete} />
      </td>
    </tr>
  ));
};

const DomainRules = props => {
  const { form, setForm, busy } = props;

  const listRef = useRef();

  const maxKey = useRef(0);
  const nextKey = () => {
    return maxKey.current += 1;
  }

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (form.domainRules) {
      const keys = Object.keys(form.domainRules);
      maxKey.current = Math.max(...keys.map(k => Number.parseInt(k, 10)));
    }
  }, [form.domainRules && Object.keys(form.domainRules)]);

  useEffect(() => {
    if (adding) {
      listRef.current.querySelector('tr:last-child input[type="text"]').focus();
      setAdding(false);
    }
  }, [adding]);

  function onAdd(e) {
    const newItem = new DomainRule();
    const newKey = nextKey();

    setAdding(true);
    setForm(prev => assocPath(['domainRules', newKey], newItem, prev));
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>網域</th>
            <th>尋找</th>
            <th>轉換語言</th>
            <th>啟用</th>
            <th></th>
          </tr>
        </thead>
        <tbody ref={listRef}>
          {!isBlank(form) &&
            <Rules form={form} setForm={setForm} items={form.domainRules} disabled={busy} />
          }
        </tbody>
      </table>
      <input className='add' type='button' value={t('_addNew')}
             onClick={onAdd} disabled={busy} />
    </>
  );
};

export default DomainRules;

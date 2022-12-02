import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { when, map, prop, propEq, assoc, append } from 'ramda';

import { isBlank, translator, updatePath } from '../utils';
import DomainRule from '../DomainRule';
import Menu from './DomainRuleMenu';

const t = translator('options');

const RulePositionOptions = ({rule, ruleKey, onChange}) => {
  const options = [{value: 'sub.', label: '子網域'}, {value: '/path', label: '路徑'}];
  return (
    <select name={`${ruleKey}.position`} value={rule.position} onChange={onChange}>
      {options.map(({value, label}) => (
        <option value={value} key={value}>{label}</option>
      ))}
    </select>
  );
};

const Rules = (props) => {
  const { form, setForm, disabled, items, setMenuOpen, setMenuAnchor } = props;

  function onChange(e) {
    const $e = e.target;
    let { name, value } = $e;
    const [ruleKey, prop] = name.split('.')

    if ($e.type === 'checkbox') {
      value = $e.checked ? 'yes' : 'no';
    }
    setForm(updatePath(
      ['domainRules'],
      map(when(
        propEq('key', Number.parseInt(ruleKey, 10)),
        assoc(prop, value)
      ))
    ));
  }

  function onOpenMenu(e) {
    setMenuAnchor(e.target);
    setMenuOpen(true);
  }

  return items.map(r => (
    <tr key={r.key}>
      <td><input type='text' name={`${r.key}.domain`} value={r.domain} onChange={onChange} required /></td>
      <td><RulePositionOptions rule={r} ruleKey={r.key} onChange={onChange} /></td>
      <td className='locale-dir'>
        <input type='text' name={`${r.key}.fromLocale`} value={r.fromLocale} onChange={onChange} required />
        <span>→</span>
        <input type='text' name={`${r.key}.toLocale`} value={r.toLocale} onChange={onChange} />
      </td>
      <td><input type='checkbox' className='toggle' name={`${r.key}.enabled`} checked={r.enabled === 'yes'} onChange={onChange} /></td>
      <td><input className='more-actions' data-key={r.key} type='button' value='⋯' onClick={onOpenMenu} /></td>
    </tr>
  ));
};


const DomainRules = props => {
  const { form, setForm, busy } = props;

  const listRef = useRef();
  const menuRef = useRef();

  const maxKey = useRef(0);
  const nextKey = () => {
    return maxKey.current += 1;
  }

  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    if (form.domainRules) {
      const keys = form.domainRules.map(prop('key'));
      maxKey.current = Math.max(...keys.map(k => Number.parseInt(k, 10)));
    }
  }, [form.domainRules]);

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
    setForm(updatePath(
      ['domainRules'],
      append({...newItem, key: newKey})
    ));
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
            <Rules form={form} setForm={setForm} setMenuOpen={setMenuOpen} setMenuAnchor={setMenuAnchor} items={form.domainRules} disabled={busy} />
          }
        </tbody>
      </table>

      <Menu ref={menuRef} anchor={menuAnchor} open={menuOpen} setMenuOpen={setMenuOpen} setForm={setForm} />

      <input className='add' type='button' value={t('_addNew')}
             onClick={onAdd} disabled={busy} />
    </>
  );
};

export default DomainRules;

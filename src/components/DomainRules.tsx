import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { when, not, map, prop, propEq, assoc, append } from 'ramda';
import clsx from 'clsx';

import { isBlank, translator, updatePath } from '../utils';
import RulesHint from './RulesHint';
import DomainRule from '../DomainRule';
import Menu from './DomainRuleMenu';

import type { FormContract } from "./OptionsPage";

const t = translator('options');

const rulePositionOptions = [
  {value: 'sub.', label: t('_rulesPosSubdomain')},
  {value: '/path', label: t('_rulesPosPath')}
];

interface RulePositionOptionsProps {
  rule: DomainRule,
  ruleKey: number,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

const RulePositionOptions = ({rule, ruleKey, onChange}: RulePositionOptionsProps) => {
  return (
    <select name={`${ruleKey}.position`} value={rule.position} onChange={onChange}>
      {rulePositionOptions.map(({value, label}) => (
        <option value={value} key={value}>{label}</option>
      ))}
    </select>
  );
};

interface RuleProps {
  anchored: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onOpenMenu: (e: React.MouseEvent<HTMLElement>) => void,
  rule: DomainRule,
}

const Rule = memo(function RuleInner(props: RuleProps) {
  const {
    anchored, onChange, onOpenMenu, rule,
    rule: {key, domain, fromLocale, toLocale, enabled}
  } = props;

  const ref = useRef();
  const anchoredRef = useRef(false);

  useEffect(() => {
    if (anchored) {
      ref.current.classList?.add('anchored');
      anchoredRef.current = true;
    } else {
      if (anchoredRef.current) {
        ref.current.classList?.add('anchored'); // react remove the node (with its classes) when move item down, we has to add it back
        setTimeout(() => {
          ref.current.classList?.remove('anchored');
          anchoredRef.current = false;
        });
      }
    }
  }, [anchored]);

  return (
    <tr ref={ref}>
      <td><input type='text' name={`${key}.domain`} value={domain} onChange={onChange} required /></td>
      <td><RulePositionOptions rule={rule} ruleKey={key} onChange={onChange} /></td>
      <td className='locale-dir'>
        <input type='text' name={`${key}.fromLocale`} value={fromLocale} onChange={onChange} required />
        <span>→</span>
        <input type='text' name={`${key}.toLocale`} value={toLocale} onChange={onChange} />
      </td>
      <td><input type='checkbox' className='toggle' name={`${key}.enabled`} checked={enabled === 'yes'} onChange={onChange} /></td>
      <td><input className='more-actions' data-key={key} type='button' value='⋯' onClick={onOpenMenu} /></td>
    </tr>
  );
});

interface RulesProps {
  setForm: (form: FormContract) => FormContract,
  disabled: boolean,
  items: DomainRule[],
  menuOpen: boolean,
  setMenuOpen: (state: boolean) => boolean,
  setMenuAnchor: (el: HTMLElement) => HTMLElement,
}

const Rules = (props: RulesProps) => {
  const { setForm, items, menuOpen, setMenuOpen, setMenuAnchor } = props;

  const [anchoredKey, setAnchoredKey] = useState();

  const onChange = useCallback(e => {
    const $e = e.target;
    let { value } = $e;
    const [ruleKey, prop] = $e.name.split('.')

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
  }, [setForm]);

  const onOpenMenu = useCallback(e =>  {
    setMenuAnchor(e.target);
    setAnchoredKey(e.target.dataset.key);
    setMenuOpen(true);
  }, [setMenuAnchor, setAnchoredKey, setMenuOpen]);

  return items.map(r => (
    <Rule rule={r} key={r.key} anchored={menuOpen && Number.parseInt(anchoredKey, 10) === r.key}
          onChange={onChange} onOpenMenu={onOpenMenu} />
  ));
};


interface DomainRulesProps {
  form: FormContract,
  setForm: (form: FormContract) => FormContract,
  busy: boolean,
}

const DomainRules = (props: DomainRulesProps) => {
  const { form, setForm, busy } = props;

  const listRef = useRef();
  const menuRef = useRef();

  const maxKey = useRef(0);
  const nextKey = () => {
    return maxKey.current += 1;
  }

  const [showHint, setShowHint] = useState(false);
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    if (form.domainRules) {
      const keys = form.domainRules.map(prop('key')).map(Number);
      maxKey.current = keys.length ? Math.max(...keys) : 0;
    }
  }, [form.domainRules]);

  useEffect(() => {
    if (adding) {
      listRef.current.querySelector('tr:last-child input[type="text"]').focus();
      setAdding(false);
    }
  }, [adding]);

  function onToggleHint() {
    setShowHint(not);
  }

  function onAdd() {
    const newItem = new DomainRule();
    const newKey = nextKey();

    setAdding(true);
    setForm(updatePath(
      ['domainRules'],
      append({...newItem, key: newKey})
    ));
  }

  const showHintText = showHint ? t('_domainRulesCloseHint') : t('_domainRulesOpenHint');

  return (
    <>
      <legend>
        {t('_domainRulesHeader')}
        <button type='button' className={clsx('help-toggle', showHint && 'hint-shown')} onClick={onToggleHint}>
          <img src='../icons/question-11800-iconpacks.svg' alt='' />
          <span>{showHintText}</span>
        </button>
      </legend>

      <RulesHint show={showHint} onToggleHint={onToggleHint} />

      <table>
        <thead>
          <tr>
            <th>{t('_rulesThDomain')}</th>
            <th>{t('_rulesThFind')}</th>
            <th>{t('_rulesThLocales')}</th>
            <th>{t('_rulesThEnabled')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody ref={listRef}>
          {!isBlank(form) &&
            <Rules setForm={setForm}
                   {...{ menuOpen, setMenuOpen, setMenuAnchor }}
                   items={form.domainRules} disabled={busy} />
          }
        </tbody>
      </table>

      <Menu ref={menuRef} anchor={menuAnchor} open={menuOpen} setMenuOpen={setMenuOpen} form={form} setForm={setForm} />

      <input className='add' type='button' value={t('_addNew')}
             onClick={onAdd} disabled={busy} />
    </>
  );
};

export default DomainRules;

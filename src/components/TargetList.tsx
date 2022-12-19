import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { isBlank, translator } from '../utils';

const t = translator('options');

const nextKey = (keys, maxSeenRef) => {
  const numberKeys = [...keys, maxSeenRef.current].map(Number);
  const max = Math.max(...numberKeys);
  maxSeenRef.current = max + 1;
  return maxSeenRef.current;
};

interface OptionListProps {
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onDelete: (e: React.MouseEvent<HTMLElement>) => void,
  onAdded: () => void,
  disabled: boolean,
  adding: boolean,
  items: {
    [index: number]: string,
  },
}

const OptionList = forwardRef(function OptionListInner(props: OptionListProps, ref) {
  const { name, onChange, onDelete, onAdded, disabled, adding, items } = props;

  useEffect(() => {
    if (adding) {
      ref.current.querySelector('li:last-child > input[type="text"]').focus();
      onAdded();
    }
  }, [adding]);

  const list = Object.entries(items).map(([k, v]) => (
    <li key={k} data-key={k}>
      <input type='text' name={name} value={v} onChange={onChange} disabled={disabled} required />
      <input type='button' value={t('_delete')} onClick={onDelete} disabled={disabled} />
    </li>
  ));

  return (
    <ul ref={ref}>
      {list}
    </ul>
  );
});

type TargetListProps = {
  slots: {
    legend: string,
    labelAnyHTML?: string,
    labelAny?: string,
    hint: {__html: string},
  },
  configName: string,
  form: object,
  setForm: (form: object) => object,
  busy: boolean,
};

const TargetList = (props: TargetListProps) => {
  const { slots, configName, form, setForm, busy } = props;
  const [adding, setAdding] = useState(null);
  const loaded = !isBlank(form);

  const listRef = useRef<HTMLUListElement>(null);
  const maxSeenKey = useRef(0);

  const configNameAny = `${configName}Any`;

  function validateItems() {
    const inputs = Array.from<HTMLInputElement>(listRef.current.querySelectorAll('input[type="text"]'));

    if (inputs.length === 1 && inputs[0].value.trim() === '') {
      return true;
    }

    return inputs.every(i => i.checkValidity());
  }

  function onRadioChange(e) {
    const $e = e.target;
    const { name, value } = $e;

    if (value === 'yes' && !validateItems()) {
      listRef.current.classList.add('validating');
      e.preventDefault();
      return;
    }
    listRef.current.classList.remove('validating');

    setForm(prev => ({...prev, [name]: value}));
  }

  function buildOnOptionListChange(name) {
    return function onOptionListChange(e) {
      const $e = e.target;
      const { value } = $e;
      const key = $e.closest('[data-key]').dataset.key;

      setForm(prev => {
        const items = prev[name];
        items[key] = value;
        return {...prev, [name]: items};
      });
    };
  }

  function buildOnOptionListAdd(name) {
    return function onOptionListAdd() {
      setAdding(name);
      setForm(prev => {
        const items = prev[name];
        const newKey = nextKey(Object.keys(items), maxSeenKey);
        items[newKey] = '';

        return {...prev, [name]: items};
      });
    };
  }

  function buildOnOptionListDelete(name) {
    return function onOptionListDelete(e) {
      const $e = e.target;
      const key = $e.closest('[data-key]').dataset.key;
      nextKey([key], maxSeenKey);

      setForm(prev => {
        const items = prev[name];
        delete items[key];
        return {
          ...prev,
          [name]: items
        };
      });
    };
  }

  function onAdded() {
    setAdding(false);
  }

  return (
    form &&
    <div className='domain-names' disabled={busy}>
      {slots.legend}
      <label>
        <input type='radio' name={configNameAny} value='yes' checked={form[configNameAny] === 'yes'} onChange={onRadioChange} />
        {slots.labelAnyHTML ? <span dangerouslySetInnerHTML={slots.labelAnyHTML} /> : slots.labelAny}
      </label>

      <label>
        <input type='radio' name={configNameAny} value='no' checked={form[configNameAny] === 'no'} onChange={onRadioChange} />
        {t('_listBelow')}
      </label>

      <OptionList
        ref={listRef}
        items={loaded ? form[configName] : {}}
        name={`${configName}[]`}
        adding={adding}
        disabled={form[configNameAny] !== 'no'}
        onChange={buildOnOptionListChange(configName)}
        onDelete={buildOnOptionListDelete(configName)}
        onAdded={onAdded}
      />

      <div className='hint-and-add'>
        <small className='hint' dangerouslySetInnerHTML={slots.hint} />
        <input className='add' type='button' value={t('_addNew')}
               onClick={buildOnOptionListAdd(configName)}
               disabled={form[configNameAny] !== 'no'}  />
      </div>
    </div>
  );
};

export default TargetList;

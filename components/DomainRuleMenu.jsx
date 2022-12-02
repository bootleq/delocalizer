import React, { useState, useEffect, useLayoutEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useFloating } from '@floating-ui/react-dom';
import { dissocPath, over, lensProp, reject, propEq, move } from 'ramda';

import { translator, updatePath } from '../utils';

const t = translator('options');

const loopWithin = (currentIndex, size, direction) => {
  const next = currentIndex + direction * 1;
  if (next >= size) return 0;
  if (next < 0) return (size - 1);
  return next;
};

const DomainRuleMenu = forwardRef(({open, anchor, setMenuOpen, form, setForm}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsCountRef = useRef(0);

  const {x, y, reference, floating, strategy, refs} = useFloating({placement: 'left'});
  const menuStyles={
    position: strategy,
    top: y ?? 0,
    left: x ?? 0,
    width: 'max-content',
  };

  ref = refs.floating;

  useLayoutEffect(() => {
    reference(anchor);
  }, [reference, anchor]);

  useEffect(() => {
    if (open && ref.current) {
      const item = ref.current.querySelector(`li:nth-child(${currentIndex + 1})`);
      item?.focus();
    }
  }, [open, ref.current, currentIndex]);

  useEffect(() => {
    if (ref.current) {
      itemsCountRef.current = ref.current.children.length;
    }
  }, [ref.current]);

  function onDelete(e) {
    if (globalThis.confirm('Are you sure?')) {
      const key = Number.parseInt(anchor.dataset.key, 10);
      setForm(updatePath(
        ['domainRules'],
        reject(propEq('key', key))
      ));
      setMenuOpen(false);
    }
  }

  function onMove(e) {
    const dir = e.target.dataset.direction === 'down' ? 1 : -1;
    const key = Number.parseInt(anchor.dataset.key, 10);
    const index = form.domainRules.findIndex(propEq('key', key));
    const size = form.domainRules.length;
    let fromTo = [index, index + dir];

    if (dir === 1 && index === (size - 1)) {
      fromTo = [-1, 0];
    } else if (dir === -1 && index === 0) {
      fromTo = [0, size - 1];
    }

    setForm(updatePath(
      ['domainRules'],
      move(...fromTo)
    ));
    setMenuOpen(false);
  }

  function onClose() {
    setMenuOpen(false);
  }

  function nextIndex(direction) {
    setCurrentIndex(loopWithin(currentIndex, itemsCountRef.current, direction));
  }

  function onKeyDown(e) {
    switch (e.key) {
    case 'Escape':
      e.stopPropagation();
      onClose();
      break;
    case 'ArrowUp':
    case 'k':
      nextIndex(-1);
      break;
    case 'ArrowDown':
    case 'j':
      nextIndex(1);
      break;
    case 'Tab':
      e.preventDefault();
      nextIndex(e.shiftKey ? -1 : 1);
      break;
    }
  }

  if (!open) {
    return null;
  }

  const portal = (
    <>
      <div className='backdrop' aria-hidden onClick={onClose} onKeyDown={onKeyDown} />
      <ul ref={floating} className='more-menu' style={menuStyles} aria-label='rule operations' onKeyDown={onKeyDown} >
        <li tabIndex='-1' onClick={onDelete}>{t('_delete')}</li>
        <li tabIndex='-1' data-direction='up' onClick={onMove}>上移</li>
        <li tabIndex='-1' data-direction='down' onClick={onMove}>下移</li>
      </ul>
    </>
  );

  return createPortal(portal, document.body);
});

export default DomainRuleMenu;

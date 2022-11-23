import React, { useState, useEffect, useRef } from 'react';
import TargetList from './TargetList';
import { translator } from '../utils';

const t = translator('options');

const TargetLocales = props => {
  const { form, setForm, busy } = props;

  const slots = {
    legend: t('_targetLocales'),
    labelAnyHTML: {__html: t('_targetLocalesAnyHTML')},
    hint: {__html: t('_targetLocalesHint')}
  };

  return (
    <TargetList {...{form, setForm, busy, slots}} configName='targetLocales' />
  );
};

export default TargetLocales;

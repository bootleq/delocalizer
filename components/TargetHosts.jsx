import React, { useState, useEffect, useRef } from 'react';
import TargetList from './TargetList';
import { translator } from '../utils';

const t = translator('options');

const TargetHosts = props => {
  const { form, setForm, busy } = props;

  const slots = {
    legend: t('_targetHost'),
    labelAny: t('_targetHostAny'),
    hint: {__html: t('_targetHostHint')}
  };

  return (
    <TargetList {...{form, setForm, busy, slots}} configName='targetHosts' />
  );
};

export default TargetHosts;

import React, { useState, useEffect, useRef } from 'react';
import TargetList from './TargetList';
import { translator } from '../utils';

const t = translator('options');

const TargetReferrers = props => {
  const { form, setForm, busy } = props;

  const slots = {
    legend: t('_targetReferrer'),
    labelAny: t('_targetReferrerAny'),
    hint: {__html: t('_targetReferrerHint')}
  };

  return (
    <TargetList {...{form, setForm, busy, slots}} configName='targetReferrers' />
  );
};

export default TargetReferrers;

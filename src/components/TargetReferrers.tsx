import React from 'react';
import TargetList from './TargetList';
import { translator } from '../utils';

const t = translator('options');

interface Props {
  form: object,
  setForm: (form: object) => object,
  busy: boolean,
}

const TargetReferrers = ({ form, setForm, busy }: Props) => {
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

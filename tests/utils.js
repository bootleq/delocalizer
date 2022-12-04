import DomainRule from '../DomainRule';

const ruleFromArgs = (...args) => {
  const props = ['domain', 'fromLocale', 'toLocale', 'position'].reduce(
    (acc, k, i) => ({ ...acc, [k]: args[i]}),
    {enabled: 'yes'}
  );
  return new DomainRule(props);
};

export { ruleFromArgs };

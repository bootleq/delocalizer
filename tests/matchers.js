function toRedirect (dnrRule, url, destinationUrl) {
  const options = {
    comment: 'simulate DNR URL substitution',
    isNot: this.isNot,
    promise: this.promise,
  };
  let subMatches;
  const filter = new RegExp(dnrRule.condition.regexFilter);
  const sub = dnrRule.action.redirect.regexSubstitution;
  const sub$ = sub.replace(/\\(\d+)/g, '$$$1'); // convert DNR \1 submatch to JS $1 style
  const result = url.replace(filter, sub$);

  const pass = result === destinationUrl;

  if (!pass) {
    subMatches = url.match(filter)?.slice(1);
  }

  const message = pass
  ? () => this.utils.matcherHint('toRedirect', undefined, undefined, options) + '\n\n' +
       `Expected: not ${this.utils.printExpected(destinationUrl)}\n` +
       `Received: ${this.utils.printReceived(result)}`
  : () => {
      return (
        this.utils.matcherHint('toRedirect', undefined, undefined, options) + '\n\n' +
        `Expected: ${this.utils.printExpected(destinationUrl)}\n` + `Received: ${this.utils.printReceived(result)}\n\n` +
        'Hint:\n' +
        `  filter: ${this.utils.stringify(filter)}\n` +
        `  sub matches: ${this.utils.stringify(subMatches)}\n` +
        `  replacement: ${this.utils.stringify(sub$)}`
      );
    };

  return {pass, message};
};

export { toRedirect };

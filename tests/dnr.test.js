import { toRedirect } from './matchers';
import { ruleFromArgs } from './utils';
import { fromDomainRule } from '../src/dnr';

expect.extend({toRedirect});

describe('fromDomainRule, to DNR Rule', () => {
  describe('subdomain rule', () => {
    const preferredLang = 'en-US,en,*;q=0.5';

    it('* -> en, got 1 redirect rule', () => {
      const rule = ruleFromArgs('reactjs.org', '*', 'en', 'sub.');
      const config = {domainRules: [rule], preferredLang};
      const result = fromDomainRule(rule, config);

      expect(result[0]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "https://en.\\2"
          }
        },
        "condition": {
          "regexFilter": "^https://((?:[a-zA-Z]{2})(?:[\\-_]\\w{2,4})?)(?:\\.)(reactjs\\.org/.*)",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result).toHaveLength(1);

      expect(result[0]).toRedirect(
        'https://zh-hant.reactjs.org/docs/getting-started.html',
        'https://en.reactjs.org/docs/getting-started.html'
      );
    });

    it('* -> (blank), got 1 redirect rule + 1 modifyHeaders rule', () => {
      const rule = ruleFromArgs('reactjs.org', '*', '', 'sub.');
      const config = {domainRules: [rule], preferredLang};
      const result = fromDomainRule(rule, config);

      expect(result[0]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "https://\\2"
          }
        },
        "condition": {
          "regexFilter": "^https://((?:[a-zA-Z]{2})(?:[\\-_]\\w{2,4})?)(?:\\.)(reactjs\\.org/.*)",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result[1]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "modifyHeaders",
          "requestHeaders": [
            {header: 'accept-language', operation: 'set', value: config.preferredLang}
          ]
        },
        "condition": {
          "regexFilter": "https://reactjs\\.org/.*",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result).toHaveLength(2);

      expect(result[0]).toRedirect(
        'https://zh-hant.reactjs.org/docs/getting-started.html',
        'https://reactjs.org/docs/getting-started.html'
      );

      expect('https://reactjs.org/docs/getting-started.html').toMatch(new RegExp(result[1].condition.regexFilter));
    });
  });

  describe('pathname rule', () => {
    const preferredLang = 'en-US,en,*;q=0.5';

    it('* -> en, got 1 redirect rule', () => {
      const rule = ruleFromArgs('mozilla.org', '*', 'en', '/path');
      const config = {domainRules: [rule], preferredLang};
      const result = fromDomainRule(rule, config);

      expect(result[0]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "https://\\1/en\\2"
          }
        },
        "condition": {
          "regexFilter": "^https://((?:[^\\.]+\\.)?mozilla\\.org)/(?:[a-zA-Z]{2})(?:[\\-_]\\w{2,4})?(/.*|$)",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result).toHaveLength(1);

      expect(result[0]).toRedirect(
        'https://developer.mozilla.org/zh-TW/docs/Web/HTML',
        'https://developer.mozilla.org/en/docs/Web/HTML'
      );
    });

    it('* -> (blank), got 1 redirect rule + 1 modifyHeaders rule', () => {
      const rule = ruleFromArgs('mozilla.org', '*', '', '/path');
      const config = {domainRules: [rule], preferredLang};
      const result = fromDomainRule(rule, config);

      expect(result[0]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "https://\\1\\2"
          }
        },
        "condition": {
          "regexFilter": "^https://((?:[^\\.]+\\.)?mozilla\\.org)/(?:[a-zA-Z]{2})(?:[\\-_]\\w{2,4})?(/.*|$)",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result[1]).toStrictEqual({
        "id": null, // placeholder
        "action": {
          "type": "modifyHeaders",
          "requestHeaders": [
            {header: 'accept-language', operation: 'set', value: config.preferredLang}
          ]
        },
        "condition": {
          "regexFilter": "https://[^\\.]+\\.mozilla\\.org/.*",
          "resourceTypes": [
            "main_frame"
          ]
        }
      });

      expect(result).toHaveLength(2);

      expect(result[0]).toRedirect(
        'https://developer.mozilla.org/zh-TW/docs/Web/HTML',
        'https://developer.mozilla.org/docs/Web/HTML'
      );

      expect('https://developer.mozilla.org/en/docs/Web/HTML').toMatch(new RegExp(result[1].condition.regexFilter));
    });
  });
});

import DomainRule, { match, replaceMatchedSegment } from '../src/DomainRule';

describe('Match', () => {
  describe('By subdomain', () => {
    describe('URL WITH target', () => {
      const url = 'https://zh-hant.reactjs.org/docs/getting-started.html';
      //                   ^^^^^^^^
      test.each([
        // domain       fromLocale toLocale   position enabled
        ['reactjs.org', 'zh',      '',        'sub.',   'yes', 'zh-hant.'],
        ['reactjs.org', 'zh-hant', '',        'sub.',   'yes', 'zh-hant.'],
        ['reactjs.org', '*',       '',        'sub.',   'yes', 'zh-hant.'],
        ['reactjs.org', '*',       'en',      'sub.',   'yes', 'zh-hant.'],
        ['reactjs.org', '*',       '',        'sub.',   'yes', 'zh-hant.'], // very generic, though
        ['reactjs.org', 'zh-hant', 'en',      'sub.',   'yes', 'zh-hant.'],
        ['reactjs.org', 'zh',      '',        'sub.',   'no',  undefined],
        ['reactjs.org', 'zh',      '',        '/path.', 'yes', undefined],
        ['foo.com',     'zh',      '',        'sub.',   'yes', undefined],
        ['reactjs.org', '*',       'zh',      'sub.',   'yes', undefined],
        ['reactjs.org', 'zh',      'zh-hant', 'sub.',   'yes', undefined],
      ])('Case %#: [%s, %s, %s, ...]', (domain, fromLocale, toLocale, position, enabled, expected) => {

        const rule = new DomainRule({ domain, fromLocale, toLocale, position, enabled });
        const m = match(rule, new URL(url));
        expect(m).toBe(expected);
      });
    });

    describe('URL WITHOUT target', () => {
      const url = 'https://reactjs.org/docs/getting-started.html';

      test.each([
        // domain       fromLocale toLocale   position enabled
        ['reactjs.org', 'zh',      '',        'sub.',   'yes', undefined],
        ['reactjs.org', '*',       '',        'sub.',   'yes', undefined],
      ])('Case %#: [%s, %s, %s, ...]', (domain, fromLocale, toLocale, position, enabled, expected) => {
        const rule = new DomainRule({ domain, fromLocale, toLocale, position, enabled });
        const m = match(rule, new URL(url));
        expect(m).toBe(expected);
      });
    });

    describe('Other subdomain', () => {
      const url = 'https://gist.github.com/discover';

      test.each([
        // domain    fromLocale toLocale position  enabled
        ['github.com', 'xx',      '',      'sub.',   'yes', undefined],
        ['github.com', '*',       '',      'sub.',   'yes', 'gist.'],
      ])('Case %#: [%s, %s, %s, ...]', (domain, fromLocale, toLocale, position, enabled, expected) => {
        const rule = new DomainRule({ domain, fromLocale, toLocale, position, enabled });
        const m = match(rule, new URL(url));
        expect(m).toBe(expected);
      });
    });
  });

  describe('By pathname', () => {
    describe('URL WITH target', () => {
      const url = 'https://developer.mozilla.org/zh-TW/docs/Web/HTML';
      //                                        ^^^^^^
      test.each([
        // domain     fromLocale toLocale position enabled
        ['mozilla.org', 'zh',    '',      '/path', 'yes', '/zh-TW'],
        ['mozilla.org', 'zh-TW', '',      '/path', 'yes', '/zh-TW'],
        ['mozilla.org', 'zh-TW', 'en',    '/path', 'yes', '/zh-TW'],
        ['mozilla.org', '*',     'en',    '/path', 'yes', '/zh-TW'],
        ['mozilla.org', '*',     '',      '/path', 'yes', undefined], // avoid too generic match
        ['mozilla.org', 'zh',    '',      '/path', 'no',  undefined],
        ['mozilla.org', 'zh',    '',      'sub.',  'yes', undefined],
        ['foo.com',     'zh',    '',      '/path', 'yes', undefined],
        ['mozilla.org', 'zh',    'zh-TW', '/path', 'yes', undefined],
      ])('Case %#: [%s, %s, %s, ...]', (domain, fromLocale, toLocale, position, enabled, expected) => {
        const rule = new DomainRule({ domain, fromLocale, toLocale, position, enabled });
        const m = match(rule, new URL(url));
        expect(m).toBe(expected);
      });
    });
    describe('URL WITHOUT target', () => {
      const url = 'https://developer.mozilla.org/docs/Web/HTML';

      test.each([
        // domain     fromLocale toLocale position enabled
        ['mozilla.org', 'zh',    '',      '/path', 'yes', undefined],
        ['mozilla.org', '*',     '',      '/path', 'yes', undefined], // avoid too generic match
      ])('Case %#: [%s, %s, %s, ...]', (domain, fromLocale, toLocale, position, enabled, expected) => {
        const rule = new DomainRule({ domain, fromLocale, toLocale, position, enabled });
        const m = match(rule, new URL(url));
        expect(m).toBe(expected);
      });
    });
  });
});

describe('replaceMatchedSegment', () => {
  test.each([
    //   url                                      matched    to     pos     expected
    ['https://zh-hant.reactjs.org/docs/a?b=c#d', 'zh-hant.', '',   'sub.',  'https://reactjs.org/docs/a?b=c#d'],
    ['https://zh-hant.reactjs.org/docs/a?b=c#d', 'zh-hant.', 'ja', 'sub.',  'https://ja.reactjs.org/docs/a?b=c#d'],
    ['https://www.last.fm/it/about/a?b=c#d',     '/it',      '',   '/path', 'https://www.last.fm/about/a?b=c#d'],
    ['https://www.last.fm/it/about/a?b=c#d',     '/it',      'de', '/path', 'https://www.last.fm/de/about/a?b=c#d'],
  ])('Case %# [%s, %s, %s, ...]', (url, matched, toLocale, position, expected) => {
    const rule = new DomainRule({ toLocale, position });
    const result = replaceMatchedSegment(rule, url, matched);
    expect(result).toBe(expected);
  });
});

Delocalizer
===========

Go away from localized pages, e.g., `xx.com/zh-TW` or `zh.xx.com`.

Read the untranslated document by sending mutated Accept-Language header.

Customizable.


Example cases
-------------

Here list some URLs and where they will be converted by this extension.

    https://zh-hant.reactjs.org/docs/getting-started.html
    https://        reactjs.org/docs/getting-started.html

    https://support.apple.com/zh-tw/guide/iphone/iphfed2c4091/ios
    https://support.apple.com/      guide/iphone/whats-new-in-ios-16-iphfed2c4091/ios

    https://developer.mozilla.org/zh-TW/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing
    https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing
                                  ^^^^^


See also
----------------

- [locale-switcher][]
- [msdn-delocalizer][]

[locale-switcher]: https://github.com/locale-switcher/locale-switcher
[msdn-delocalizer]: https://github.com/ForNeVeR/msdn-delocalizer

import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

export function preventHyphenLineBreaks(html: string): string {
  if (!html) return '';

  const nbHyphen   = String.fromCodePoint(0x2011); // NON-BREAKING HYPHEN
  const wordJoiner = String.fromCodePoint(0x2060); // WORD JOINER
  const nbsp       = String.fromCodePoint(0x00A0); // NON-BREAKING SPACE

  const zwsPattern = new RegExp(
    '[' +
    String.fromCodePoint(0x200B) +
    String.fromCodePoint(0x200C) +
    String.fromCodePoint(0x00AD) +
    ']',
    'g'
  );

  // Regex that matches U+00A0 in text — built at runtime to avoid invisible chars in source
  const nbspPattern = new RegExp(nbsp, 'g');

  const processed = html
    // 1. Convert &nbsp; HTML entities and U+00A0 non-breaking spaces to regular spaces.
    //    Quill copy-paste from Word/web stores every space as &nbsp;, making the
    //    entire paragraph one giant unbreakable word. overflow-wrap: break-word then
    //    breaks it mid-character wherever the container edge falls.
    .replace(/&nbsp;/g, ' ')
    .replace(nbspPattern, ' ')

    // 2. Strip invisible Quill-inserted break-opportunity chars
    .replace(zwsPattern, '')

    // 3. Remove <br> directly after a closing inline tag (mid-word paste break)
    .replace(/<\/(strong|em|b|i|u|s|span)><br\s*\/?>/gi, '</$1>')

    // 4. Remove <br> between two word characters (mid-word paste break)
    .replace(/([a-zA-Z0-9])<br\s*\/?>/gi, '$1')

    // 5. Replace </p><p> or </li><li> where the next element starts with a lowercase
    //    letter — sentence-continuation fragments from pasted text, not new elements.
    .replace(/<\/p>\s*<p[^>]*>(?=[a-z])/g, ' ')
    .replace(/<\/li>\s*<li[^>]*>(?=[a-z])/g, ' ')

    // 6. Non-breaking hyphen between word chars (prevents hyphen-point line breaks)
    .replace(/([\p{L}\p{N}])-([\p{L}\p{N}])/gu, `$1${nbHyphen}$2`)

    // 7. Word Joiner after closing inline tags immediately followed by a letter/digit —
    //    prevents Chromium treating the tag boundary as a line-break opportunity
    .replace(/<\/(strong|em|b|i|u|s|span)>([a-zA-Z0-9])/g, `</$1>${wordJoiner}$2`);

  return DOMPurify.sanitize(processed);
}

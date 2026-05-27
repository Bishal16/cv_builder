import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

export function preventHyphenLineBreaks(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(
    html.replace(/([\p{L}\p{N}])-([\p{L}\p{N}])/gu, '$1&#8209;$2')
  );
}

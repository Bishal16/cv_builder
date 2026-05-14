export function preventHyphenLineBreaks(html: string): string {
  if (!html) {
    return '';
  }

  return html.replace(/([\p{L}\p{N}])-([\p{L}\p{N}])/gu, '$1&#8209;$2');
}

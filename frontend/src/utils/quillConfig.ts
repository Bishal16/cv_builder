import { Quill } from 'react-quill-new';

/**
 * Shared rich-text toolbar config for all CV description editors.
 *
 * Font size and color use INLINE styles (not Quill's CSS classes) so the
 * formatting renders everywhere the HTML is shown — the editor, the live
 * preview templates, and the Playwright-rendered PDF — rather than only in the
 * editor where Quill's stylesheet exists. Font family is intentionally left to
 * the templates to keep resumes typographically consistent and ATS-clean.
 */
const SizeStyle = Quill.import('attributors/style/size') as { whitelist: string[] };
SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '24px'];
Quill.register(SizeStyle as never, true);

// Inline-style alignment too (style="text-align:…") so it renders in the
// preview + PDF, not just the editor (Quill's default align is class-based).
const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle as never, true);

// Curated palette + a trailing 'custom' sentinel that opens the native OS color
// picker (which includes an eyedropper on macOS), like Google Docs' "+".
const COLORS = [
  '#111111', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff', '#1e3a5f',
  '#2563eb', '#0e7490', '#0f766e', '#15803d', '#b45309', '#f97316', '#b91c1c',
  '#7c3aed', '#be185d',
  'custom',
];

interface ToolbarThis {
  quill: { format: (name: string, value: unknown) => void };
}

function colorHandler(this: ToolbarThis, value: string) {
  if (value !== 'custom') {
    this.quill.format('color', value || false);
    return;
  }
  const quill = this.quill;
  const input = document.createElement('input');
  input.type = 'color';
  input.value = '#000000';
  input.style.cssText = 'position:fixed;left:-9999px;opacity:0';
  document.body.appendChild(input);
  input.addEventListener('change', () => {
    quill.format('color', input.value);
    input.remove();
  });
  input.click();
}

export const RICH_TEXT_MODULES = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline'],
      [{ size: ['10px', '12px', false, '16px', '18px', '24px'] }],
      [{ color: COLORS }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
    handlers: { color: colorHandler },
  },
};

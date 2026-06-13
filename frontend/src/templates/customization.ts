import type { Cv, TemplateId } from '../types/cv';

/* ──────────────────────────────────────────────────────────────────────────
   Customization layer (Phase 3)

   Each template ships a native default (accent colour, body font, density).
   A CV may override any of these (accentColor / fontFamily / density fields).
   `resolveCustomization` merges overrides over the template default and returns
   ready-to-use values: a hex accent, a soft tint of it, a font stack, and a
   density profile (line-height + page-padding + section-gap multipliers).
   ────────────────────────────────────────────────────────────────────────── */

export type FontChoice = 'sans' | 'serif';
export type Density = 'compact' | 'normal' | 'relaxed';

export const SANS_STACK = '"Inter", Helvetica, Arial, sans-serif';
export const SERIF_STACK = 'Georgia, "Times New Roman", serif';

/** Accent swatches offered in the editor's customization panel. */
export const ACCENT_SWATCHES: { name: string; value: string }[] = [
  { name: 'Slate',    value: '#1f2937' },
  { name: 'Blue',     value: '#2563eb' },
  { name: 'Teal',     value: '#0f766e' },
  { name: 'Violet',   value: '#7c3aed' },
  { name: 'Bronze',   value: '#8a6d3b' },
  { name: 'Rose',     value: '#be123c' },
  { name: 'Emerald',  value: '#047857' },
  { name: 'Charcoal', value: '#111111' },
];

interface TemplateDefault {
  accent: string;
  font: FontChoice;
  density: Density;
}

/** Native look of each template, used when the CV hasn't overridden a value. */
export const TEMPLATE_DEFAULTS: Record<TemplateId, TemplateDefault> = {
  CLASSIC:   { accent: '#1f2937', font: 'sans',  density: 'normal' },
  MODERN:    { accent: '#0f172a', font: 'sans',  density: 'normal' },
  ATS:       { accent: '#000000', font: 'sans',  density: 'normal' },
  PRO:       { accent: '#111111', font: 'sans',  density: 'compact' },
  MINIMAL:   { accent: '#0a0a0a', font: 'serif', density: 'relaxed' },
  EXECUTIVE: { accent: '#8a6d3b', font: 'serif', density: 'normal' },
  TECH:      { accent: '#2563eb', font: 'sans',  density: 'normal' },
  GRADUATE:  { accent: '#0f766e', font: 'sans',  density: 'normal' },
  SIDEBAR:   { accent: '#1e3a5f', font: 'sans',  density: 'normal' },
  COMPACT:   { accent: '#0f172a', font: 'sans',  density: 'compact' },
  TIMELINE:  { accent: '#0891b2', font: 'sans',  density: 'normal' },
  AURORA:    { accent: '#7c3aed', font: 'sans',  density: 'normal' },
  POLISHED:  { accent: '#0e7490', font: 'serif', density: 'normal' },
};

const DENSITY_PROFILE: Record<Density, { lineHeight: number; pad: number; gap: number }> = {
  compact: { lineHeight: 1.4,  pad: 0.82, gap: 0.8 },
  normal:  { lineHeight: 1.5,  pad: 1.0,  gap: 1.0 },
  relaxed: { lineHeight: 1.62, pad: 1.18, gap: 1.2 },
};

export interface ResolvedCustomization {
  accent: string;
  /** ~8% tint of the accent for soft backgrounds (valid on 6-digit hex). */
  accentTint: string;
  /** ~16% tint, for borders / chips. */
  accentTintStrong: string;
  font: FontChoice;
  fontStack: string;
  density: Density;
  lineHeight: number;
  /** multiply a template's base page padding by this. */
  padScale: number;
  /** multiply a template's base section gap by this. */
  gapScale: number;
}

function hexTint(hex: string, alpha: number): string {
  // alpha 0..1 → 2-digit hex suffix; only valid for #RRGGBB inputs
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export function resolveCustomization(cv: Cv): ResolvedCustomization {
  const def = TEMPLATE_DEFAULTS[cv.templateId] ?? TEMPLATE_DEFAULTS.CLASSIC;
  const accent = cv.accentColor || def.accent;
  const font = (cv.fontFamily as FontChoice) || def.font;
  const density = (cv.density as Density) || def.density;
  const profile = DENSITY_PROFILE[density];

  return {
    accent,
    accentTint: hexTint(accent, 0.08),
    accentTintStrong: hexTint(accent, 0.16),
    font,
    fontStack: font === 'serif' ? SERIF_STACK : SANS_STACK,
    density,
    lineHeight: profile.lineHeight,
    padScale: profile.pad,
    gapScale: profile.gap,
  };
}

# CV Builder — Template & UX Improvement Plan

> **For Claude Code CLI.**
> Work through each phase in order. Complete and verify each phase before moving to the next.
> Do NOT change backend API calls, type definitions, or store logic at any point.

---

## Current State Summary

| File | Current Problem |
|------|----------------|
| `ProTemplate.tsx` | Red `#990000` section headers, ALL CAPS text, `font-serif` body — feels dated |
| `ModernTemplate.tsx` | Blue/purple gradient header, hardcoded blue gradient — not neutral or professional |
| `ClassicTemplate.tsx` | Already two-column but uses `Helvetica` system font, no Google Fonts |
| `AtsTemplate.tsx` | Correct intent (ATS-clean) but ALL CAPS headers — defeats ATS parsing |
| `CvPreview.tsx` | No page break indicator line, no page count badge in the workspace |
| `index.ts` | Only exports 4 templates — no room for new ones yet |

---

## Phase 1 — Fix Existing Templates (Typography + Colour)

**Goal:** Make all 4 existing templates look professional and modern. No structural changes — only typography, colour, and spacing fixes.

---

### 1A. ProTemplate.tsx — Remove red, remove ALL CAPS

**File:** `src/templates/ProTemplate.tsx`

**Changes:**

1. Replace the `SectionHeader` component. Current code:
```tsx
const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-2 mt-5">
    <h2 className="text-[14px] font-bold text-[#990000] tracking-wider uppercase mb-0.5">
      {title}
    </h2>
    <div className="h-[0.5px] bg-[#990000]/30 w-full" />
  </div>
);
```

Replace with:
```tsx
const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-2 mt-5">
    <h2 className="text-[11px] font-bold text-[#111111] tracking-[0.12em] uppercase mb-1.5">
      {title}
    </h2>
    <div className="h-px bg-[#111111] w-full" />
  </div>
);
```

2. In the root container div, change `font-serif` to `font-sans`:
```tsx
// Before
<div className="w-[210mm] min-h-[297mm] bg-white text-[#111111] p-14 font-serif mx-auto overflow-hidden">

// After
<div className="w-[210mm] min-h-[297mm] bg-white text-[#111111] p-[45px] font-sans mx-auto overflow-hidden">
```

3. In the header, remove the red `|` separators. Replace:
```tsx
{personalInfo.phone && <span className="text-[#990000]">|</span>}
// (and all other red | separators)
```
With:
```tsx
{personalInfo.phone && <span className="text-[#999999] mx-0.5">·</span>}
```
Apply this to all 3 separator spans in the header contact row.

4. In the header `<h1>`, change font size from `text-[30px]` to `text-[26px]` for better proportions with the new sans font.

**Expected result:** Clean black-and-white academic/professional template. No red anywhere. Uses neutral dark headers with thin rule. Body text in sans-serif for better screen rendering.

---

### 1B. ModernTemplate.tsx — Remove gradient header, use neutral dark header

**File:** `src/templates/ModernTemplate.tsx`

The blue gradient header (`linear-gradient(to right, #2563eb, #6366f1)`) and the orange accent bar look like a 2019 Dribbble shot, not a 2026 professional CV.

**Changes:**

1. Replace the `header` style:
```ts
// Before
header: {
  background: 'linear-gradient(to right, #2563eb, #6366f1)',
  padding: '37px 45px',
} as React.CSSProperties,
```
With:
```ts
header: {
  backgroundColor: '#0f172a',
  padding: '37px 45px',
} as React.CSSProperties,
```

2. Remove the `accentBar` entirely. Delete:
```tsx
<div style={styles.accentBar} />
```
And remove the `accentBar` style definition from the `styles` object.

3. Change contact link colour from `#dbeafe` to `#94a3b8` (readable on dark background, not neon blue):
```ts
// In contact style
contact: {
  fontSize: '11px',
  color: '#94a3b8',   // was #dbeafe
  ...
}
```
And in the JSX for LinkedIn/GitHub links:
```tsx
style={{ color: '#94a3b8', textDecoration: 'none', wordBreak: 'break-all' }}
```

4. Update `sectionTitle` — remove the blue underline border, use a cleaner left-accent approach:
```ts
sectionTitle: {
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  borderBottom: '1.5px solid #0f172a',
  paddingBottom: '4px',
  marginBottom: '12px',
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
} as React.CSSProperties,
```

5. Remove the coloured dots (`styles.dot`) from section titles. The dot was used as a visual accent before the section title text. Delete these from each section's `<h2>`:
```tsx
// Remove this from all section titles:
<span style={{ ...styles.dot, backgroundColor: '#3b82f6' }} />
```

6. Update Education section title colour — it currently has `color: '#92400e'` (brown). Change to match other sections: remove the custom color override so it inherits `sectionTitle` style.

7. Change `expCard`, `eduCard`, `projectCard` border from `#f1f5f9` to `#e2e8f0` for slightly more visible card separation:
```ts
border: '1px solid #e2e8f0',
```

**Expected result:** Dark charcoal header, clean white body, consistent black section titles. Feels like a Bloomberg or McKinsey-style modern template — not a SaaS product landing page.

---

### 1C. AtsTemplate.tsx — Fix ALL CAPS section titles

**File:** `src/templates/AtsTemplate.tsx`

ATS (Applicant Tracking System) parsers actually struggle with ALL CAPS headings. The intent of this template is machine-readability — keeping ALL CAPS is counterproductive to the template's own purpose.

**Change:**

In `styles.sectionTitle`, remove `textTransform: 'uppercase'` and `letterSpacing`:
```ts
sectionTitle: {
  fontSize: '13px',
  fontWeight: 'bold' as const,
  borderBottom: '1px solid #000000',
  paddingBottom: '4px',
  marginTop: '18px',
  marginBottom: '8px',
  // Remove: textTransform: 'uppercase'
  // Remove: letterSpacing: '0.05em'
} as React.CSSProperties,
```

**Expected result:** Section titles read as "Professional Summary", "Work Experience", "Education" — standard casing that ATS parsers handle correctly. The template's visual style (plain black borders, system fonts) stays the same.

---

### 1D. ClassicTemplate.tsx — Minor refinements

**File:** `src/templates/ClassicTemplate.tsx`

ClassicTemplate is the best-designed of the 4 already. Minor fixes only.

**Changes:**

1. Remove `textTransform: 'uppercase'` from `sectionTitle` style — same reasoning as ATS:
```ts
sectionTitle: {
  fontSize: '13px',
  fontWeight: 'bold' as const,
  color: '#2d3748',
  borderBottom: '1px solid #cbd5e0',
  paddingBottom: '3px',
  marginBottom: '10px',
  marginTop: '20px',
  // Remove: textTransform: 'uppercase'
  // Remove: letterSpacing: '0.05em'
} as React.CSSProperties,
```

2. The sidebar background `#f7fafc` is fine. Keep it.

3. In the `name` style, change letter spacing from `-0.025em` to `0` for cleaner rendering at smaller print sizes:
```ts
name: {
  fontSize: '26px',
  fontWeight: 'bold' as const,
  marginBottom: '5px',
  color: '#1a202c',
  // Remove: letterSpacing: '-0.025em'
} as React.CSSProperties,
```

---

## Phase 2 — Add Page Break Indicator to CvPreview

**Goal:** Show a visual dashed line in the preview exactly where page 1 ends and page 2 begins. Prevents users from discovering mid-sentence cuts only at export time.

**File:** `src/templates/CvPreview.tsx`

**Changes:**

In `MultiPagePreview`, the component already knows `totalHeight` and `PAGE_HEIGHT = 1123`. Use this to render page break overlay lines.

Add a `pageBreakLines` calculation and render them as absolute-positioned divs over the preview:

```tsx
export function MultiPagePreview({ cv }: MultiPagePreviewProps) {
  const [page, setPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(PAGE_HEIGHT);

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) {
        setTotalHeight(measureRef.current.scrollHeight);
      }
    };
    const observer = new ResizeObserver(measure);
    if (measureRef.current) observer.observe(measureRef.current);
    requestAnimationFrame(measure);
    return () => observer.disconnect();
  }, [cv]);

  const pageCount = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));
  const offsetY = page * PAGE_HEIGHT;

  // Page break lines: positions within the current viewport where a page ends
  // A break occurs every PAGE_HEIGHT px in absolute content coordinates.
  // Relative to current page viewport: breakY - offsetY
  const pageBreakLines = Array.from({ length: pageCount - 1 }, (_, i) => {
    const absoluteBreakY = (i + 1) * PAGE_HEIGHT;
    const relativeBreakY = absoluteBreakY - offsetY;
    return relativeBreakY;
  }).filter(y => y > 0 && y < PAGE_HEIGHT);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, overflow: 'hidden' }}
      >
        <div
          className="absolute left-0 right-0"
          style={{ top: `${-offsetY}px` }}
        >
          <div ref={measureRef}>
            <CvPreview cv={cv} containerStyle={{ width: `${PAGE_WIDTH}px` }} />
          </div>
        </div>

        {/* Page break indicator lines */}
        {pageBreakLines.map((y) => (
          <div
            key={y}
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: `${y}px` }}
          >
            {/* Dashed red line */}
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 6px, transparent 6px, transparent 12px)',
              }}
            />
            {/* Label badge */}
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '-10px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: '600',
                padding: '1px 6px',
                borderRadius: '3px',
                letterSpacing: '0.04em',
                pointerEvents: 'none',
              }}
            >
              PAGE BREAK
            </div>
          </div>
        ))}
      </div>

      {/* Page navigation */}
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-mono text-text-dim">
            {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {pageCount > 1 && (
        <p className="text-xs font-mono text-amber-500">
          Content spans {pageCount} pages
        </p>
      )}
    </div>
  );
}
```

---

## Phase 3 — Add Page Count Badge to CvEditor Top Bar

**Goal:** Show "1 page" or "2 pages ⚠" in the preview panel header so users see page count without scrolling. This data is already calculated in `MultiPagePreview` — it just needs to be surfaced.

**Files:** `src/templates/CvPreview.tsx` and `src/components/CvEditor.tsx`

### Step 3A — Export pageCount from MultiPagePreview

Modify `MultiPagePreview` to accept an optional `onPageCountChange` callback:

```tsx
interface MultiPagePreviewProps {
  cv: Cv;
  onPageCountChange?: (count: number) => void;  // ADD THIS
}

export function MultiPagePreview({ cv, onPageCountChange }: MultiPagePreviewProps) {
  // ... existing code ...
  const pageCount = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));

  // ADD THIS: notify parent when pageCount changes
  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  // ... rest of existing code unchanged ...
}
```

### Step 3B — Consume pageCount in CvEditor

In `CvEditor.tsx`:

1. Add state near the other useState declarations:
```tsx
const [pageCount, setPageCount] = useState<number>(1);
```

2. Pass the callback to `MultiPagePreview`:
```tsx
<MultiPagePreview cv={previewCv} onPageCountChange={setPageCount} />
```

3. In the preview top bar (the `h-[44px]` div in the right panel), add the page count badge next to the existing zoom controls. Find this section:
```tsx
<span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1e1e1e] text-gray-500 dark:text-[#666]">
  {formData.templateId}
</span>
```

Add this badge BEFORE the template badge span:
```tsx
{/* Page count badge */}
<span className={`text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-md ${
  pageCount > 1
    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
    : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-500 dark:text-[#666]'
}`}>
  {pageCount === 1 ? '1 page' : `${pageCount} pages ⚠`}
</span>
```

---

## Phase 4 — Add a New "Minimal" Template

**Goal:** Add a 5th template that is a clean, typographically refined single-column layout. This fills the gap between the dense ATS template and the formatted Pro/Classic templates. Inspired by the aesthetic of Notion documents — generous whitespace, strong name, subtle dividers, no colour.

**Files to create/modify:**
- Create: `src/templates/MinimalTemplate.tsx`
- Modify: `src/templates/index.ts`
- Modify: `src/templates/CvPreview.tsx`
- Modify: `src/components/CvEditor.tsx` (TEMPLATES array)
- Modify: Backend `TemplateId` type if it is an enum — add `'MINIMAL'`

### Step 4A — Create MinimalTemplate.tsx

Create `src/templates/MinimalTemplate.tsx`:

```tsx
import type { Cv, SectionId } from '../types/cv';
import { normalizeSectionOrder } from '../types/cv';
import { preventHyphenLineBreaks } from './richTextUtils';

interface MinimalTemplateProps {
  cv: Cv;
  containerClass?: string;
  containerStyle?: React.CSSProperties;
}

const styles = {
  container: {
    width: '794px',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '12px',
    lineHeight: '1.6',
    padding: '64px 72px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  } as React.CSSProperties,
  tagline: {
    fontSize: '11px',
    color: '#666666',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: '0.02em',
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '0px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1.5px solid #0a0a0a',
  } as React.CSSProperties,
  contactSep: {
    margin: '0 10px',
    color: '#cccccc',
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    color: '#888888',
    marginBottom: '12px',
    marginTop: '28px',
  } as React.CSSProperties,
  expRole: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0a0a0a',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  } as React.CSSProperties,
  expMeta: {
    fontSize: '11px',
    color: '#555555',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    marginBottom: '6px',
    marginTop: '1px',
  } as React.CSSProperties,
  richText: {
    fontSize: '12px',
    lineHeight: '1.65',
    color: '#333333',
  } as React.CSSProperties,
  divider: {
    height: '0.5px',
    backgroundColor: '#e5e5e5',
    margin: '14px 0',
  } as React.CSSProperties,
  skillItem: {
    display: 'inline-block' as const,
    fontSize: '11px',
    color: '#333333',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    marginRight: '16px',
    marginBottom: '4px',
  } as React.CSSProperties,
};

const toExternalUrl = (v: string) => /^https?:\/\//i.test(v) ? v : `https://${v}`;
const toDisplayUrl = (v: string) => v.replace(/^https?:\/\//i, '');

export function MinimalTemplate({ cv, containerClass = '', containerStyle = {} }: MinimalTemplateProps) {
  const { personalInfo, experiences, educations, skills, projects } = cv;

  const contactParts: { label: string; href?: string }[] = [
    personalInfo.email   ? { label: personalInfo.email } : null,
    personalInfo.phone   ? { label: personalInfo.phone } : null,
    personalInfo.location ? { label: personalInfo.location } : null,
    personalInfo.linkedinUrl ? { label: toDisplayUrl(personalInfo.linkedinUrl), href: toExternalUrl(personalInfo.linkedinUrl) } : null,
    personalInfo.githubUrl   ? { label: toDisplayUrl(personalInfo.githubUrl),   href: toExternalUrl(personalInfo.githubUrl) } : null,
  ].filter((x): x is { label: string; href?: string } => x !== null);

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'personal':
        return personalInfo.summary ? (
          <section key="personal">
            <p style={styles.sectionTitle}>Profile</p>
            <div
              className="cv-rich-text"
              style={styles.richText}
              dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(personalInfo.summary) }}
            />
          </section>
        ) : null;

      case 'experience':
        return experiences.length > 0 ? (
          <section key="experience">
            <p style={styles.sectionTitle}>Experience</p>
            {experiences.map((exp, i) => (
              <div key={exp.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{exp.role}</span>
                  <span style={{ ...styles.expMeta, marginBottom: 0 }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <p style={styles.expMeta}>{exp.company}</p>
                <div
                  className="cv-rich-text"
                  style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(exp.description) }}
                />
              </div>
            ))}
          </section>
        ) : null;

      case 'education':
        return educations.length > 0 ? (
          <section key="education">
            <p style={styles.sectionTitle}>Education</p>
            {educations.map((edu, i) => (
              <div key={edu.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{edu.institution}</span>
                  <span style={{ ...styles.expMeta, marginBottom: 0 }}>{edu.graduationYear}</span>
                </div>
                <p style={styles.expMeta}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
              </div>
            ))}
          </section>
        ) : null;

      case 'skills':
        return skills.length > 0 ? (
          <section key="skills">
            <p style={styles.sectionTitle}>Skills</p>
            <div>
              {skills.map((s) => (
                <span key={s.id} style={styles.skillItem}>
                  {s.name}{s.level ? ` · ${s.level}` : ''}
                </span>
              ))}
            </div>
          </section>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <section key="projects">
            <p style={styles.sectionTitle}>Projects</p>
            {projects.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div style={styles.divider} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.expRole}>{p.name}</span>
                  {p.url && (
                    <a href={toExternalUrl(p.url)} target="_blank" rel="noreferrer"
                      style={{ ...styles.expMeta, marginBottom: 0, color: '#555', textDecoration: 'none', fontSize: '10px' }}>
                      {toDisplayUrl(p.url)}
                    </a>
                  )}
                </div>
                <div
                  className="cv-rich-text"
                  style={styles.richText}
                  dangerouslySetInnerHTML={{ __html: preventHyphenLineBreaks(p.description) }}
                />
              </div>
            ))}
          </section>
        ) : null;

      default:
        return null;
    }
  };

  const orderedSections = normalizeSectionOrder(cv.sectionOrder);

  return (
    <div className={containerClass} style={{ ...styles.container, ...containerStyle }}>
      <header>
        <h1 style={styles.name}>{personalInfo.name || 'Your Name'}</h1>
        <div style={styles.tagline}>
          {contactParts.map((item, i) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={styles.contactSep}>·</span>}
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" style={{ color: '#666666', textDecoration: 'none' }}>
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </header>

      {orderedSections.map(renderSection)}
    </div>
  );
}
```

### Step 4B — Register in index.ts

In `src/templates/index.ts`, add:
```ts
export { MinimalTemplate } from './MinimalTemplate';
```

### Step 4C — Register in CvPreview.tsx

In the `CvPreview` switch statement, add:
```tsx
import { ClassicTemplate, ModernTemplate, AtsTemplate, ProTemplate, MinimalTemplate } from './index';

// In switch:
case 'MINIMAL':
  return <MinimalTemplate cv={cv} containerClass={containerClass} containerStyle={containerStyle} />;
```

### Step 4D — Register in CvEditor.tsx

In the `TEMPLATES` array in `CvEditor.tsx`:
```tsx
const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'CLASSIC',  label: 'Classic',  desc: 'Two-column' },
  { id: 'MODERN',   label: 'Modern',   desc: 'Dark header' },
  { id: 'ATS',      label: 'ATS',      desc: 'Bot-friendly' },
  { id: 'PRO',      label: 'Pro',      desc: 'Academic' },
  { id: 'MINIMAL',  label: 'Minimal',  desc: 'Clean & spare' },
];
```

### Step 4E — Add MINIMAL to backend TemplateId type

Find the `TemplateId` type (likely in `src/types/cv.ts`). It is either a union type or an enum. Add `'MINIMAL'` to it:

```ts
// If union type:
export type TemplateId = 'CLASSIC' | 'MODERN' | 'ATS' | 'PRO' | 'MINIMAL';

// If enum:
export enum TemplateId {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
  ATS = 'ATS',
  PRO = 'PRO',
  MINIMAL = 'MINIMAL',
}
```

**Note:** If `TemplateId` maps to a backend Java enum, also add `MINIMAL` to the Java enum in your Spring Boot backend before testing PDF export with the new template. The frontend will work immediately; PDF export will fail until the backend is updated.

---

## Phase 5 — Add "Fit to Panel" Zoom Button

**Goal:** Replace the manual `−` / `+` zoom controls with a smarter zoom that includes a "Fit" button. This auto-calculates the right zoom so the full CV page is visible without scrolling.

**File:** `src/components/CvEditor.tsx`

### Step 5A — Add fitZoom calculation

In `CvEditor.tsx`, add a `fitZoom` computed value near the other state:

```tsx
// PAGE_WIDTH is imported from CvPreview: import { MultiPagePreview, PAGE_WIDTH } from '../templates/CvPreview';
const previewPanelWidth = showPreview ? (window.innerWidth * (100 - leftWidth) / 100) - 48 : 0;
const fitZoom = previewPanelWidth > 0 ? Math.floor((previewPanelWidth / PAGE_WIDTH) * 100) : 75;
```

### Step 5B — Replace zoom controls in preview top bar

Find the zoom controls section in the preview top bar:
```tsx
<div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5">
  <button onClick={() => setPreviewZoom(p => Math.max(50, p - 10))} ...>−</button>
  <button onClick={() => setPreviewZoom(100)} ...>{previewZoom}%</button>
  <button onClick={() => setPreviewZoom(p => Math.min(150, p + 10))} ...>+</button>
</div>
```

Replace with:
```tsx
<div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5">
  <button
    onClick={() => setPreviewZoom(p => Math.max(40, p - 10))}
    disabled={previewZoom <= 40}
    className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-[#888] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all text-[14px] font-bold"
  >−</button>
  <button
    onClick={() => setPreviewZoom(100)}
    className="px-2 h-7 text-[11px] font-semibold font-mono text-gray-600 dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors min-w-[40px] text-center"
  >{previewZoom}%</button>
  <button
    onClick={() => setPreviewZoom(p => Math.min(150, p + 10))}
    disabled={previewZoom >= 150}
    className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-[#888] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all text-[14px] font-bold"
  >+</button>
  {/* Fit button */}
  <button
    onClick={() => setPreviewZoom(fitZoom)}
    className="px-2 h-7 text-[10px] font-semibold text-gray-500 dark:text-[#777] hover:text-[#111] dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all border-l border-gray-200 dark:border-[#3a3a3a] ml-0.5 pl-2"
    title="Fit page to panel"
  >Fit</button>
</div>
```

---

## Verification Checklist

After completing all phases, verify each item:

### Phase 1 — Template fixes
- [ ] Pro template: no red colour anywhere in the rendered output
- [ ] Pro template: section headers are not serif — body text is sans-serif
- [ ] Modern template: no blue/purple gradient in the header
- [ ] Modern template: header is dark (`#0f172a`), not blue
- [ ] ATS template: section headers render as "Professional Summary" not "PROFESSIONAL SUMMARY"
- [ ] Classic template: section headers render as "Experience" not "EXPERIENCE"

### Phase 2 — Page break indicator
- [ ] When CV content exceeds one page, a dashed red line appears in the preview at exactly y=1123px from the top of the content
- [ ] "PAGE BREAK" badge appears at the right edge of the line
- [ ] Line does NOT appear when content fits on one page

### Phase 3 — Page count badge
- [ ] Preview panel header shows "1 page" badge when content fits on one page
- [ ] Preview panel header shows "2 pages ⚠" badge (amber colour) when content overflows
- [ ] Badge updates reactively as user adds/removes content

### Phase 4 — Minimal template
- [ ] "Minimal" option appears in the template segmented control
- [ ] Switching to Minimal renders the new template in the preview
- [ ] All 5 sections (Personal, Experience, Education, Skills, Projects) render correctly
- [ ] No TypeScript errors related to TemplateId
- [ ] Template looks clean at 100% zoom — generous whitespace, strong name, subtle section labels

### Phase 5 — Fit zoom button
- [ ] "Fit" button appears in zoom controls
- [ ] Clicking "Fit" sets zoom so the full CV width is visible without horizontal scroll
- [ ] Existing −/+ buttons and % display still work correctly

---

## Notes for Claude Code

- Work through phases sequentially — do not skip ahead
- After each phase, check for TypeScript compile errors before continuing
- Do not modify `richTextUtils.ts`, `sectionOrder.ts`, `pdfStyles.ts`, or any type files except to add `MINIMAL` to `TemplateId`
- Do not change any backend API calls or Zustand store logic
- The `preventHyphenLineBreaks` import is required in every template file — do not remove it
- `containerClass` and `containerStyle` props must be passed through on all templates for the PDF export pipeline to work correctly

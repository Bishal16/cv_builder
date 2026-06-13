# CV Builder — Brutally Honest Product Audit

> Audit date: 2026-06-13 · Reviewer perspective: startup CTO, senior engineer, product designer, paying customer, recruiter.
> Scope reviewed: frontend (`/frontend`), backend (`/backend`), templates, auth, PDF pipeline, deployment posture.
> Verdict in one line: **A genuinely strong side-project that is being marketed as a product it is not yet. The engineering core is better than average; the honesty, scale, and "last 20%" are not there.**

---

## 1. Executive Summary

CV Builder has a **surprisingly solid foundation** — a real Spring Boot + PostgreSQL backend with Flyway migrations, JWT + OAuth2 (Google/GitHub), Bean Validation, a clean Zustand/React editor with live preview, drag-to-reorder sections, page-overflow detection, and 8 hand-built templates that render to PDF via headless Chromium (so the PDF is pixel-identical to the preview — a genuinely smart architecture).

But it is **not publishable as a paid product today**, for three categories of reasons:

1. **The marketing lies.** The landing page sells AI suggestions, ATS scoring ("98 / Passes 12 of 12 checks"), DOCX export, LinkedIn Easy Apply, private share links, and "auto-save." **None of these exist in the code.** Only PDF export and manual Ctrl+S save are real. A paying customer discovers this in the first 90 seconds and never trusts you again.
2. **It cannot scale or deploy.** The PDF service launches a brand-new Chromium browser **on every single request**. CORS and OAuth redirect URLs are hard-coded to `localhost`. There are **no application Dockerfiles, no CI, and zero tests** in the entire repo.
3. **There is no product surface beyond "fill a form, get a PDF."** No onboarding, no resume import, no content help, no real ATS feedback — which is exactly the value competitors charge for.

**The good news:** none of this is architectural rot. The hard parts (data model, auth, template/PDF fidelity) are done well. The gaps are additive features and productionization, not rewrites.

---

## 2. Brutally Honest Assessment

**What a paying customer thinks in their first session:**

- *"The landing page promised AI help and an ATS score. Where is it?"* → trust gone.
- *"It says Auto-saved but I just lost edits because I didn't hit Save."* → the dashboard chip and landing hero both say "Auto-saved," but `CvEditor.tsx` only saves on Ctrl+S / explicit Save. **This is a data-loss bug dressed as a feature.**
- *"I have to retype my entire CV from scratch."* → no import from PDF/LinkedIn/JSON. Competitors let you upload an existing resume and auto-parse it.
- *"On my phone this is unusable."* → the editor is a fixed desktop split-pane driven by `window.innerWidth` math; it has no mobile layout.

**What a recruiter/ATS thinks of the output:**

- The `ATS` template is actually correct — single column, Arial, real selectable text, comma-joined skills. Good.
- But several "pretty" templates (Classic, Tech, Executive) are **two-column** with sidebars. Real-world ATS parsers (Workday, Greenhouse, Taleo) frequently mangle multi-column layouts — text gets read in the wrong order. You market all 8 as safe; they are not. There's no warning telling the user which templates are ATS-risky.

**What a senior engineer thinks of the code:**

- Backend: clean, idiomatic, properly layered. `open-in-view=false`, `ddl-auto=validate`, externalized secrets, `@Valid` everywhere. Above side-project average.
- Frontend: well-structured, but **every component is styled with inline-style objects and hard-coded hex colors** (`#F97316` appears dozens of times across files). No design-token system. This is maintainable at 20 components, painful at 100.
- **Zero tests.** `spring-boot-starter-test` is in the pom and `skills/testing.md` exists, but there is not a single `*Test.java` or `*.test.tsx`. For something handling auth and user data, this is a red flag.

---

## 3. Missing Features Checklist

### 🔴 Must-have before any paid launch
- [ ] **Real auto-save** (debounced, with conflict handling) — OR remove every "Auto-saved" claim from UI. Right now it is false.
- [ ] **Resume import / parse** (upload existing PDF/DOCX → prefill). The #1 reason users abandon "from scratch" builders.
- [ ] **Honest landing page** — strip or build AI/ATS/DOCX/LinkedIn/share claims. Shipping marketing for non-existent features is the single biggest credibility killer here.
- [ ] **DOCX export** — you advertise it twice on the landing page; it does not exist (only `PdfController`/`exportPdf`). Build it or delete the claim.
- [ ] **ATS-safety labeling** per template (single-column = "ATS-safe", two-column = "Design — may not parse").
- [ ] **Mobile-responsive editor** (or an explicit "best on desktop" gate). Currently broken on phones.
- [ ] **Password reset / forgot-password flow** — the UI has a dead "Forgot password?" link; there is no backend for it.
- [ ] **Email verification** on signup.

### 🟠 Important (needed to compete)
- [ ] **Real ATS score** computed from content (keyword density, section presence, length, contact completeness, action verbs). You already fake "98/100" visually — make it real; it's your most marketable feature.
- [ ] **AI content suggestions** (bullet rewrite, summary generation, "improve this") via Claude API — you already build on the latest Claude models elsewhere.
- [ ] **Job-description tailoring** — paste a JD, get keyword gap analysis + tailored bullet suggestions. This is the premium feature users actually pay for at Enhancv/Teal.
- [ ] **Cover letter generator** tied to the resume.
- [ ] **Resume versions / variants** ("Resume for Google", "Resume for startups") from one master profile.
- [ ] **Spellcheck / grammar** pass.
- [ ] **Section-level content templates** (pre-written bullet examples per role).

### 🟡 Nice-to-have
- [ ] Public share link (`/r/:slug`) with view tracking.
- [ ] LinkedIn import (OAuth scope or profile-URL scrape).
- [ ] Multi-language resumes.
- [ ] More section types: Certifications, Awards, Languages, Publications, Volunteering (currently only 5 fixed sections).
- [ ] Custom fonts / accent-color picker per resume.
- [ ] Resume analytics (views, downloads).

### 💎 Premium / monetizable
- AI rewrite credits · JD tailoring · ATS deep-scan report · unlimited resumes (free tier = 1–2) · DOCX + share links · cover letters · priority PDF rendering.

---

## 4. UI/UX Problems (specific)

| # | Problem | Where | Fix |
|---|---------|-------|-----|
| 1 | **"Auto-saved" is a lie** — implies autosave, but save is manual | `CvEditor.tsx`, dashboard chip, landing hero | Implement debounced autosave (save 1.5s after last keystroke) or relabel to "Saved" + keep explicit Save |
| 2 | **No onboarding / first-run** — new user lands on an empty form with no guidance | `CvEditor` empty state | Add a 3-step intro, "start from sample," or import flow |
| 3 | **No empty content states inside sections** — empty Experience just shows a bare "Add" | section lists | Add illustrative empty states + example prompts |
| 4 | **Inline styles + hard-coded hex everywhere** — no token system | all components | Extract a `theme.ts` / Tailwind theme; replace `#F97316` literal (used 30+ times) with `--brand` |
| 5 | **Accessibility is thin** — icon-only buttons without `aria-label`, custom selects, drag-drop with no keyboard path | editor, dashboard | Add ARIA labels, focus rings, keyboard reordering |
| 6 | **Forgot-password link goes nowhere** | `AuthScreen.tsx` | Wire it or remove it |
| 7 | **Marketing logos imply customers** ("Hired at Atlassian, Shopify…") with no basis | landing, auth | Remove or replace with honest social proof |
| 8 | **Dark-mode regressions slip in** (you just hit the warm-bg bug) because styling is ad-hoc | global | Token system + a dark-mode visual check would prevent these |
| 9 | **No edit history / undo** beyond browser | editor | Add undo stack or version snapshots |
| 10 | **PDF export is the only output** but the button copy promises more | editor top bar | Align copy with reality |

---

## 5. Template Problems

**General:**
- 8 templates, but **layout diversity is mostly cosmetic** (color/header changes). Missing genuinely different *information architectures* (e.g., skills-matrix, project-led, academic CV with publications).
- **No ATS-risk indication.** Two-column templates (Classic/Tech/Executive) can break ATS parsing; you market all as ATS-friendly.
- **No content-overflow handling per template** beyond a global page-count warning — long bullet lists can collide with section spacing.
- **Skills have a `level` field** (`Expert`, etc.) but ATS template flattens to comma list, discarding it — inconsistent data usage across templates.

**Specific:**
- `AtsTemplate` — solid, but centered header + `|`-separated contact line is slightly parser-risky; left-align for max ATS safety.
- Hyperlinks (`<a>`) in templates render as styled text in PDF — verify they remain clickable + that the visible text is the URL (recruiters print/scan).
- No template has **Certifications / Languages / Awards** because the data model doesn't support them — a real gap for many industries (finance, academia, nursing, government).

**Missing categories / industry templates:** Academic/CV (publications, grants), Creative/Design (portfolio links), Nursing/Healthcare, Federal/Government (very specific format), Sales (metrics-forward), Career-changer.

---

## 6. Technical Problems

### 🔴 Critical (block production)
1. **PDF service does not scale.** `PdfService.generatePdf()` calls `Playwright.create()` + `chromium().launch()` **per request** (~1–3s cold start, ~150–250MB RAM each). 5 concurrent exports can OOM a small box. → **Pool a single long-lived browser**, reuse contexts, add a concurrency-limited queue, and consider a dedicated render worker.
2. **PDF generation depends on a reachable, deployed frontend.** The backend navigates headless Chromium to the frontend print URL with an injected JWT. If the frontend is down or the URL is misconfigured, exports fail. Fragile cross-service coupling.
3. **CORS origin hard-coded** to `http://localhost:5173` in `SecurityConfig.java`. Breaks in prod. → env-driven allowed origins.
4. **OAuth redirect URIs hard-coded** to `localhost:8081` in `application.properties`. OAuth is broken the moment you deploy.
5. **No deployment artifacts.** `docker-compose.yml` only runs Postgres. No backend Dockerfile, no frontend build/serve image, no reverse-proxy config, no CI/CD.
6. **Zero automated tests.** Auth, ownership scoping, and the mapper are exactly the code you must not break silently.

### 🟠 Important
7. **JWT stored in `localStorage`** (`authStore` persist key `auth-storage`) → stealable via any XSS. Templates use `dangerouslySetInnerHTML` on user HTML (rich text) — **XSS surface is real**. → sanitize rich-text server-side (e.g., OWASP Java HTML Sanitizer) AND move to httpOnly cookie or accept the risk consciously.
8. **No rate limiting** on `/auth/login` / `/register` → brute-force + credential-stuffing open. → Bucket4j or gateway throttling.
9. **No refresh tokens** — single 24h JWT; logout can't truly revoke. 
10. **No password reset / email verification** backend at all.
11. **No observability** — `show-sql` logging in dev, but no structured logging, metrics, error tracking (Sentry), or health/readiness beyond DB healthcheck.
12. **Frontend bundle is one 678KB JS chunk** (gzip 193KB) — no code-splitting; `react-quill`, all 8 templates, and Playwright-target print view all load up front.

### 🟡 Minor
13. Inline styles hurt caching and theming; no shared token layer.
14. `dangerouslySetInnerHTML` + ad-hoc hyphen-break utilities are brittle.
15. No SEO/meta/OpenGraph/sitemap on the public landing route (matters for a self-serve SaaS).

---

## 7. Publishability Score: **4 / 10**

> As a **free public beta**: ~6/10 — usable, the core loop works, people would try it.
> As a **paid product today**: **4/10**. The false feature claims, manual-save-masquerading-as-autosave, no deployment story, and single-instance PDF make it feel like a polished prototype, not a product. Fix the honesty + deployment + autosave and this jumps to ~7.

**What makes it feel amateur right now:** marketing features that don't exist; "Auto-saved" that isn't; fake company logos; dead links; no tests; no onboarding; localhost-coded config.

**What already feels professional:** the editor UX, live preview fidelity, the PDF-from-real-template architecture, the backend layering and auth.

---

## 8. Market Readiness Score: **3 / 10**

Against Resume.io / Zety / Novorésumé / Enhancv / Teal:

| Capability | Competitors | CV Builder |
|---|---|---|
| Resume import / parse | ✅ | ❌ |
| AI content / rewrite | ✅ | ❌ (advertised, absent) |
| Real ATS score vs JD | ✅ | ❌ (faked visually) |
| Cover letters | ✅ | ❌ |
| DOCX export | ✅ | ❌ (advertised, absent) |
| Templates | 20–40 | 8 |
| Onboarding | guided | none |
| Mobile | yes | no |
| Trust (reviews, honest copy) | yes | undermined by false claims |

**Minimum bar to compete:** real ATS scoring + AI bullet help + resume import + honest marketing + DOCX. Without at least ATS + import + AI, there is no reason to choose this over an incumbent.

---

## 9. Priority Roadmap (Phase 1 → 5)

### Phase 1 — Stop lying & stop losing data (1–2 weeks) — *trust + correctness*
- Implement **debounced autosave** in `CvEditor` (or relabel everything to manual "Save").
- **Rewrite the landing/auth copy** to match reality; remove AI/ATS/DOCX/LinkedIn/share/fake-logos until built.
- Wire or remove **Forgot password**.
- Add **basic tests**: auth flow, CV ownership scoping (`findByIdAndUser`), `CvMapper` round-trip.

### Phase 2 — Make it deployable & safe (2–3 weeks) — *productionize*
- **Browser pooling + render queue** in `PdfService` (one persistent Chromium, bounded concurrency).
- **Env-driven CORS + OAuth redirect URIs**; remove all `localhost` hard-codes.
- **Dockerfiles** (backend, frontend-nginx) + full `docker-compose` + a CI pipeline (build, test, lint).
- **Rate limiting** on auth; **server-side HTML sanitization** of rich text.
- **Password reset + email verification.**
- Error tracking (Sentry) + structured logs + `/actuator/health` readiness.

### Phase 3 — Become a real resume product (3–5 weeks) — *table stakes*
- **Resume import** (PDF/DOCX parse → prefill).
- **Real ATS score** engine (completeness, length, keywords, action verbs, contact, single-column check).
- **DOCX export.**
- **Mobile-responsive editor.**
- More sections (Certifications, Languages, Awards) + matching template support.

### Phase 4 — Differentiate with AI (3–4 weeks) — *USP + premium*
- **AI bullet rewrite / summary generation** (Claude).
- **JD tailoring**: paste job description → keyword gap + tailored suggestions + per-JD ATS score.
- **Cover letter generator.**
- Resume variants from one master profile.

### Phase 5 — Monetize & grow (ongoing)
- Free tier (1–2 resumes, PDF only) vs Pro (AI credits, JD tailoring, DOCX, share links, unlimited).
- Stripe billing + usage metering.
- Public share links + view analytics.
- SEO landing pages per role/industry; template gallery indexable.

---

## 10. Exact Implementation Recommendations

**Autosave (`CvEditor.tsx`):** add a `useEffect` watching `currentSnapshot`, debounced 1500ms, calling `updateCv(cvId, formData)`; reuse the existing `normalizeForSnapshot` verification; keep Ctrl+S as "save now." Drop the misleading chip or make it reflect real state.

**PDF pooling (`PdfService.java`):** move `Playwright`/`Browser` to a `@Bean`/`@PostConstruct` singleton with `@PreDestroy` cleanup; per request only `browser.newContext()`; guard concurrency with a `Semaphore` (e.g., 2–4 permits) and queue overflow. This alone changes export from ~2s/150MB each to ~300ms with bounded memory.

**Config (`SecurityConfig.java` + `application.properties`):** `configuration.setAllowedOrigins(List.of(env("CORS_ORIGINS").split(",")))`; move both OAuth `redirect-uri` values to `${OAUTH_*_REDIRECT_URI}`.

**XSS:** sanitize `summary`, `experience.description`, `project.description` server-side on save (OWASP Java HTML Sanitizer, allow only `b/i/u/ul/ol/li/p/br/a`). You already trust this HTML in `dangerouslySetInnerHTML` and inject it into PDF.

**Real ATS score:** compute server-side from existing data — weighted checks (contact present, summary length 250–600 chars, ≥1 experience with ≥2 bullets, action-verb ratio, skills count, single-column template, no images, word count 400–800). Return a breakdown so the "Passes X of Y checks" UI becomes real instead of decorative.

**Tests to write first:** `AuthService` register/login/duplicate; `CvService.findByIdAndUser` cross-user denial; `CvMapper` entity↔DTO with nested collections + ID preservation; a frontend test for `getCompletion`.

**DOCX:** add a `DocxService` (Apache POI / docx4j) producing a single-column document from the CV model — don't try to mirror every visual template; ship one clean ATS-grade DOCX.

---

### Bottom line
You have built the hard 60% well. What separates this from a payable product is not more engineering talent — it's **honesty (ship only what exists), productionization (pooling, config, Docker, tests), and three high-value features (import, real ATS, AI).** Do Phases 1–3 and you have a legitimately publishable freemium product; add Phase 4 and you have a reason for people to switch to you.

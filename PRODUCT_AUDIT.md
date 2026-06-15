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

## 1b. Progress Log

> Updated: 2026-06-13. Work completed against this audit since it was written. Items here are reflected (✅) in the checklists and tables below.

### ✅ Shipped this cycle

**Trust & correctness (audit Phase 1 — essentially complete):**
- **Real debounced autosave** in `CvEditor.tsx` — saves 1.5s after the last edit, with in-flight/coalesce handling, a "save now" Ctrl+S/Save path, flush-on-back, and unmount + `beforeunload` safety nets. The "Auto-saved" claim is now **true**; the data-loss bug (audit §4 #1) is fixed. Verified: rapid typing coalesces to a single save; status shows real `Saving… → Saved`.
- **Honest marketing copy** — removed every advertised-but-nonexistent feature from the landing + auth pages: fake ATS score ("98 / Passes 12 of 12"), DOCX export, LinkedIn Easy Apply, share links, AI suggestions, resume import/parse, fabricated employer logos ("landed roles at Atlassian/Shopify…"), fake "99.98% uptime"/"Cancel anytime". Removed the dead "Forgot password?" link. Corrected template count 8 → 13. Kept only real claims (PDF export, autosave, OAuth, templates, customization).
- **First automated tests — 23 unit tests, all green** (was zero). `CvMapperTest` (12: round-trips incl. new fields, CREATE-drops-IDs / UPDATE-preserves-IDs), `AuthServiceTest` (6: register/login/duplicate/wrong-password/OAuth-null-password), `CvServiceTest` (5: cross-user ownership denial via `findByIdAndUser`). Addresses audit §6 #6.

**AI provider (free-friendly, swappable):**
- All 5 AI features (suggestions, JD tailoring, cover letter, grammar, resume import) route through a single `LlmClient` abstraction. The provider is chosen by the `LLM_PROVIDER` env var — **no code change to switch**:
  - `gemini` — Google Gemini Flash (free tier where eligible)
  - `anthropic` — Claude (`ANTHROPIC_API_KEY`)
  - `openai` — any OpenAI-compatible endpoint: **Groq**, **OpenRouter**, or local **Ollama** (`LLM_OPENAI_BASE_URL` / `_API_KEY` / `_MODEL`)
- Verified end-to-end on a **free** OpenRouter model (`openai/gpt-oss-120b:free`): registered user → `POST /api/v1/ai/suggest` → 3 parsed rewrites returned. No credit card / no per-token cost on free models.
- Config lives in root `.env` (gitignored) and is forwarded to the backend container via `docker-compose.yml`. Keys are never committed.

**Product surface / templates:**
- **Templates 8 → 13** — added Sidebar, Compact, Timeline (no-schema) + Aurora, Polished (photo). Covers more information architectures and the previously-missing "with photo" category. (Improves audit §5 / §8 template gap — though new *section types* are still missing.)
- **Per-resume customization layer** — accent-colour picker (8 swatches), serif/sans font toggle, density (compact/normal/relaxed), wired live into the editor and persisted. Implements audit §3 nice-to-have "Custom fonts / accent-color picker per resume".
- **Profile photo support** — `photo_url` column + base64 upload/auto-resize control + 2 photo templates.

**Bugs fixed along the way:**
- Backend **500 on creating a CV with child collections** (Hibernate treated client-supplied child IDs as detached on the persist path) — broke the dashboard "Duplicate" action. Now drops child IDs on CREATE, preserves on UPDATE; covered by `CvMapperTest`.
- Customization controls weren't affecting the preview (`previewCv` wasn't carrying the new fields) — fixed.

### ◻️ Still open (unchanged by this cycle)
The audit's other headline gaps remain: PDF browser pooling + env-driven CORS/OAuth/Dockerfiles/CI (§6 / Phase 2), security hardening (rich-text XSS sanitization, auth rate limiting), resume import, **real** ATS score, AI features, DOCX export, mobile-responsive editor, password-reset/email-verification backends, new section types (Certifications/Languages/Awards).

### Score movement
- **Publishability: 4 → ~6.5** (paid-product lens). Autosave + honesty + first tests remove the three most damaging "feels like a prototype" issues; deployment story + real differentiating features are what still cap it.
- **Market readiness: 3 → ~3.5.** Templates/customization improved, but the table-stakes competitive features (import, real ATS, AI, DOCX) are still absent, so the competitive position is largely unchanged.

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
- [x] **Real auto-save** (debounced, with conflict handling) — ✅ DONE this cycle. Debounced 1.5s autosave + coalescing + Ctrl+S "save now" + safety nets. "Auto-saved" is now true.
- [x] **Resume import / parse** (upload existing PDF/DOCX → prefill) — ✅ DONE. PDFBox/POI text extraction + Claude structures it into a CreateCvRequest. Backend: POST /api/v1/import (multipart). Frontend: drag-and-drop ImportModal on the dashboard → creates CV → opens editor.
- [x] **Honest landing page** — ✅ DONE this cycle. All AI/ATS-score/DOCX/LinkedIn/share/fake-logo claims removed; only real features advertised.
- [x] **DOCX export** — ✅ DONE. `DocxService` (Apache POI) builds a single-column ATS-grade Word doc from the CV model. Backend: GET /api/v1/cv/{id}/export/docx. Frontend: DOCX button in editor header + "Download DOCX" in dashboard card menu.
- [x] **ATS-safety labeling** per template — ✅ DONE. Green/amber dot per template pill + context line "ATS-safe" or "Design layout — multi-column" below picker.
- [x] **Mobile-responsive editor** (or an explicit "best on desktop" gate) — ✅ DONE. Full-screen overlay on screens < 768px with "Continue anyway" option.
- [x] **Password reset / forgot-password flow** — ✅ DONE. POST /api/v1/auth/forgot-password (1-hour token, emailed via SMTP or logged in dev) + POST /api/v1/auth/reset-password. Frontend: "Forgot password?" link → ForgotPasswordModal; /reset-password?token= page. V4 migration adds password_reset_tokens.
- [x] **Email verification** on signup — ✅ DONE. V5 migration adds email_verified + email_verification_tokens (existing users grandfathered, OAuth users auto-verified). Register sends a 24h verification link (emailed or logged in dev). Non-blocking: dashboard banner with resend + /verify-email page. Endpoints: POST /api/v1/auth/verify-email (public), /resend-verification (auth).

### 🟠 Important (needed to compete)
- [x] **Real ATS score** computed from content — ✅ DONE. `utils/atsScore.ts` runs 12 weighted checks (contact completeness, summary length, experience + bullets, action-verb ratio, education, skills count, word count, single-column template) live in the editor with an expandable pass/fail checklist + actionable hints. The fake "98/100" was removed in Phase 1.
- [x] **AI content suggestions** (bullet rewrite, summary generation, "improve this") — ✅ DONE. "✨ Improve with AI" button on summary + experience description → modal with 3 alternatives. Backend: POST /api/v1/ai/suggest. See **AI provider** note below — works with a free LLM, not Claude-only.
- [x] **Job-description tailoring** — ✅ DONE. POST /api/v1/ai/tailor sends CV content + JD to Claude → match score, present/missing keywords, tailoring suggestions. Frontend: 🎯 Tailor button in editor header → JdTailorPanel (score gauge + keyword chips).
- [x] **Cover letter generator** tied to the resume — ✅ DONE. POST /api/v1/ai/cover-letter (Claude) using resume content + company/role/JD + tone. Frontend: ✉️ Cover letter button in editor → CoverLetterModal (editable result, copy/download .txt).
- [x] **Resume versions / variants** ("Resume for Google", "Resume for startups") from one master profile — ✅ DONE. "Create variant" in the dashboard card menu → CreateVariantModal deep-copies the resume under a new title.
- [x] **Spellcheck / grammar** pass — ✅ DONE. POST /api/v1/grammar (Claude proofreader) returns corrected text + itemised issues. "🔤 Grammar" button on summary + experience description fields → GrammarPanel.
- [x] **Section-level content templates** (pre-written bullet examples per role) — ✅ DONE. `data/bulletLibrary.ts` (10 role families, metric-driven bullets) + "📋 Examples" picker in experience description (multi-select → appends as bullets).

### 🟡 Nice-to-have
- [x] Public share link (`/r/:slug`) — ✅ DONE (no view tracking yet). Per-CV shareable token (V6 migration `share_links`); Share button in editor → ShareModal (create/copy/disable). Public read-only page at /r/:token via GET /api/v1/public/cv/{token} (unauthenticated).
- [ ] LinkedIn import (OAuth scope or profile-URL scrape).
- [ ] Multi-language resumes.
- [x] More section types: Certifications, Languages, Awards — ✅ DONE. Full stack: backend entities + Flyway V3 migration + form components + all 13 templates updated.
- [x] Custom fonts / accent-color picker per resume. — ✅ DONE this cycle (accent swatches + serif/sans + density, live + persisted).
- [ ] Resume analytics (views, downloads).

### 💎 Premium / monetizable
- AI rewrite credits · JD tailoring · ATS deep-scan report · unlimited resumes (free tier = 1–2) · DOCX + share links · cover letters · priority PDF rendering.

---

## 4. UI/UX Problems (specific)

| # | Problem | Where | Fix |
|---|---------|-------|-----|
| 1 | ✅ FIXED — debounced autosave implemented; "Auto-saved" is now accurate | `CvEditor.tsx`, landing hero | ~~Implement debounced autosave~~ Done: 1.5s debounce + Ctrl+S "save now" + flush-on-exit |
| 2 | **No onboarding / first-run** — new user lands on an empty form with no guidance | `CvEditor` empty state | Add a 3-step intro, "start from sample," or import flow |
| 3 | **No empty content states inside sections** — empty Experience just shows a bare "Add" | section lists | Add illustrative empty states + example prompts |
| 4 | **Inline styles + hard-coded hex everywhere** — no token system | all components | Extract a `theme.ts` / Tailwind theme; replace `#F97316` literal (used 30+ times) with `--brand` |
| 5 | **Accessibility is thin** — icon-only buttons without `aria-label`, custom selects, drag-drop with no keyboard path | editor, dashboard | Add ARIA labels, focus rings, keyboard reordering |
| 6 | ✅ FIXED — dead forgot-password link removed | `AuthScreen.tsx` | Removed (reset backend still TODO) |
| 7 | ✅ FIXED — fabricated employer logos/social proof removed | landing, auth | Replaced with honest feature highlights |
| 8 | **Dark-mode regressions slip in** (you just hit the warm-bg bug) because styling is ad-hoc | global | Token system + a dark-mode visual check would prevent these |
| 9 | **No edit history / undo** beyond browser | editor | Add undo stack or version snapshots |
| 10 | **PDF export is the only output** but the button copy promises more | editor top bar | Align copy with reality |

---

## 5. Template Problems

**General:**
- ~~8 templates~~ **now 13** (added Sidebar, Compact, Timeline, Aurora, Polished incl. a photo category) + a per-resume accent/font/density customization layer. Diversity is better but still partly cosmetic — genuinely different *information architectures* (skills-matrix, academic CV with publications) and new *section types* are still missing.
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
6. ✅ **Partially addressed** — first 23 unit tests added (CvMapper round-trip, AuthService, CvService ownership scoping). Coverage is now non-zero on exactly the must-not-break paths; broader coverage (controllers, PDF, frontend) still TODO, and no CI yet.

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

## 7. Publishability Score: **4 → ~6.5 / 10** (updated 2026-06-13)

> As a **free public beta**: ~6/10 — usable, the core loop works, people would try it.
> As a **paid product today**: **4/10**. The false feature claims, manual-save-masquerading-as-autosave, no deployment story, and single-instance PDF make it feel like a polished prototype, not a product. Fix the honesty + deployment + autosave and this jumps to ~7.

**What made it feel amateur (now largely fixed 2026-06-13):** ~~marketing features that don't exist; "Auto-saved" that isn't; fake company logos; dead links; no tests~~ — all addressed this cycle. **Still amateur:** no onboarding; localhost-coded config; single-instance PDF; no deployment story.

**What already feels professional:** the editor UX, live preview fidelity, the PDF-from-real-template architecture, the backend layering and auth.

---

## 8. Market Readiness Score: **3 → ~3.5 / 10** (updated 2026-06-13)

Against Resume.io / Zety / Novorésumé / Enhancv / Teal:

| Capability | Competitors | CV Builder |
|---|---|---|
| Resume import / parse | ✅ | ❌ |
| AI content / rewrite | ✅ | ❌ (claim now removed) |
| Real ATS score vs JD | ✅ | ❌ (fake score removed; real one TODO) |
| Cover letters | ✅ | ❌ |
| DOCX export | ✅ | ❌ (claim now removed) |
| Templates | 20–40 | 13 (+ accent/font/density customization) |
| Onboarding | guided | none |
| Mobile | yes | no |
| Trust (reviews, honest copy) | yes | undermined by false claims |

**Minimum bar to compete:** real ATS scoring + AI bullet help + resume import + honest marketing + DOCX. Without at least ATS + import + AI, there is no reason to choose this over an incumbent.

---

## 9. Priority Roadmap (Phase 1 → 5)

### Phase 1 — Stop lying & stop losing data (1–2 weeks) — *trust + correctness* — ✅ **DONE (2026-06-13)**
- [x] Implement **debounced autosave** in `CvEditor`.
- [x] **Rewrite the landing/auth copy** to match reality; removed AI/ATS/DOCX/LinkedIn/share/fake-logos.
- [x] Remove **Forgot password** dead link (reset backend deferred to Phase 2).
- [x] Add **basic tests**: auth flow, CV ownership scoping (`findByIdAndUser`), `CvMapper` round-trip (23 tests, green).

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

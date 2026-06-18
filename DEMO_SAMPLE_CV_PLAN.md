# Plan: Seed a sample CV into every new account

> Status: **planned, not implemented.** Goal: new accounts are never empty —
> each gets a complete "Sam Altman" showcase resume so users immediately see
> what CV Builder can do. Doubles as onboarding (audit's missing first-run).

## Core approach — seed server-side at account creation
When a new user is first persisted, the backend creates a complete Sam Altman
CV owned by that user. **Server-side, not frontend**, because:
- It must cover **both signup paths**: email/password (`AuthService.register`)
  AND OAuth first login (`CustomOAuth2UserService` creates the user on first
  Google/GitHub login).
- One source of truth, no client races, no double-creation.

Add a `seedSampleCv(user)` and call it the moment a user is first saved, in
**both** paths. Seed **once**, only for brand-new users (for OAuth, only when
the user row is newly created — not on every login).

## Where the sample data lives
A JSON resource in the backend: `backend/src/main/resources/sample-cv.json`
— the full Sam Altman resume (personal info, 3 roles, 12 skills, project,
education, 2 certs, 2 awards, languages). Loaded → built into a CV → saved for
the new user. JSON keeps the showcase content editable without code changes.
(Reference content already exists from manual testing; reuse the Sam Altman CV
shape: see `frontend/src/templates/sampleCv.ts` and the data used during dev.)

## Key design decisions (recommended)
1. **Label it clearly as a sample** — title `Sam Altman — Senior Software
   Engineer (Sample)`. Critical so users don't think the app mis-filled their
   data. Also add a small **"Sample" badge** on that dashboard card
   (cards whose title ends with `(Sample)`).
2. **Fully editable, user-owned CV** — not read-only. They can edit, export,
   run AI on, or delete it. It's their copy, seeded once. (This is the point:
   play with a real, complete example.)
3. **Visually impressive template** for max impact — **Modern / Executive /
   Aurora** rather than plain ATS. First impression sells the app's polish.
   (Decision pending — default: Modern.)
4. **Config toggle** `cvbuilder.seed-sample-cv=true` (default on) so it can be
   disabled for a real production launch without code changes.
5. Existing accounts untouched; this applies to new accounts going forward.

## Files to add / touch
- `backend/src/main/resources/sample-cv.json` (new) — showcase data
- `backend/.../service/SampleCvService.java` (new) — load JSON, save CV for a
  user (reuse `CvMapper` / `CvService` create path; scope to the user)
- `backend/.../service/AuthService.java` — call `seedSampleCv` after register
- `backend/.../service/CustomOAuth2UserService.java` — call `seedSampleCv` when
  the user is first created
- `backend/.../application.properties` — `cvbuilder.seed-sample-cv=${SEED_SAMPLE_CV:true}`
- (optional) frontend `Dashboard.tsx` — small "Sample" badge on `(Sample)` cards

## Tradeoffs
- **Clutter vs value:** some want a blank start — mitigated by the clear
  "(Sample)" label + easy delete.
- **Fixed example** (everyone gets the same Sam Altman) — intended; it's a
  showcase, not personalization.
- **Onboarding bonus:** effectively becomes the first-run experience.

## Open decisions before implementing
1. Showcase **template**: Modern / Executive / Aurora vs ATS-clean? (lean Modern)
2. **"(Sample)" label + badge**? (recommend yes)
3. **Config toggle**, default on? (recommend yes)

## Implementation notes
- Seeding should run in a transaction after the user is saved; a failure to
  seed must NOT break signup (wrap in try/catch, log a warning).
- Generate fresh child-row UUIDs server-side (CREATE drops client IDs already).
- Keep the JSON's `sectionOrder` consistent with the chosen template.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (run from `frontend/`)
```bash
npm install          # Install deps (required first time)
npm run dev          # Dev server → http://localhost:5173
npm run build        # Type-check (tsc -b) + Vite production build
npm run lint         # ESLint
```

### Backend (run from `backend/`)
```bash
mvn clean compile    # Compile + resolve Maven deps
mvn spring-boot:run  # Run API on port 8081
mvn test             # Run full test suite
mvn -Dtest=YourTestClassTest test                    # Run one test class
mvn -Dtest=YourTestClassTest#yourTestMethod test     # Run one test method
```

### PDF export — install Chromium once (from `backend/`)
```bash
mvn -q org.codehaus.mojo:exec-maven-plugin:3.1.0:java \
  -Dexec.mainClass=com.microsoft.playwright.CLI \
  -Dexec.args="install chromium"
```

**Ports:** Frontend 5173, Backend 8081. Vite proxies `/api` to `http://localhost:8081`.

---

## Architecture

### Frontend data flow
- `App.tsx` is the root — it shows `AuthScreen` when unauthenticated, then routes between dashboard and editor using in-memory `selectedCvId`.
- `src/store/authStore.ts` holds the JWT token and user identity; `src/store/cvStore.ts` is the single source of truth for CV data and wraps all `src/api/cvApi.ts` calls.
- `CvEditor.tsx` maintains a local `formData` draft that syncs to the backend on explicit save (`Ctrl+S`) and immediately before PDF export.
- `src/templates/` contains A4-proportioned preview components: `ClassicTemplate`, `ModernTemplate`, `AtsTemplate`, `ProTemplate`. `CvPreview.tsx` picks the right one based on `templateId`. `CvPrintView.tsx` is the full-page version Playwright loads.

### Backend request flow
`AuthController` / `CvController` / `PdfController` → `Service` layer → `CvRepository` (Spring Data JPA, SQLite).

`CvMapper` owns all DTO↔entity conversion and handles bidirectional `@OneToMany` relationships: clear the existing child collection, rebuild from DTOs, then set each child's parent `cv` reference. This is required because of `cascade = ALL` + `orphanRemoval = true` on parent collections.

### Authentication
JWT-based auth is fully implemented. All `/api/**` endpoints except `/api/auth/**` require a `Bearer` token. The filter chain lives in `SecurityConfig` → `JwtAuthenticationFilter` → `JwtService`. CVs are scoped to the authenticated user — `CvService` and `PdfService` call `SecurityContextHolder` to get the current `User` and scope queries with `findByIdAndUser`.

### PDF rendering
`PdfService` opens the frontend print view (`/?print=1&cvId=...`) in a headless Chromium browser via Playwright for browser-accurate layout. Override the target URL with `cvbuilder.frontend.base-url` (default: `http://localhost:5173`).

---

## Key conventions

### Template alignment
Frontend preview templates (`src/templates/*Template.tsx`) and the `PdfService` HTML generation are parallel implementations of each design. CSS or layout changes to a preview template almost always require a matching change in `PdfService`.

### Rich text fields
`summary`, `experience.description`, and `project.description` are stored and rendered as HTML (via `react-quill-new`). Use `dangerouslySetInnerHTML` in templates and apply `break-normal whitespace-normal` to prevent mid-word breaks. In the backend, inject HTML directly into PDF template strings.

### Data conventions
- Section collection keys are always plural: `experiences`, `educations`, `skills`, `projects`. Never introduce singular alternatives.
- Always generate client-side IDs with `crypto.randomUUID()`. `CvMapper` preserves incoming DTO IDs when present.
- Use `@Column(columnDefinition = "TEXT")` on HTML content fields in JPA entities to avoid truncation in SQLite.

### Error handling
Backend errors flow through `GlobalExceptionHandler` as HTTP status codes with plain-text messages. The frontend `cvApi.ts` throws `ApiError` (with `status` and `message`) for handling in Zustand store catch blocks.

### Template IDs
`templateId` is an enum: `CLASSIC`, `MODERN`, `ATS`, `PRO`. Never use raw string literals for template IDs.

### Skills directory
`skills/` contains agent task templates for common workflows: `new-feature.md`, `new-component.md`, `new-api-endpoint.md`, `bugfix.md`, `testing.md`.

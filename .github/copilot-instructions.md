# Copilot Instructions for CV Builder

## Build, lint, and test commands

Run commands from the package directory they target.

| Area | Command | Purpose |
| --- | --- | --- |
| Frontend | `cd frontend && npm install` | Install dependencies |
| Frontend | `cd frontend && npm run dev` | Start Vite dev server (`http://localhost:5173`) |
| Frontend | `cd frontend && npm run build` | Type-check and production build (`tsc -b && vite build`) |
| Frontend | `cd frontend && npm run lint` | ESLint |
| Backend | `cd backend && mvn clean compile` | Compile and resolve Maven dependencies |
| Backend | `cd backend && mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"` | Run API on port 8081 |
| Backend | `cd backend && mvn test` | Run backend test suite |
| Backend (single test class) | `cd backend && mvn -Dtest=YourTestClassTest test` | Run one JUnit test class |
| Backend (single test method) | `cd backend && mvn -Dtest=YourTestClassTest#yourTestMethod test` | Run one JUnit test method |

Frontend currently has no dedicated automated test runner script in `package.json`; build/lint are the primary quality gates there.

## High-level architecture

- This is a split frontend/backend app where React + Zustand drives editing UX, and Spring Boot persists CV data to SQLite and serves PDF exports.
- In the frontend, `App.tsx` handles dashboard vs editor routing in-memory (`selectedCvId`), while `cvStore.ts` is the single source of truth for server data (`cvs`, `currentCv`) and wraps all API calls in `src/api/cvApi.ts`.
- `CvEditor.tsx` maintains a local `formData` draft, then explicitly syncs to backend on save and immediately before PDF export. Export opens `GET /api/cv/{id}/export/pdf` with a timestamp query to avoid stale browser cache.
- Backend request flow is `controller -> service -> repository`, with `CvMapper` owning DTO/entity conversion and relationship wiring for nested collections (`experiences`, `educations`, `skills`, `projects`).
- PDF rendering is fully backend-owned (`PdfService`): it reloads the CV from DB, builds template-specific HTML (CLASSIC/MODERN/ATS), converts HTML through jsoup to W3C DOM, then renders via `openhtmltopdf`.
- Frontend preview templates (`src/templates/*Template.tsx`) and backend PDF template branches (`PdfService`) are parallel implementations that must stay behaviorally aligned.

## Key conventions specific to this repository

- Keep CV section keys plural and consistent across layers: `experiences`, `educations`, `skills`, `projects`. Do not introduce singular alternatives.
- Client-generated IDs are standard for nested list items (`crypto.randomUUID()` in list components). Mapper logic preserves incoming DTO IDs when present.
- For JPA one-to-many updates, follow existing mapper pattern: clear existing child collection, rebuild from request, and set each child’s parent `cv` reference. This works with `cascade = ALL` + `orphanRemoval = true` in `Cv`.
- Rich text fields (`summary`, `experience.description`, `project.description`) are stored/rendered as HTML. Frontend templates use `dangerouslySetInnerHTML`; backend PDF template generation injects these fields as HTML content.
- Maintain `break-normal whitespace-normal` styling for rich text blocks in templates to prevent mid-word breaks in preview/PDF-like layouts.
- Backend is expected on port `8081`, and Vite proxy is configured for `/api -> http://localhost:8081`; keep these in sync when changing local runtime ports.

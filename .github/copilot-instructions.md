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

### First-time setup
```bash
cd frontend && npm install
cd ../backend && mvn clean compile
```

## High-level architecture

- This is a split frontend/backend app where React + Zustand drives editing UX, and Spring Boot persists CV data to SQLite and serves PDF exports.
- **Frontend data flow**: `App.tsx` routes between dashboard and editor views using in-memory `selectedCvId`. `cvStore.ts` is the single source of truth for server data (`cvs`, `currentCv`) and wraps all API calls from `src/api/cvApi.ts`. `CvEditor.tsx` maintains a local `formData` draft, then explicitly syncs to backend on save and immediately before PDF export.
- **PDF export**: Opening `GET /api/cv/{id}/export/pdf` uses a timestamp query parameter to bypass stale browser cache. The export endpoint reloads the CV from DB and generates fresh HTML.
- **Backend request flow**: `controller` receives requests → `service` handles business logic → `repository` queries SQLite. `CvMapper` owns DTO/entity conversion and manages bidirectional relationship wiring for nested collections (`experiences`, `educations`, `skills`, `projects`).
- **PDF rendering**: Fully backend-owned (`PdfService`). It builds template-specific HTML (CLASSIC/MODERN/ATS), sanitizes HTML with jsoup to W3C DOM, then renders via `openhtmltopdf`.
- **Template alignment**: Frontend preview templates (`src/templates/*Template.tsx`) and backend PDF templates (conditional branches in `PdfService`) are parallel implementations. Both use A4-proportioned layouts and must stay behaviorally aligned—CSS changes to preview templates often need corresponding HTML template updates in backend.
- **Vite proxy**: Frontend dev server proxies `/api` requests to `http://localhost:8081`. Keep both ports in sync when changing runtime configuration.

## Key conventions specific to this repository

### Data & Naming
- Keep CV section keys plural and consistent across layers: `experiences`, `educations`, `skills`, `projects`. Do not introduce singular alternatives.
- Use `crypto.randomUUID()` for all client-generated IDs. Mapper logic preserves incoming DTO IDs when present.

### JPA & Relationships
- Follow the `CvMapper` pattern for one-to-many updates: (1) clear existing child collection, (2) rebuild from request DTOs, (3) set each child's parent `cv` reference. This works with `cascade = ALL` + `orphanRemoval = true` on the parent's collection fields.
- Use `@Column(columnDefinition = "TEXT")` for HTML content fields to prevent truncation in SQLite.

### Rich Text Handling
- Rich text fields (`summary`, `experience.description`, `project.description`) are stored and rendered as HTML.
- Frontend: Use `dangerouslySetInnerHTML` with rich text fields. Apply `break-normal whitespace-normal` styling to prevent mid-word breaks.
- Backend: Inject HTML content directly into PDF template strings; jsoup sanitization happens before openhtmltopdf rendering.
- Template alignment: Update both frontend (`src/templates/*Template.tsx`) and backend (`PdfService`) when changing rich text styling.

### Error Handling
- Backend errors are caught by `GlobalExceptionHandler` and returned as HTTP status codes with plain-text error messages.
- Frontend API client (`cvApi.ts`) throws `ApiError` with status and message for handling in store catch blocks.

### Configuration & Integration
- Vite proxy: `/api` routes to `http://localhost:8081`. Backend is on port 8081, frontend on 5173.
- Template IDs: `CLASSIC`, `MODERN`, `ATS` (enum-based, not string literals).

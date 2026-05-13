# Project: CV Builder

Full-stack CV builder with live preview, multi-template support, and PDF export.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand.
- **Backend**: Spring Boot 3.2, Java 17, Apache PDFBox.
- **Database**: SQLite (local development).

## Architecture & Data Flow
- **Backend**: Standard Spring Boot architecture.
  - `Controller` handles REST endpoints (port 8081).
  - `Service` contains business logic (e.g., CV generation, PDF creation).
  - `Repository` (Spring Data JPA) interfaces with SQLite.
  - `DTOs` are used for data transfer between frontend and backend.
- **Frontend**: React-based SPA.
  - `Zustand` (`cvStore.ts`) manages global state (CV list, current selection).
  - `cvApi.ts` handles all HTTP communication with the backend.
  - `CvPreview` and template components (`ModernTemplate`, `ClassicTemplate`, `AtsTemplate`) handle real-time rendering.
- **Integration**: Vite is configured to proxy `/api` requests to `http://localhost:8081`.

## Key Commands

### Setup & Development
```bash
# Frontend (from ./frontend)
npm install         # Install dependencies
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Build for production

# Backend (from ./backend)
mvn clean compile   # Compile and download dependencies
mvn spring-boot:run # Run backend (defaults to port 8081 via application.properties)
```

### Production Build
```bash
cd frontend && npm run build
cd ../backend && mvn clean package
```

## Development Conventions

### General
- **Naming**: Use PascalCase for React components and camelCase for API functions and variables.
- **State**: Prefer `Zustand` for shared state and local `useState` for UI-only state (e.g., form inputs before saving).
- **Styling**: Use Tailwind CSS v4 utility classes. Prefer layout components for consistency.

### Backend (Java/Spring Boot)
- **Endpoints**: Return `ResponseEntity` with appropriate HTTP status codes.
- **Mapping**: Use DTOs for requests and responses; avoid exposing entities directly.
- **Errors**: Handled via `@ExceptionHandler` in controllers or global exception handlers.
- **Entities**: Consistent use of `UUID` for primary keys.

### Frontend (React/TypeScript)
- **Types**: Define interfaces in `src/types/cv.ts` and keep them in sync with backend DTOs.
- **Store**: All async data fetching for CVs should go through `useCvStore`.
- **Templates**: CV templates are located in `src/templates/`. They should be designed for high print quality.

## Project Structure Highlights
- `/backend`: Spring Boot project.
- `/frontend`: Vite/React project.
- `/skills`: Specialized agent instruction sets for common tasks.
- `AGENTS.md`: Detailed technical context and developer guide.
- `opencode.json`: Environment configuration.

## Roadmap & Known Issues
- Authentication is not yet implemented.
- PDF styling improvements for complex layouts are ongoing.
- See `README.md` for a full TODO list.

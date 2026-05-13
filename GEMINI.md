# Project: CV Builder

Full-stack CV builder with live preview, multi-template support, and high-fidelity PDF export.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, `react-quill-new` (Rich Text), `react-hot-toast`.
- **Backend**: Spring Boot 3.2, Java 17, `openhtmltopdf` (HTML-to-PDF engine), `jsoup` (HTML processing).
- **Database**: SQLite (local development).

## Architecture & Data Flow
- **Backend**: 
  - `Controller`: REST endpoints (port 8081). `PdfController` includes cache-control headers.
  - `Service`: Business logic. `PdfService` generates template-specific HTML for PDF rendering.
  - `Repository`: Spring Data JPA with SQLite.
  - `Mapper`: Handles DTO/Entity conversion with proper bidirectional relationship management.
- **Frontend**: 
  - `Zustand`: Global state management (`cvStore.ts` for data, `themeStore.ts` for Light/Dark mode).
  - `cvApi.ts`: HTTP communication. Uses `crypto.randomUUID()` for backend compatibility.
  - `CvEditor`: Full-screen resizable workspace with `Ctrl+S` support and live pipeline syncing.
  - `Templates`: A4-proportioned components (`ModernTemplate`, `ClassicTemplate`, `AtsTemplate`) using `dangerouslySetInnerHTML` for rich text.
- **Integration**: Vite proxies `/api` to `http://localhost:8081`.

## Key Commands

### Setup & Development
```bash
# Frontend (from ./frontend)
npm install         # Install dependencies
npm run dev         # Start dev server (http://localhost:5173)

# Backend (from ./backend)
mvn clean compile   # Compile and sync dependencies
mvn spring-boot:run # Run backend (port 8081)
```

## UI/UX & Design System
- **Theme**: Persistent Light/Dark mode support via `useThemeStore`.
- **Visual Identity**: Professional Zinc/Slate SaaS aesthetic with glassmorphism, micro-borders, and industrial typography.
- **Responsive Editor**: Resizable split-pane layout with independent panel scrolling.
- **Rich Text**: Summary and Description fields support Bold, Italic, and Lists.

## Development Conventions

### General
- **Naming**: PascalCase for components, camelCase for variables/APIs.
- **Persistence**: Auto-save CV state before PDF export or navigation changes.
- **Styling**: Semantic CSS variables for theme-aware components. Use `glass-surface` and `input-field` utilities.

### Backend (Java/Spring Boot)
- **Entities**: Use `UUID` for primary keys. `@OneToMany` relationships must use `mappedBy` and manual parent linking in mappers.
- **Database**: `description` fields should use `@Column(columnDefinition = "TEXT")` for large HTML content.
- **PDF**: Always use `openhtmltopdf` for rendering. Ensure HTML is sanitized via `jsoup` before conversion.

### Frontend (React/TypeScript)
- **IDs**: Always generate IDs using `crypto.randomUUID()`.
- **Shortcuts**: `Ctrl+S` is standard for saving.
- **Templates**: Ensure `break-normal` is used for content to prevent mid-word splitting.

## Project Structure
- `/backend`: Spring Boot project.
- `/frontend`: Vite/React project.
- `/skills`: Specialized agent instruction sets.
- `AGENTS.md`: Detailed technical context and developer guide.

## Roadmap & Known Issues
- Authentication and user accounts.
- Template-specific font embedding in PDFs.
- Image/Profile picture upload.
- CV versioning/history.

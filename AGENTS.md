# CV Builder - Agent Context

## Project Overview
Full-stack CV builder with live preview, multi-template support, and PDF export.
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Spring Boot (Java)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **PDF**: react-pdf + pdf-lib

## Repository Structure
```
cv_builder/
├── frontend/          # React app (Vite)
├── backend/           # Spring Boot API
├── skills/            # Reusable agent task templates
├── AGENTS.md          # This file
└── opencode.json      # OpenCode tool config
```

## Developer Commands

### Frontend
```bash
cd frontend
npm install
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check
```

### Backend
```bash
cd backend
mvn spring-boot:run  # Start API (http://localhost:8080)
mvn clean package     # Build
mvn test              # Run tests
```

### Full Stack
```bash
cd frontend && npm run dev
cd backend && mvn spring-boot:run
```

## Architecture Notes

### API Design (REST)
- `GET/POST /api/cv` - List/create CVs
- `GET/PUT/DELETE /api/cv/{id}` - Get/update/delete CV
- `POST /api/cv/{id}/export/pdf` - Export to PDF
- `GET /api/templates` - List available templates

### CV Data Model
```json
{
  "id": "uuid",
  "title": "string",
  "templateId": "classic | modern | ats",
  "personalInfo": { "name", "email", "phone", "location", "summary" },
  "experience": [{ "company", "role", "startDate", "endDate", "description" }],
  "education": [{ "institution", "degree", "field", "graduationYear" }],
  "skills": [{ "name", "level" }],
  "projects": [{ "name", "description", "url" }],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Frontend Entry Points
- `src/App.tsx` - Main app router
- `src/pages/` - Route pages
- `src/components/` - Reusable UI components
- `src/api/` - API client functions
- `src/store/` - State management
- `src/templates/` - CV template renderers

### Backend Entry Points
- `src/main/java/com/cvbuilder/CvBuilderApplication.java` - Main class
- `src/main/java/com/cvbuilder/controller/` - REST controllers
- `src/main/java/com/cvbuilder/service/` - Business logic
- `src/main/java/com/cvbuilder/repository/` - Data access

## Conventions

### Naming
- Components: PascalCase (`CvEditor.tsx`)
- Services/Controllers: PascalCase
- API functions: camelCase with `use` prefix for hooks
- CSS classes: kebab-case (Tailwind)

### Git Workflow
- Branch: `feature/<name>` or `fix/<name>`
- Commit: conventional commits (`feat:`, `fix:`, `docs:`)
- PR before merge to main

### Code Quality
- Run lint + typecheck before committing
- Tests required for new services
- Frontend: component tests with Vitest
- Backend: unit tests with JUnit

## Skills Available
See `skills/` directory:
- `new-feature.md` - Adding new CV section/feature
- `new-component.md` - Creating React components
- `new-api-endpoint.md` - Adding REST endpoints
- `bugfix.md` - Bugfix workflow
- `testing.md` - Test writing guidance

## Important Notes
- Always read AGENTS.md before starting new tasks
- Use skills for repeatable patterns
- Sub-agents can run parallel research tasks
- Verify changes with lint/typecheck before marking done

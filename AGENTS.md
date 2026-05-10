# CV Builder - Agent Context

## Project Overview
Full-stack CV builder with live preview, multi-template support, and PDF export.
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Spring Boot 3.2 (Java 21)
- **Database**: SQLite
- **PDF**: Apache PDFBox

## IMPORTANT: First Steps on New Clone

```bash
# 1. Install frontend deps
cd frontend && npm install

# 2. Build backend (downloads Maven deps automatically)
cd ../backend && mvn clean compile

# 3. Start both servers
# Terminal 1:
cd frontend && npm run dev
# Terminal 2:
cd backend && mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

**Port note:** Backend runs on 8081 (avoid conflict with common 8080).

## Repository Structure
```
cv_builder/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── api/          # cvApi.ts - API calls
│   │   ├── components/    # CvEditor, forms, lists
│   │   ├── store/        # cvStore.ts (Zustand)
│   │   ├── templates/    # Classic/Modern/Ats templates + CvPreview
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main app
│   └── package.json
├── backend/               # Spring Boot API
│   ├── src/main/java/com/cvbuilder/
│   │   ├── controller/   # CvController, PdfController
│   │   ├── dto/          # Request/Response DTOs
│   │   ├── entity/        # JPA entities
│   │   ├── exception/    # Error handling
│   │   ├── mapper/       # Entity-DTO mapping
│   │   ├── repository/   # JPA repositories
│   │   └── service/      # Business logic
│   └── pom.xml
├── skills/               # Agent task templates
├── AGENTS.md
├── opencode.json
└── README.md
```

## Developer Commands

### Frontend (run from `frontend/` dir)
```bash
npm install          # Install deps (DO THIS FIRST on new clone)
npm run dev          # Dev server → http://localhost:5173
npm run build        # Production build
```

### Backend (run from `backend/` dir)
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
# or (port 8080 if available)
mvn spring-boot:run
```

### Vite Proxy
Frontend Vite config proxies `/api` → `http://localhost:8081` (update vite.config.ts if backend port changes).

## API Design (REST)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cv` | List CVs |
| POST | `/api/cv` | Create CV |
| GET | `/api/cv/{id}` | Get CV |
| PUT | `/api/cv/{id}` | Update CV |
| DELETE | `/api/cv/{id}` | Delete CV |
| GET | `/api/cv/{id}/export/pdf` | Download PDF |

## CV Data Model

```json
{
  "id": "uuid",
  "title": "string",
  "templateId": "CLASSIC | MODERN | ATS",
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string"
  },
  "experiences": [{ "id": "uuid", "company", "role", "startDate", "endDate", "description" }],
  "educations": [{ "id": "uuid", "institution", "degree", "field", "graduationYear" }],
  "skills": [{ "id": "uuid", "name", "level" }],
  "projects": [{ "id": "uuid", "name", "description", "url" }],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Note:** Backend uses `experiences`/`educations` (not `experience`/`education`) - this was a fixed inconsistency.

## Key Patterns

### Adding a new CV section
1. Backend: Add entity → repository → service → controller
2. Frontend: Add type → API call → store action → component
3. Test with API client (curl or browser dev tools)

### State management
- Zustand store (`cvStore.ts`) manages CV list and current CV
- Components use store hooks for data
- Form data is local state, synced on save

### Styling
- Tailwind CSS v4 (requires `@tailwindcss/vite` plugin in vite.config.ts)
- Dark glassmorphism theme on main pages
- CV templates use white backgrounds for printability

## Skills Available

See `skills/` directory:
- `new-feature.md` - Adding new CV section
- `new-component.md` - Creating React components
- `new-api-endpoint.md` - Adding REST endpoints
- `bugfix.md` - Bugfix workflow
- `testing.md` - Test writing guidance

## Conventions

### Naming
- Components: PascalCase (`CvEditor.tsx`)
- API functions: camelCase
- CSS classes: Tailwind (kebab-case)

### Git Workflow
```bash
git checkout -b feature/<name>
# make changes
git add .
git commit -m "feat: description"
git push origin feature/<name>
```

### Code Quality
- Frontend: `npm run build` (runs TypeScript + Vite)
- Backend: `mvn clean compile`
- Run both before committing
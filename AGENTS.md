# CV Builder - Agent Context

## Project Overview
Full-stack CV builder with live preview, multi-template support, and high-fidelity PDF export.
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Spring Boot 3.2 (Java 17)
- **Database**: SQLite
- **PDF**: Playwright (Chromium) HTML-to-PDF

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
cd backend && mvn spring-boot:run
```

**Ports:** Frontend 5173, Backend 8081

## Dependencies

### Frontend (run `npm install`)
- `react-hot-toast` - Toast notifications
- `react-quill-new` - Rich text editor
- `zustand` - State management

## Repository Structure
```
cv_builder/
├── frontend/
│   ├── src/
│   │   ├── api/cvApi.ts         # API client
│   │   ├── components/          # UI components
│   │   ├── store/
│   │   │   ├── cvStore.ts      # CV state
│   │   │   └── themeStore.ts   # Light/Dark mode
│   │   ├── templates/          # CV template renderers
│   │   └── types/cv.ts         # TypeScript types
├── backend/
│   ├── src/main/java/com/cvbuilder/
│   │   ├── controller/         # REST endpoints
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── exception/          # Error handling
│   │   ├── mapper/             # Entity-DTO mapping
│   │   ├── repository/         # Data access
│   │   └── service/            # Business logic + PDF
├── skills/                     # Agent task templates
└── GEMINI.md                  # Detailed project notes
```

## Developer Commands

### Frontend (from `frontend/`)
```bash
npm install          # Install deps (DO THIS FIRST)
npm run dev          # Dev server → http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint check
```

### Backend (from `backend/`)
```bash
mvn clean compile    # Compile
mvn spring-boot:run # Run (port 8081)
mvn test            # Run tests
```

### PDF Export Setup
```bash
# Install Chromium (required for PDF export)
mvn -q org.codehaus.mojo:exec-maven-plugin:3.1.0:java \
  -Dexec.mainClass=com.microsoft.playwright.CLI \
  -Dexec.args="install chromium"
```

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
    "summary": "string (HTML)"
  },
  "experiences": [{
    "id": "uuid",
    "company": "string",
    "role": "string",
    "startDate": "string",
    "endDate": "string",
    "description": "string (HTML)"
  }],
  "educations": [{ "institution", "degree", "field", "graduationYear" }],
  "skills": [{ "id", "name", "level" }],
  "projects": [{ "id", "name", "description", "url" }],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Key Patterns

### State Management
- `cvStore.ts` - CV data (create, update, delete, list)
- `themeStore.ts` - Light/Dark mode (persisted)

### ID Generation
- Use `crypto.randomUUID()` for all IDs (frontend)

### Rich Text
- Summary and descriptions support Bold, Italic, Lists
- Stored as HTML, rendered with `dangerouslySetInnerHTML` in templates

### PDF Generation
- Backend uses Playwright + Chromium for template-specific HTML-to-PDF
- Rendering is browser-accurate, matching preview line breaks more closely
- `cvbuilder.frontend.base-url` controls which frontend URL Chromium loads for the print view

## Conventions

### Naming
- Components: PascalCase (`CvEditor.tsx`)
- API functions: camelCase
- CSS classes: Tailwind (kebab-case)

### Backend
- Use `UUID` for primary keys
- `@Column(columnDefinition = "TEXT")` for HTML content
- `@OneToMany` with `mappedBy` + manual parent linking

### Shortcuts
- `Ctrl+S` - Save CV (in editor)

## Skills Available

See `skills/` directory:
- `new-feature.md` - Adding new CV section
- `new-component.md` - Creating React components
- `new-api-endpoint.md` - Adding REST endpoints
- `bugfix.md` - Bugfix workflow
- `testing.md` - Test writing guidance

## Roadmap / Known Issues
- Authentication and user accounts
- Template-specific font embedding in PDFs
- Image/Profile picture upload
- CV versioning/history
# CV Builder

A full-stack CV builder with live preview, multi-template support, and PDF export.

## Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- Maven 3.9+

### Setup

```bash
# Clone and install
git clone https://github.com/bishal16/cv_builder.git
cd cv_builder

# Frontend
cd frontend && npm install && npm run dev

# Backend (new terminal)
cd backend && mvn spring-boot:run
```

Open http://localhost:5173

## Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Spring Boot 3.2 + Java 21
- **Database**: SQLite (dev)
- **PDF**: Apache PDFBox

## Project Structure

```
cv_builder/
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # UI components
│   │   ├── store/        # Zustand state
│   │   ├── templates/    # CV template renderers
│   │   └── types/        # TypeScript types
│   └── ...
├── backend/
│   ├── src/main/java/com/cvbuilder/
│   │   ├── controller/   # REST endpoints
│   │   ├── dto/          # Data transfer objects
│   │   ├── entity/       # JPA entities
│   │   ├── mapper/       # Entity-DTO mapping
│   │   ├── repository/    # Data access
│   │   └── service/       # Business logic
│   └── ...
├── skills/               # Agent task templates
├── AGENTS.md            # Agent context (this file)
└── opencode.json        # OpenCode config
```

## Available Scripts

### Frontend
```bash
npm run dev      # Dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint
```

### Backend
```bash
mvn spring-boot:run  # Run (port 8081)
mvn clean package    # Build JAR
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cv` | List all CVs |
| POST | `/api/cv` | Create CV |
| GET | `/api/cv/{id}` | Get CV |
| PUT | `/api/cv/{id}` | Update CV |
| DELETE | `/api/cv/{id}` | Delete CV |
| GET | `/api/cv/{id}/export/pdf` | Download PDF |

## Known Issues / TODOs

- [ ] Add authentication
- [ ] Add more PDF styling
- [ ] Add CV sharing/preview links
- [ ] Add unit tests

## For Agents

Read `AGENTS.md` for detailed development context, conventions, and reusable skills.
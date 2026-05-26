# CV Builder — Architecture & Roadmap

> Generated: 2026-05-26
> Status: Phase 1 not yet started
> Current maturity: 30/100

---

## 1. CURRENT PROJECT ASSESSMENT

### Maturity: 30/100

**What's done well:**
- User-scoped data isolation via `findByIdAndUser()` everywhere
- Unsaved-changes detection with `beforeunload` and snapshot comparison
- Drag-and-drop section reordering with normalized order persisted server-side
- Manual `CvMapper` with proper bidirectional JPA relationship wiring (clear -> rebuild -> set parent)
- Auth flow is structurally sound: JWT + OAuth2 + BCrypt + `OncePerRequestFilter`

**What looks junior-level:**

| Issue | Where | Why it matters |
|---|---|---|
| Hardcoded JWT secret in properties | `application.properties:17` | Security vulnerability, committed to git |
| Zero tests | `src/test/` is empty | Single biggest red flag |
| SQLite + `ddl-auto=update` | `application.properties:9` | No migration strategy, no real database |
| No input validation on DTOs | All DTO classes | No `@Valid`, no `@NotBlank`, nothing |
| `FetchType.EAGER` on ALL collections | `Cv.java:37-52` | N+1 problem at scale |
| `CvEditor.tsx` is 625 lines | Single component | 15+ `useState` calls |
| `any` types in API client | `cvApi.ts:53,62` | Defeats the purpose of TypeScript |
| No API versioning | All controllers | `/api/cv` instead of `/api/v1/cv` |
| No pagination | `CvController.listCvs()` | Returns ALL user CVs in one shot |
| No Swagger/OpenAPI | Backend | No API documentation |
| No React Router | `App.tsx` | Can't deep-link to a CV |
| Token in localStorage | `authStore.ts` | Vulnerable to XSS |
| No refresh token | Auth flow | Single JWT with 24h expiry |
| Duplicate `TemplateId` enum | `entity/TemplateId.java` vs `model/TemplateId.java` | 3 values vs 4 values, confusion |
| PDF auth is broken | `PdfService.java` | Playwright browser has no JWT token |
| Debug endpoint left in code | `AuthController: GET /api/auth/test` | Should be removed |
| Dead dependency | `spring-boot-starter-oauth2-client` in pom.xml | OAuth2 not implemented |
| XSS vulnerability | Frontend `dangerouslySetInnerHTML` | No DOMPurify sanitization |
| Error response inconsistency | `CvController` vs `GlobalExceptionHandler` | Different formats (record vs Map) |
| `getCurrentUser()` duplicated | `CvService`, `PdfService` | Should extract to utility |

**What would make interviewers impressed:**
- Tests (integration with Testcontainers, security tests, mapper unit tests)
- Docker Compose that works with one command
- Database migrations (Flyway)
- Swagger docs
- CI pipeline

---

## 2. SYSTEM ARCHITECTURE

### Backend: Layered Architecture (cleaned up)

**Why not Hexagonal/Clean Architecture:** For a solo developer with a CRUD-heavy app, hexagonal adds ceremony without proportional benefit. A well-structured layered architecture with clear boundaries is more impressive than a poorly implemented hexagonal one.

**Recommended package structure:**

```
com.cvbuilder/
├── config/             # SecurityConfig, WebConfig, SwaggerConfig
├── controller/
│   └── v1/             # API versioned controllers
├── dto/
│   ├── request/        # CreateCvRequest, UpdateCvRequest, LoginRequest
│   └── response/       # CvResponse, AuthResponse, ErrorResponse
├── entity/             # JPA entities (no Spring imports)
├── exception/          # Custom exceptions + GlobalExceptionHandler
├── mapper/             # CvMapper (consider MapStruct later)
├── repository/         # Spring Data interfaces
├── service/            # Business logic
├── security/           # JWT filter, service, config (move from config/)
└── validation/         # Custom validators if needed
```

**Key changes:**

- **DTO strategy:** Split request/response. Create `CvResponse` (with audit fields) and keep `CreateCvRequest`/`UpdateCvRequest` (without them).
- **Exception handling:** Replace `Map<String, String>` with a proper `ErrorResponse` record with `code`, `message`, `timestamp`, `path`.
- **Validation:** Add `@Valid` everywhere. Add `@NotBlank`, `@Size`, `@Email` to DTOs.
- **API versioning:** Prefix with `/api/v1/`.
- **PDF generation:** Make async (return `202 Accepted` with poll URL, generate in background).

### Frontend: Restructure for maintainability

**Recommended structure:**

```
src/
├── api/
│   ├── client.ts        # Base fetch wrapper with auth headers
│   ├── cvApi.ts          # CV endpoints (typed)
│   └── authApi.ts        # Auth endpoints (typed, NO any)
├── components/
│   ├── common/           # Button, Input, Card, Dialog (reusable)
│   ├── cv/               # CvCard, CvList (dashboard components)
│   └── editor/           # PersonalInfoForm, ExperienceList, etc.
├── hooks/                # useUnsavedChanges, useKeyboardShortcut
├── layouts/              # DashboardLayout, EditorLayout
├── pages/                # DashboardPage, EditorPage, AuthPage
├── store/
├── templates/
├── types/
└── utils/
```

**Key changes:**

- **Add React Router** with routes like `/`, `/cv/:id/edit`.
- **Break up CvEditor** into `EditorHeader`, `EditorSidebar`, `PreviewPanel`, `EditorFooter`. Extract `useUnsavedChanges()` and `useResizablePanel()` hooks.
- **Type the API client.** Replace `any` with proper `LoginRequest`, `RegisterRequest`, `AuthResponse` interfaces.
- **Zustand stays.** Right choice for this app's complexity.
- **Consider React Hook Form** for validation, dirty tracking, and performance.

---

## 3. FEATURE ROADMAP

Prioritized by **showcase value / effort ratio**:

| Feature | Why it matters | Difficulty | Showcase value | Architecture implication |
|---|---|---|---|---|
| **Autosave (debounced)** | Optimistic UI, debouncing, conflict handling | Medium | High | `useDebounce` hook, optimistic updates |
| **Resume duplication** | Simple backend endpoint, useful feature | Low | Medium | `POST /api/v1/cv/{id}/duplicate` |
| **Public share links** | URL-based access without auth, token-based sharing | Medium | Very High | `share_token` column, public controller |
| **Resume versioning** | Audit trail, diff thinking | Medium-High | Very High | `cv_versions` table, JSONB snapshots |
| **Profile completion score** | Computational logic on the model | Low | Medium | Pure function scoring filled fields |
| **Undo/Redo** | Command pattern or immutable state history | Medium | High | State history stack in Zustand |
| **ATS score checker** | Keyword matching against job description | Medium | Very High | String matching first, AI later |
| **i18n** | Production thinking | Low-Medium | Medium | `react-i18next` |
| **Resume import (JSON/LinkedIn)** | File upload, parsing, mapping | Medium | Medium | File upload endpoint, parser service |

**Skip (overengineering for portfolio):** Dynamic themes beyond light/dark, resume analytics, AI suggestions (unless specifically showcasing AI), collaborative editing (save for future).

---

## 4. DATABASE DESIGN

Switch from SQLite to **PostgreSQL**. Use **Flyway** for migrations.

```sql
-- V1__initial_schema.sql

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    provider        VARCHAR(50) DEFAULT 'local',
    provider_id     VARCHAR(255),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    revoked         BOOLEAN DEFAULT false,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE cvs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    template_id     VARCHAR(50) NOT NULL,
    section_order   TEXT[],
    is_deleted      BOOLEAN DEFAULT false,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE personal_info (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL UNIQUE REFERENCES cvs(id) ON DELETE CASCADE,
    full_name       VARCHAR(200),
    email           VARCHAR(255),
    phone           VARCHAR(50),
    location        VARCHAR(200),
    linkedin_url    VARCHAR(500),
    github_url      VARCHAR(500),
    summary         TEXT
);

CREATE TABLE experiences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    company         VARCHAR(200) NOT NULL,
    role            VARCHAR(200) NOT NULL,
    start_date      VARCHAR(50),
    end_date        VARCHAR(50),
    description     TEXT,
    sort_order      INT DEFAULT 0
);

CREATE TABLE educations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    institution     VARCHAR(200) NOT NULL,
    degree          VARCHAR(200),
    field           VARCHAR(200),
    graduation_year VARCHAR(10),
    sort_order      INT DEFAULT 0
);

CREATE TABLE skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(100),
    level           VARCHAR(50),
    sort_order      INT DEFAULT 0
);

CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    url             VARCHAR(500),
    sort_order      INT DEFAULT 0
);

-- Versioning (Phase 3)
CREATE TABLE cv_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id           UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    version_number  INT NOT NULL,
    snapshot        JSONB NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_user_updated ON cvs(user_id, updated_at DESC);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_experiences_cv ON experiences(cv_id);
CREATE INDEX idx_educations_cv ON educations(cv_id);
CREATE INDEX idx_skills_cv ON skills(cv_id);
CREATE INDEX idx_projects_cv ON projects(cv_id);
CREATE INDEX idx_cv_versions_cv ON cv_versions(cv_id);
```

**Soft delete:** `is_deleted` boolean + `deleted_at` timestamp on `users` and `cvs`. Use `@Where(clause = "is_deleted = false")`.

**Versioning:** Snapshot full CV as JSONB in `cv_versions` on every save.

**Migration approach:** Flyway with numbered migrations. Never use `ddl-auto=update` outside local dev.

---

## 5. SECURITY ARCHITECTURE

### Current problems (by severity):

1. **JWT secret hardcoded and committed to git**
2. **No refresh token** (single JWT, 24h expiry)
3. **No input validation** (DTOs accept anything)
4. **Token in localStorage** (XSS risk)
5. **No rate limiting** (login brute-forceable)
6. **Internal error messages leak** (`"Internal server error: " + ex.getMessage()`)
7. **PDF auth broken** (Playwright browser has no JWT)
8. **JSON injection in SecurityConfig** (string concatenation for error response)

### Fixes:

**Refresh tokens with rotation:**
```
Login -> access_token (15min, in memory) + refresh_token (7d, httpOnly cookie)
Token expires -> POST /api/v1/auth/refresh -> rotates both
Logout -> revoke refresh token server-side
```
Store refresh token hashes, not raw tokens.

**Rate limiting:** Bucket4j or simple `ConcurrentHashMap` on `/api/auth/login` (5 attempts/IP/minute).

**Input validation:** Add `@Valid` + `@NotBlank`, `@Size`, `@Email` to all request DTOs.

**HTML sanitization:** OWASP Java HTML Sanitizer on rich text fields before persistence. Frontend: add DOMPurify before `dangerouslySetInnerHTML`.

**Secure headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security` via Spring Security `.headers()` DSL.

**CORS:** Move allowed origins to profiles (dev: `localhost:5173`, prod: actual domain).

---

## 6. DEVOPS & INFRASTRUCTURE

### Docker (Phase 1-2)

**Backend Dockerfile (multi-stage):**
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libasound2 libpango-1.0-0 \
    libcairo2 && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/*.jar app.jar
RUN java -jar app.jar --install-chromium || true
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
```

**Frontend Dockerfile (multi-stage):**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Docker Compose:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cvbuilder
      POSTGRES_USER: cvbuilder
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cvbuilder
      SPRING_DATASOURCE_USERNAME: cvbuilder
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8081:8081"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

### CI/CD — GitHub Actions (Phase 2)

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: cvbuilder_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin', cache: 'maven' }
      - run: cd backend && mvn verify

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: frontend/package-lock.json }
      - run: cd frontend && npm ci && npm run lint && npm run build
```

### Kubernetes (Phase 4 — NOT now)

After Docker Compose works in production:
- Local: Minikube or `kind`
- K8s resources: Deployment (backend 2 replicas, frontend 2 replicas), Service (ClusterIP), Ingress (nginx-ingress), ConfigMap, Secret, HPA
- Managed K8s: DigitalOcean (cheapest for learning)
- Helm chart for packaging
- Don't run Postgres in K8s as a beginner — use managed DB

### NOW vs FUTURE

| Now (Phase 1-2) | Later (Phase 3-4) | Much later (Phase 5) |
|---|---|---|
| Docker Compose | GitHub Actions CI | Kubernetes |
| PostgreSQL | Container registry push | Helm charts |
| Flyway migrations | Staging environment | HPA autoscaling |
| `.env` files for secrets | Health check endpoints | AWS EKS/ECS |
| Multi-stage Dockerfiles | `docker compose --profile` | CloudFront CDN |

---

## 7. OBSERVABILITY & MONITORING

### Implementation order:

**Step 1 — Structured logging (do NOW):**

JSON Logback encoder + `CorrelationIdFilter`:

```java
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain) {
        String correlationId = Optional.ofNullable(request.getHeader("X-Correlation-ID"))
                .orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", correlationId);
        response.setHeader("X-Correlation-ID", correlationId);
        try { chain.doFilter(request, response); }
        finally { MDC.clear(); }
    }
}
```

**Step 2 — Spring Boot Actuator + Prometheus (Phase 3):**

Add `spring-boot-starter-actuator` + `micrometer-registry-prometheus`. Zero custom code for JVM, HTTP, DB metrics.

**Step 3 — Grafana dashboards (Phase 4):**

Add Grafana + Prometheus to Docker Compose. Dashboards for:
- API latency (p50, p95, p99 per endpoint)
- Error rate by endpoint
- JVM heap usage
- Active DB connections
- Auth failure rate
- PDF generation duration

**Step 4 — Centralized logging with Loki (Phase 4):**

Grafana Loki + Promtail (NOT ELK — ELK needs 2-4GB RAM, Loki uses ~200MB).

**Step 5 — Distributed tracing with OpenTelemetry (Phase 5):**

`opentelemetry-javaagent` -> Grafana Tempo. Shows controller -> service -> repository -> DB timings.

**Alerting (Phase 4+):**
- Error rate > 5% in 5min -> alert
- P99 latency > 2s -> alert
- PDF generation failure rate > 10% -> alert
- Auth failure spike (>20/min from same IP) -> alert

---

## 8. TESTING STRATEGY

### Backend (highest priority)

**Unit tests (start here):**
- `CvMapperTest` — entity<->DTO conversions, null handling, section order normalization
- `JwtServiceTest` — token generation, extraction, validation, expiration
- `AuthServiceTest` — register (happy + duplicate email), login (happy + wrong password + OAuth-only user)

**Integration tests with Testcontainers (Phase 2):**

```java
@SpringBootTest
@Testcontainers
class CvServiceIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    // Full create -> update -> get -> delete lifecycle
    // User A cannot access user B's CVs
    // Deleting CV cascades to children
}
```

**Security tests (very impressive in interviews):**
```java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {
    // Unauthenticated requests return 401
    // User A's token cannot access user B's CVs
    // Expired tokens are rejected
    // Malformed tokens are rejected
}
```

**API tests with MockMvc:**
- Validation errors -> 400
- Error response format consistency
- Pagination parameters

### Frontend

- **Vitest + React Testing Library:** CvEditor renders form data, save calls API, unsaved changes warning appears
- **Playwright E2E (Phase 3):** register -> create CV -> fill sections -> save -> export PDF (2-3 critical paths only)

### What NOT to test
- Getters/setters on Lombok entities
- Spring framework behavior (`@Transactional` rollback)
- Prefer integration tests with Testcontainers over heavily mocked unit tests

---

## 9. PERFORMANCE & SCALABILITY

### By scale:

**1K users (portfolio demo):**
- PostgreSQL with proper indexes is sufficient
- Synchronous PDF generation is fine
- No caching needed
- Single backend instance

**10K users:**
- **Redis caching** for rendered CV previews
- **Async PDF generation** with message queue (RabbitMQ)
- **Pagination** on `getAllCvs()`
- **Connection pooling** (HikariCP config)

**100K users:**
- CDN for frontend
- Read replicas for PostgreSQL
- Dedicated PDF worker pool (separate service)
- S3 for PDF storage
- Rate limiting per user

### Overengineering for this project:
- Kafka (RabbitMQ is simpler and sufficient)
- Microservices (single bounded context, monolith is correct)
- CQRS/Event Sourcing
- GraphQL (<10 endpoints, REST is fine)
- Redis for sessions (JWT is stateless)

---

## 10. CODE QUALITY & ENGINEERING PRACTICES

**Swagger/OpenAPI:** Add `springdoc-openapi-starter-webmvc-ui`. Zero effort, high impression value.

**Git strategy:** Trunk-based: `main` + `feature/*` branches with PRs.

**Commit conventions:** Conventional Commits (`feat:`, `fix:`, `refactor:`).

**ADRs (Architecture Decision Records) — create `docs/adr/`:**
- `001-layered-architecture.md` — Why layered over hexagonal
- `002-postgresql-over-sqlite.md` — Why you migrated
- `003-playwright-pdf.md` — Why Playwright over iText/OpenPDF
- `004-zustand-over-redux.md` — Why Zustand
- `005-flyway-migrations.md` — Why not ddl-auto

**Design patterns already in use:**
- Builder pattern (Lombok `@Builder`)
- Repository pattern (Spring Data)
- DTO pattern (separate API contract from persistence)
- Strategy pattern opportunity: template rendering

**Code review checklist:**
- [ ] DTOs have validation annotations
- [ ] New endpoints have authorization checks
- [ ] Rich text input is sanitized
- [ ] New queries have indexes
- [ ] Error cases return proper HTTP status codes
- [ ] No `any` types in TypeScript
- [ ] Components under 200 lines

---

## 11. INTERVIEW / PORTFOLIO VALUE

### Completion level signals:

- Through Phase 3 -> **solid mid-level engineer with growth trajectory**
- Through Phase 4 (Docker + CI + monitoring) -> **strong mid-level, ready for senior-track**

### Most impressive for interviewers (ranked):

1. Integration tests with Testcontainers
2. Docker Compose that works with `docker compose up`
3. GitHub Actions CI pipeline
4. Flyway migrations
5. Swagger docs
6. Correlation ID in logs
7. Refresh token rotation
8. ADRs
9. Public share links (nuanced auth)
10. Prometheus + Grafana dashboard

### Mistakes that make it look like a tutorial project:
- SQLite in "production"
- Zero tests
- Hardcoded secrets committed to git
- No `.gitignore` for build artifacts
- `ddl-auto=update`
- `any` types in TypeScript
- Giant components with no decomposition
- No CI pipeline

### Stand out on GitHub:
- Clean README with architecture diagram (draw.io or Mermaid)
- Badges: build passing, code coverage, license
- `docker compose up` in the README
- Link to live demo
- ADR directory
- Contributing guide

---

## 12. PRIORITIZED EXECUTION ROADMAP

### Phase 1 — Foundation (2-3 weeks)

**Goal:** Eliminate all "tutorial project" signals.

Phase 1 is split into 3 waves, each leaving the project in a working state:

#### Wave 1 — Quick wins (30 min) [DONE]

| Task | Status |
|---|---|
| Move JWT secret to env var, remove from git | DONE |
| Remove `/api/auth/test` debug endpoint | DONE |
| Remove dead `oauth2-client` dependency | DONE |
| Consolidate duplicate `TemplateId` enum (deleted `entity/TemplateId.java`) | DONE |
| Delete unused `App.css` | DONE |
| Extract shared `generateId()` into `frontend/src/utils/id.ts` | DONE |
| Expand `.gitignore`, untrack `.idea/` and `cvbuilder.db` | DONE |

#### Wave 2 — PostgreSQL + Flyway migration [DONE]

| Task | Status |
|---|---|
| Swap SQLite for PostgreSQL driver in `pom.xml` | DONE |
| Add Flyway for schema migrations | DONE |
| Create `V1__initial_schema.sql` matching entity model with indexes | DONE |
| Profile-based config (`application.properties`, `-dev`, `-prod`) | DONE |
| Change `ddl-auto` from `update` to `validate` | DONE |
| Disable `open-in-view` (anti-pattern) | DONE |
| Create `.env.example` for documentation | DONE |

**Local setup after Wave 2:**
```bash
# Start PostgreSQL (requires Docker Desktop running)
docker run -d --name cvbuilder-postgres \
  -e POSTGRES_DB=cvbuilder -e POSTGRES_USER=cvbuilder \
  -e POSTGRES_PASSWORD=cvbuilder -p 5432:5432 postgres:16-alpine

# Start backend (requires JDK 17)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
cd backend && mvn spring-boot:run
```

#### Wave 3 — API hardening

| Task | Difficulty | Status |
|---|---|---|
| Add `@Valid` + validation annotations to all DTOs | Low | TODO |
| Add Swagger/OpenAPI (`springdoc`) | Low | TODO |
| API versioning (`/api/v1/`) | Low | TODO |
| Fix `FetchType.EAGER` -> `LAZY` + `@EntityGraph` | Medium | TODO |
| Standardize error response envelope | Low | TODO |
| Type the frontend API client (remove `any`) | Low | TODO |
| Add React Router for proper URL routing | Medium | TODO |
| Add DOMPurify for XSS prevention | Low | TODO |

### Phase 2 — Production Readiness (3-4 weeks)

**Goal:** Make this deployable and tested.

| Task | Difficulty | Learning value |
|---|---|---|
| Unit tests for CvMapper, JwtService, AuthService | Medium | Very high |
| Integration tests with Testcontainers | Medium-High | Very high |
| Security tests (auth enforcement, user isolation) | Medium | Very high |
| Add refresh token rotation | Medium | High |
| Add HTML sanitization (OWASP sanitizer) for rich text | Low | High |
| Dockerize backend + frontend (multi-stage) | Medium | Very high |
| Create Docker Compose (app + postgres) | Medium | Very high |
| Set up GitHub Actions CI (build + test + lint) | Medium | High |
| Add structured logging (JSON + correlation ID) | Medium | High |
| Standardize error response envelope | Low | Medium |
| Fix PDF auth (pass JWT to Playwright context) | Medium | Medium |
| Add `@Version` for optimistic locking on Cv entity | Low | Medium |
| Extract `getCurrentUser()` to shared utility | Low | Low |

### Phase 3 — Advanced Architecture (3-4 weeks)

**Goal:** Features that demonstrate engineering depth.

| Task | Difficulty | Learning value |
|---|---|---|
| Resume duplication endpoint | Low | Low |
| Public share links (token-based, no auth) | Medium | High |
| Resume versioning (JSONB snapshots) | Medium | High |
| Autosave with debouncing | Medium | Medium |
| Break up CvEditor into sub-components | Medium | Medium |
| Pagination on CV list endpoint | Low | Medium |
| Spring Boot Actuator + Prometheus metrics | Low | High |
| Write 3-5 ADRs | Low | High |
| Rate limiting on auth endpoints | Medium | Medium |
| Health check endpoints for Docker | Low | Medium |

### Phase 4 — DevOps & Observability (4-6 weeks)

**Goal:** Production infrastructure.

| Task | Difficulty | Learning value |
|---|---|---|
| Grafana + Prometheus in Docker Compose | Medium | Very high |
| API latency + error rate dashboards | Medium | High |
| Loki + Promtail for centralized logging | Medium | High |
| Deploy to VPS (Docker Compose + Nginx + TLS) | Medium-High | Very high |
| Deploy step in GitHub Actions | Medium | High |
| Staging environment | Medium | High |
| Custom domain + HTTPS (Let's Encrypt) | Low | Medium |
| Architecture diagram in README | Low | Medium |

### Phase 5 — Showcase Enhancements (ongoing)

**Goal:** Polish and advanced features.

| Task | Difficulty | Learning value |
|---|---|---|
| Kubernetes deployment (Minikube first) | High | Very high |
| Helm chart | High | High |
| OpenTelemetry distributed tracing | Medium | High |
| Async PDF generation with message queue | High | Very high |
| ATS score checker | Medium | Medium |
| E2E tests with Playwright | Medium | Medium |
| Frontend testing with Vitest | Medium | Medium |
| Undo/redo in editor | Medium | Medium |

---

## Key Principle

> Phase 1 and 2 are where 80% of the interview value comes from. Don't skip ahead to Kubernetes before you have tests and Docker Compose working.

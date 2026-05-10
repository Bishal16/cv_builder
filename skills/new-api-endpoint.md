# New API Endpoint Workflow

Use this workflow when adding a new REST endpoint.

## Steps

1. **Define the contract**
   - Request/response JSON structure
   - HTTP method and path
   - Error codes

2. **Implementation order (Spring Boot)**
   - `Repository` - data access
   - `Service` - business logic
   - `Controller` - HTTP handling
   - `Dto` - request/response objects

3. **Testing**
   - Backend: `./gradlew test`
   - Manual test: `curl http://localhost:8081/api/...`

## Endpoint Template
```
Method: GET|POST|PUT|DELETE
Path: /api/<resource>
Request: { ... }
Response: { ... }
```

## Files to Update
- `AGENTS.md` - if architecture changes
- Frontend API client in `frontend/src/api/`
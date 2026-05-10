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
   - Unit test service
   - Integration test controller (if applicable)
   - Manual test with curl/httpie

## Endpoint Template
```
Method: GET|POST|PUT|DELETE
Path: /api/<resource>
Request: { ... }
Response: { ... }
Errors: 400, 404, 500
```

## Files to Update
- `AGENTS.md` - if architecture changes
- API client in frontend (`src/api/`)
- Any documentation
# Testing Workflow

Testing guidance for this project.

## Frontend

### Run Tests
```bash
cd frontend
npm run build    # TypeScript + build check
```

### Manual Testing
- Use browser dev tools
- Test API with curl:
```bash
curl http://localhost:8081/api/cv
```

## Backend

### Run Tests
```bash
cd backend
mvn test
mvn clean compile   # Quick compile check
```

## Coverage Goals
- Test critical paths
- Manual test for UI components
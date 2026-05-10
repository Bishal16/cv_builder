# Testing Workflow

Testing guidance for this project.

## Frontend (Vitest + React Testing Library)

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders component', () => {
  // Arrange: set up test data
  // Act: trigger the behavior
  // Assert: check the result
});
```

### Run Tests
```bash
cd frontend
npm test
npm test -- --watch  # Watch mode
npm test -- src/components/MyComponent.test.tsx  # Single file
```

### Test File Location
- Colocate tests next to source
- `Component.tsx` → `Component.test.tsx`

## Backend (JUnit)

### Unit Tests
```kotlin
@SpringBootTest
class MyServiceTest {
    @Test
    fun `should do something`() {
        // Given
        // When
        // Then
    }
}
```

### Run Tests
```bash
cd backend
./gradlew test
./gradlew test --tests "**/MyServiceTest*"  # Single test
```

## Coverage
- Aim for meaningful coverage, not 100%
- Test critical paths and edge cases
- Integration tests for API endpoints
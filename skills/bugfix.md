# Bugfix Workflow

Use this workflow when fixing bugs.

## Steps

1. **Reproduce the bug**
   - Get exact steps to trigger
   - Note expected vs actual behavior

2. **Identify root cause**
   - Search for relevant code
   - Check logs/error messages

3. **Fix the issue**
   - Minimal change principle
   - Don't break existing functionality

4. **Verify**
   - Reproduce the steps - bug should be gone
   - Run builds: `npm run build` (frontend) + `mvn clean compile` (backend)

## Bug Report Template
```
Title: <concise description>
Steps: <how to reproduce>
Expected: <what should happen>
Actual: <what happens>
```
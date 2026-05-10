# Bugfix Workflow

Use this workflow when fixing bugs.

## Steps

1. **Reproduce the bug**
   - Get exact steps to trigger
   - Note expected vs actual behavior
   - Check if it's frontend, backend, or both

2. **Identify root cause**
   - Search for relevant code
   - Check logs/error messages
   - Use explore agent for complex cases

3. **Fix the issue**
   - Minimal change principle
   - Don't break existing functionality
   - Consider edge cases

4. **Verify**
   - Reproduce the steps - bug should be gone
   - Run lint + typecheck
   - Run related tests

5. **Consider regression**
   - Is this fix needed elsewhere?
   - Should tests be added?
   - Update docs if behavior changed

## Bug Report Template
```
Title: <concise description>
Steps: <how to reproduce>
Expected: <what should happen>
Actual: <what happens>
Severity: critical|high|medium|low
```
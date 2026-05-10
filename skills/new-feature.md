# New Feature Workflow

Use this workflow when adding a new CV section or major feature.

## Steps

1. **Understand the scope**
   - What data does this feature need?
   - Does it need API changes? UI changes? Both?
   - Which template(s) are affected?

2. **Plan the changes**
   - Backend: repository → service → controller
   - Frontend: types → api client → store → component → page
   - Data model migration if needed

3. **Implementation order**
   - Backend first (contract)
   - Then frontend
   - Then template rendering

4. **Verification**
   - Run lint + typecheck
   - Test the feature manually
   - Update any related skills/docs if patterns emerge

## Template

```
Feature: <name>
Data Model: <JSON structure>
API Impact: <endpoints affected>
Templates Affected: <list>
```

## Files to Update
- `AGENTS.md` - if new conventions emerge
- `skills/` - if reusable pattern found
- Tests for new code
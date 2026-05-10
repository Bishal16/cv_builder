# New Feature Workflow

Use this workflow when adding a new CV section or major feature.

## Steps

1. **Understand the scope**
   - What data does this feature need?
   - Does it need API changes? UI changes? Both?

2. **Plan the changes**
   - Backend: entity → repository → service → controller
   - Frontend: types → api client → store → component → page

3. **Implementation order**
   - Backend first (contract)
   - Then frontend
   - Then template rendering

4. **Verification**
   - Frontend: `npm run build`
   - Backend: `mvn clean compile`

## Files to Update
- `AGENTS.md` - if new conventions emerge
- `skills/` - if reusable pattern found
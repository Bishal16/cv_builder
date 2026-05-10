# New Component Workflow

Use this workflow when creating a new React component.

## Steps

1. **Check existing components**
   - Look in `src/components/` for similar patterns
   - Check `src/templates/` for template-specific components

2. **Component structure**
   ```
   src/components/
   ├── ui/              # Reusable UI primitives
   ├── cv/              # CV-specific components
   │   ├── PersonalInfo.tsx
   │   ├── ExperienceList.tsx
   │   └── ...
   └── layout/          # Layout components
   ```

3. **Naming conventions**
   - PascalCase file names
   - Folder same as component name
   - Colocate tests next to component

4. **Props interface**
   - Define interfaces in same file
   - Use descriptive names
   - Document complex props

## Verification
- `npm run lint`
- `npm run typecheck`
- Component renders correctly in preview
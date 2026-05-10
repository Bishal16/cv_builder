# New Component Workflow

Use this workflow when creating a new React component.

## Steps

1. **Check existing components**
   - Look in `src/components/` for similar patterns
   - Check `src/templates/` for template-specific components

2. **Component structure**
   ```
   src/components/
   ├── *.tsx            # One component per file
   └── CvEditor.tsx     # Main editor container
   ```

3. **Naming conventions**
   - PascalCase file names
   - Folder same as component name
   - Colocate tests next to component

4. **Props interface**
   - Define interfaces in same file
   - Import types from `../../types/cv`

## Verification
- `npm run build`
- Component renders correctly
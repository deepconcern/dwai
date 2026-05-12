# Dungeon World AI (FE)

## Coding Style

- Alphabetize whenever possible (ignoring times when that may break app logic). Some non-exhaustive examples:
  - imports (after all other import rules have been followed)
  - items in a dependencies array for hooks
  - items in an unordered array (or other set of data)
  - component props
  - CSS classes (it is OK to violate this rule for specificity reasons)
- Do not use default exports unless required to by a framework/library (for example, pages in Next.js)
- React components should use "fat arrow" (=>) function expressions combined with a `FC` annotation
- Props should be explicitly defined as a type with the name being the name of their component + "Props"
- Values passed to props should be memoized where possible (for example: event handlers should be created with `useCallback`)

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

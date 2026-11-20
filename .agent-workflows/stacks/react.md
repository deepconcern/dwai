# Stack: React

Optional conventions for React projects. Link this from the project's `AGENTS.md` to adopt it.

- **Let the React Compiler memoize.** Turn it on (for Next.js, `reactCompiler: true` in `next.config.ts`). Write event handlers as plain functions and compute derived values inline. Reach for `useMemo` or `useCallback` only as an escape hatch, for example to keep an effect's dependency stable, with a comment saying why.
- **Follow the Rules of React.** Keep the `react-hooks` lint rules on and never suppress them: the compiler skips a component that breaks them.
- **Document with JSDoc.** Put `/** ... */` on exported functions, components, and props types where it helps a reader: what it's for and anything non-obvious, not a restatement of the name.
- **Read the installed version's docs.** Frameworks such as Next.js change APIs and conventions between majors. Check the docs for the version in `package.json` (for Next.js, `node_modules/next/dist/docs/`) before writing code, and heed deprecation notices.
- **Test rules logic with the project's runner** (`bun test`, Vitest, or Jest): one `describe` per function, one `test` per rule, named as the rule. Prefer extracting rule helpers into plain functions you can test without rendering.

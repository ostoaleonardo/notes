# React Native Testing Library in this project

This project uses `@testing-library/react-native`. Its APIs and testing conventions can differ from your training data.
Before writing or changing RNTL tests, read the relevant guide in
`node_modules/@testing-library/react-native/docs/`, starting with
`node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`.
Prefer those package docs over stale assumptions, and follow deprecation notices.

This project uses the `test-renderer` peer dependency, never `react-test-renderer` directly. Import `render`, `renderHook`, and `act` from `@testing-library/react-native` only.

## Testing conventions for this project

- Prefer functional tests over component-rendering tests. Test pure logic and hook behavior directly; only render a component tree when the logic cannot be exercised otherwise.
- Business logic that needs storage/filesystem access should be a plain function taking those capabilities as explicit parameters (dependency injection), not a hook calling `useStorage()`/`useFileStorage()` internally. See `src/context/load-repository-data.js` + `src/hooks/use-repository-data.js` for the pattern. This keeps the logic testable with plain fake objects, no rendering required.
- When a hook is coupled to React Context (e.g. `useNotes`, `useTags`), test it with `renderHook` from `@testing-library/react-native`, wrapping it in the real Context provider and mocking sibling hooks (`useFileStorage`, `useStorage`, `useRepositories`) via `jest.mock`.
- Name `describe`/`test` blocks as plain sentences describing behavior (e.g. `describe('delete note', ...)`, `test('removes the note from state', ...)`), never as bare camelCase function names (e.g. not `describe('deleteNote', ...)`).
- No comments in test files.
- Avoid long lines; break object literals, mock setups, and multi-argument calls across multiple lines instead of cramming them onto one line.
- Before adding a test, check for unused code: unused imports, unused mock fields, unused variables.

## General conventions for this project

- No comments in code. If a line truly needs one (a non-obvious constraint or workaround), keep it to a short one-liner. Never explain what code does when the naming already makes it clear.
- No hardcoded/inline constants. Constants live in `src/constants/`, one file per concern.
- Don't strip working code from files just to force a clean git commit split; split by staging changes deliberately instead.
- Commit messages: `feat`/`fix` prefix, grouped by feature, lowercase English subject only, no emojis, no AI co-author trailer, subject-only (no body/description) unless asked otherwise.
- Prefer the codebase-memory MCP graph tools (`search_graph`, `trace_path`, etc.) over raw grep for structural code exploration.
- For an icon rendered inside a react-native-paper component that provides its own icon render-prop (`IconButton`, `Appbar.Action`, `MenuItem`'s `leadingIcon`, etc.), use `icon={(props) => <Icon {...props} />}` — spread the render-prop's own `props` (paper computes `color` from the theme/component state). Do not wrap it in a custom hook or component just to apply theme color; paper already provides it. Only when a specific call site needs a size other than the icon's own default should you pass explicit `width`/`height` inside that render function (e.g. `icon={(props) => <Icon width={16} height={16} {...props} />}`) — never a hook for this, since react-native-svg has no `size` prop, only `width`/`height`. Every icon component under `src/icons/` should default its `<Svg>` to `width='24' height='24'` so it matches paper's own default icon size when no override is given.
- On every change, consider render performance: memoize context provider `value` objects with `useMemo`, avoid passing new inline functions/objects as props to memoized children, and virtualize (`FlatList`) any list that can grow beyond a handful of items instead of `.map()` inside a `ScrollView`.

# State Architecture

## Existing State (unchanged)

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `mermaidInitializedRef` | `React.MutableRefObject<boolean>` | `false` | `DocContent` | Component-local (ref) |
| `lastHtmlRef` | `React.MutableRefObject<string>` | `''` | `DocContent` | Component-local (ref) |
| `observerRef` | `React.MutableRefObject<IntersectionObserver \| null>` | `null` | `DocContent` | Component-local (ref) |
| `contentRef` | `React.RefObject<HTMLDivElement>` | `null` | `DocContent` | DOM ref |

## New State

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `mermaidModule` | `typeof mermaid \| null` (module-level variable, not a ref) | `null` | `DocContent` | Module-level cache |

The module-level `mermaidModule` variable caches the dynamically imported mermaid module so it is only fetched once across all renders and component instances. It is not part of React state — it's a plain module-scoped variable that persists for the lifetime of the JS module.

## New Function

```typescript
// Module-level in DocContent.tsx
let mermaidModule: typeof import('mermaid').default | null = null;

async function loadMermaid(): Promise<typeof import('mermaid').default> {
  if (mermaidModule) return mermaidModule;
  const mod = await import('mermaid');
  mermaidModule = mod.default;
  return mermaidModule;
}
```
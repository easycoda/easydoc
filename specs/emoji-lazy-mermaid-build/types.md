# Shared TypeScript Types

No new shared types are introduced. Existing types from `src/types/doc.ts` continue to be used:

```typescript
// Already exists in src/types/doc.ts — referenced, not modified

export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
  [key: string]: unknown;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}
```

## DocContentProps (exists inline in DocContent.tsx, unchanged)

```typescript
interface DocContentProps {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  onHeadingsReady?: (headings: TocHeading[]) => void;
  onHeadingsVisible?: (headingId: string) => void;
}
```
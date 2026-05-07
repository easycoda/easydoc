# Directory Structure

```
easydoc-react-app/
├── docs/                              # Documentation source (Markdown files)
│   ├── en/
│   │   ├── index.md                   # Language landing page
│   │   ├── guide/
│   │   │   ├── getting-started.md
│   │   │   └── installation.md
│   │   └── api/
│   │       └── config.md
│   └── zh/
│       ├── index.md
│       ├── guide/
│       │   ├── getting-started.md
│       │   └── installation.md
│       └── api/
│           └── config.md
├── public/
│   ├── logo.svg                       # (existing)
│   ├── robots.txt                     # (existing)
│   └── easydoc-runtime.min.js       # (existing)
├── src/
│   ├── App.tsx                        # (modify) Root with RouterProvider
│   ├── main.tsx                       # (modify) Entry point
│   ├── index.css                      # (existing) Tailwind + theme
│   ├── router.tsx                     # (new) React Router configuration
│   ├── assets/
│   │   └── logo.svg                   # (existing)
│   ├── components/
│   │   ├── theme-provider.tsx         # (existing)
│   │   ├── Layout.tsx                 # (new) Global shell layout
│   │   ├── Header.tsx                 # (new) Top navigation bar
│   │   ├── SearchTrigger.tsx          # (new) Search bar button
│   │   ├── SearchDialog.tsx           # (new) Command palette search
│   │   ├── ThemeToggle.tsx            # (new) Dark/light/system toggle
│   │   ├── LanguageSwitcher.tsx       # (new) Language dropdown
│   │   ├── DocSidebar.tsx             # (new) Documentation sidebar
│   │   ├── DocSidebarItem.tsx         # (new) Sidebar tree item
│   │   ├── TocSidebar.tsx             # (new) Table of contents
│   │   ├── DocContent.tsx             # (new) Rendered markdown HTML
│   │   ├── HeroSection.tsx            # (new) Home page hero
│   │   ├── FeatureCards.tsx           # (new) Home page features
│   │   ├── Footer.tsx                 # (new) Site footer
│   │   └── ui/                        # (existing) shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── command.tsx
│   │       ├── scroll-area.tsx
│   │       ├── card.tsx
│   │       ├── sidebar.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── collapsible.tsx
│   │       └── ...                    # (other existing shadcn/ui components)
│   ├── hooks/
│   │   ├── use-mobile.ts             # (existing)
│   │   ├── useDocData.ts             # (new) TanStack Query wrapper for doc data
│   │   ├── useTocHighlight.ts        # (new) IntersectionObserver for TOC
│   │   └── useSearch.ts              # (new) fuse.js search logic
│   ├── i18n/
│   │   ├── index.ts                  # (new) Translation lookup function
│   │   ├── en.ts                     # (new) English UI strings
│   │   └── zh.ts                     # (new) Chinese UI strings
│   ├── lib/
│   │   ├── utils.ts                  # (existing) cn() utility
│   │   └── search.ts                 # (new) fuse.js initialization
│   ├── pages/
│   │   ├── Home.tsx                  # (new) Landing page
│   │   ├── Doc.tsx                   # (new) Documentation page
│   │   ├── LangIndex.tsx             # (new) Language index / redirect
│   │   └── NotFound.tsx              # (new) 404 page
│   ├── plugins/
│   │   └── vite-plugin-easydoc.ts   # (new) Vite plugin
│   ├── services/
│   │   └── docService.ts             # (new) Data fetching functions
│   ├── store/
│   │   └── appStore.ts               # (new) Zustand store for locale
│   └── types/
│       ├── doc.ts                    # (new) Doc-related types
│       ├── i18n.ts                   # (new) i18n types
│       ├── config.ts                 # (new) Site config types
│       ├── vite-plugin.ts            # (new) Plugin option types
│       ├── store.ts                  # (new) Store types
│       └── hydration.ts             # (new) Hydration data types
├── index.html                         # (existing)
├── vite.config.ts                     # (modify) Add plugin
├── package.json                       # (modify) Add dependencies
├── tsconfig.json                      # (existing)
├── tsconfig.app.json                  # (existing)
├── tsconfig.node.json                 # (existing)
├── components.json                    # (existing)
└── eslint.config.js                   # (existing)
```
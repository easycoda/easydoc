/**
 * Type declarations for EasyDoc Vite virtual modules.
 *
 * These modules are resolved at build/dev time by vite-plugin-easydoc.
 * TypeScript cannot resolve them statically, so we provide ambient
 * declarations here.
 */

import type { DocPageData, DocManifest, SearchIndex } from './doc';

declare module 'virtual:easydoc-doc:*' {
  const doc: DocPageData;
  export default doc;
}

declare module 'virtual:easydoc-manifest:*' {
  const manifest: DocManifest;
  export default manifest;
}

declare module 'virtual:easydoc-search-index' {
  const index: SearchIndex;
  export default index;
}
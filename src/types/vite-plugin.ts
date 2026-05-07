/** Options passed to the EasyDoc Vite plugin */
export interface EasyDocPluginOptions {
  /** Root directory containing language folders */
  docsRoot: string;
  /** Supported locales */
  locales: string[];
  /** Default locale */
  defaultLocale: string;
  /** Output directory (relative to Vite outDir) */
  outDir?: string;
}

/** Virtual module ID prefix for doc data */
export const VIRTUAL_DOC_PREFIX = 'virtual:easydoc-doc:';

/** Virtual module ID for the search index */
export const VIRTUAL_SEARCH_INDEX = 'virtual:easydoc-search-index';

/** Virtual module ID for the doc manifest */
export const VIRTUAL_MANIFEST_PREFIX = 'virtual:easydoc-manifest:';
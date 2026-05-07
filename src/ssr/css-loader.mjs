/**
 * Minimal Node.js loader hook that transforms .css imports into empty modules.
 *
 * Used by the SSR/SSG pipeline so that components importing CSS files
 * (e.g. DocContent importing katex/dist/katex.min.css) don't crash
 * the Node.js ESM loader.
 *
 * Registered via `--import` or `module.register()`:
 *   node --import ./css-loader.mjs ...
 */

import { register } from 'node:module';

register('./css-loader-hook.mjs', import.meta.url);
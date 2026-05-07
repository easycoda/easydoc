/**
 * Node.js loader hook: transforms .css imports into empty modules.
 *
 * Works with --experimental-loader in Node >= 18, or via module.register()
 * in Node >= 20.
 */

const CSS_RE = /\.css(\?.*)?$/;

/** @type {import('node:module').ResolveHook} */
export async function resolve(specifier, context, nextResolve) {
  // Let Node handle bare specifiers and non-CSS files normally
  if (!CSS_RE.test(specifier)) {
    return nextResolve(specifier, context);
  }

  // CSS files: resolve as-is but mark with a special flag
  const resolved = await nextResolve(specifier, context);
  return {
    ...resolved,
    format: 'module',
  };
}

/** @type {import('node:module').LoadHook} */
export async function load(url, context, nextLoad) {
  if (CSS_RE.test(url)) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
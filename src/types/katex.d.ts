declare module 'katex/contrib/auto-render' {
  import type { KatexOptions } from 'katex';

  interface RenderMathInElementOptions {
    delimiters?: Array<{
      left: string;
      right: string;
      display: boolean;
    }>;
    ignoredTags?: string[];
    ignoredClasses?: string[];
    errorCallback?: (msg: string, err: Error) => void;
    throwOnError?: boolean;
    trust?: boolean | ((context: { command: string; url: string; protocol: string }) => boolean);
    macros?: Record<string, string>;
    strict?: boolean | string | ((...args: unknown[]) => unknown);
    preProcess?: (math: string) => string;
  }

  function renderMathInElement(
    element: HTMLElement,
    options?: RenderMathInElementOptions,
  ): void;

  export default renderMathInElement;
}
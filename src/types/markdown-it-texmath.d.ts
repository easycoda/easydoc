declare module 'markdown-it-texmath' {
  import type MarkdownIt from 'markdown-it';
  import type katex from 'katex';

  interface TexmathOptions {
    engine?: typeof katex;
    delimiters?: string | string[];
    katexOptions?: {
      macros?: Record<string, string>;
      throwOnError?: boolean;
      [key: string]: unknown;
    };
    outerSpace?: boolean;
  }

  function texmath(md: MarkdownIt, options?: TexmathOptions): void;

  export default texmath;
}
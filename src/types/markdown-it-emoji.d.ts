declare module 'markdown-it-emoji' {
  import type MarkdownIt from 'markdown-it';
  import type { PluginWithOptions } from 'markdown-it';

  interface EmojiOptions {
    defs?: Record<string, string>;
    shortcuts?: Record<string, string | string[]>;
    enabled?: string[];
  }

  /**
   * Full emoji plugin (includes all GitHub-style emojis + shortcuts).
   * Usage: md.use(fullMarkdownItEmoji)
   */
  export const full: PluginWithOptions<EmojiOptions>;

  /** Bare emoji plugin (no built-in emoji definitions). */
  export const bare: PluginWithOptions<EmojiOptions>;

  /** Light emoji plugin (subset of emojis, smaller footprint). */
  export const light: PluginWithOptions<EmojiOptions>;
}
import { useEffect } from 'react';

/**
 * Sets the browser tab title to the given string.
 * Updates whenever `title` changes.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
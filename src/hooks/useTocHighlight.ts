import { useState, useEffect, useRef } from 'react';
import type { TocHeading } from '@/types/doc';

/**
 * Tracks which heading is currently visible in the viewport using an
 * `IntersectionObserver`.
 *
 * @param headings - The array of TOC headings extracted from the document.
 * @returns The `id` of the currently active heading, or `null` if none.
 */
export function useTocHighlight(headings: TocHeading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Track which heading IDs are currently intersecting.
  const visibleHeadings = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Clean up previous observer.
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (headings.length === 0) {
      setActiveId(null);
      return;
    }

    visibleHeadings.current = new Set();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleHeadings.current.add(id);
          } else {
            visibleHeadings.current.delete(id);
          }
        }

        // Pick the "topmost" visible heading: the one whose element appears
        // first in the DOM among all intersecting headings.
        if (visibleHeadings.current.size > 0) {
          // Iterate headings in DOM order (which matches the `headings` array
          // order since the spec guarantees headings are listed top-to-bottom).
          for (const heading of headings) {
            if (visibleHeadings.current.has(heading.id)) {
              setActiveId(heading.id);
              return;
            }
          }
        }

        // No heading visible — keep the last known active one to avoid flicker.
        // If we want to clear it, we can do so, but keeping it is better UX.
      },
      {
        // Use a top margin so headings near the top of the viewport are
        // considered "visible" slightly before they actually enter.
        rootMargin: '-80px 0px -40% 0px',
        threshold: 0,
      },
    );

    // Observe all heading elements in the DOM.
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) {
        observerRef.current.observe(el);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  return activeId;
}
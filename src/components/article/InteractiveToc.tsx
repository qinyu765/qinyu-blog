'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TableOfContents } from '@/components/ui/TableOfContents';
import { TocItem } from '@/lib/toc';

interface InteractiveTocProps {
  headings: TocItem[];
  mode: 'mobile' | 'desktop';
}

// 1440px 是侧栏目录的极限断点；目录贴左后，文章标题卡仍保留最小安全间隙。
const DESKTOP_MEDIA_QUERY = '(min-width: 1440px)';

export const InteractiveToc = ({ headings, mode }: InteractiveTocProps) => {
  const [activeId, setActiveId] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const isScrollingLocked = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const syncEnabled = () => {
      setIsEnabled(mode === 'desktop' ? mediaQuery.matches : !mediaQuery.matches);
    };

    syncEnabled();
    mediaQuery.addEventListener('change', syncEnabled);

    return () => mediaQuery.removeEventListener('change', syncEnabled);
  }, [mode]);

  useEffect(() => {
    setActiveId('');
  }, [headings, mode]);

  useEffect(() => {
    if (!headings.length || !isEnabled) {
      setActiveId('');
      return;
    }

    let rafId = 0;

    const computeActive = () => {
      if (isScrollingLocked.current) return;

      let current = '';
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 120) {
          current = heading.id;
        }
      }

      if (current) {
        setActiveId(current);
      }
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        computeActive();
        rafId = 0;
      });
    };

    computeActive();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [headings, isEnabled]);

  const scrollToHeading = useCallback((headingId: string) => {
    const element = document.getElementById(headingId);
    if (!element) return;

    isScrollingLocked.current = true;
    setActiveId(headingId);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      isScrollingLocked.current = false;
    }, 800);
  }, []);

  if (!headings.length) {
    return null;
  }

  if (mode === 'mobile') {
    return (
      <div className="min-[1440px]:hidden mb-8">
        <TableOfContents
          headings={headings}
          activeId={activeId}
          onItemClick={scrollToHeading}
          collapsible
        />
      </div>
    );
  }

  return (
    <aside className="hidden min-[1440px]:block fixed top-24 left-0 w-64">
      <TableOfContents
        headings={headings}
        activeId={activeId}
        onItemClick={scrollToHeading}
      />
    </aside>
  );
};

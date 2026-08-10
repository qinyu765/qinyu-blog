'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHomeEntry } from '@/components/providers/HomeEntryProvider';
import {
  getHomeNavigationIntent,
  isPlainNavigationActivation,
} from '@/lib/home-entry';

interface SkewButtonProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  hoverActive?: boolean;
}

export const SkewButton: React.FC<SkewButtonProps> = ({ href, children, isActive, hoverActive = false }) => {
  const pathname = usePathname();
  const { prepareHomeSection, clearHomeSection } = useHomeEntry();
  const [targetPath] = href.split('?');
  const active = isActive !== undefined ? isActive : pathname === targetPath;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const activation = {
      button: event.button,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    };
    const intent = getHomeNavigationIntent({ pathname, href, activation });

    if (intent === 'clear') {
      clearHomeSection();
    } else if (intent !== null) {
      prepareHomeSection(intent);
    }

    const [pathPart, hashPart] = href.split('#');
    const path = pathPart || '/';

    if (pathname === path && isPlainNavigationActivation(activation)) {
      if (hashPart) {
        event.preventDefault();
        window.history.pushState(null, '', `#${hashPart}`);
        document.getElementById(hashPart)?.scrollIntoView({ behavior: 'smooth' });
      } else if (window.location.hash === '') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const bgClass = active
    ? 'bg-p3blue/10 border-p3blue/70'
    : hoverActive
      ? 'bg-transparent border-white/15 group-hover:bg-white/5 group-hover:border-p3blue/60'
      : 'bg-transparent border-white/15 group-hover:bg-p3blue/10 group-hover:border-p3blue/60';

  const textClass = active
    ? 'text-white'
    : hoverActive
      ? 'text-white/75 group-hover:text-white'
      : 'text-white/75 group-hover:text-white';

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      className="relative group block transition-transform duration-200 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark"
    >
      <div
        className={`
          absolute inset-0 transform -skew-x-12 transition-colors duration-200 ease-out
          border
          ${bgClass}
        `}
      />
      <div className="relative px-4 py-1.5">
        <span
          className={`
            font-display text-sm tracking-wide block
            transition-colors duration-300
            ${textClass}
          `}
        >
          {children}
        </span>
      </div>
    </Link>
  );
};

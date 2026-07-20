'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SkewButtonProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  hoverActive?: boolean;
}

export const SkewButton: React.FC<SkewButtonProps> = ({ href, children, isActive, hoverActive = false }) => {
  const pathname = usePathname();
  const [targetPath] = href.split('?');
  const active = isActive !== undefined ? isActive : pathname === targetPath;

  const handleClick = () => {
    const [pathPart, hashPart] = href.split('#');
    const path = pathPart || '/';

    // 如果想要跳转的地址与目前所在地址（包括 Hash）完全一致，手动接管滚动
    if (pathname === path && window.location.hash === (hashPart ? `#${hashPart}` : '')) {
      if (hashPart) {
        document.getElementById(hashPart)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const bgClass = active
    ? 'bg-p3blue/20 border-p3blue'
    : hoverActive
      ? 'bg-transparent border-white/20 group-hover:bg-white group-hover:border-p3blue'
      : 'bg-transparent border-white/20 group-hover:bg-p3blue/20 group-hover:border-p3blue';

  const textClass = active
    ? 'text-white font-bold'
    : hoverActive
      ? 'text-white group-hover:text-p3dark group-hover:font-bold'
      : 'text-white';

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      className="relative group block transition-transform duration-200 ease-out hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark"
    >
      <div
        className={`
          absolute inset-0 transform -skew-x-12 transition-all duration-200 ease-out
          border-[3px] group-hover:shadow-[3px_3px_0_0_rgba(18,105,204,0.5)]
          ${bgClass}
        `}
      />
      <div className="relative px-6 py-2">
        <span
          className={`
            font-display text-base tracking-wider transform skew-x-12 block
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

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types';

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems: NavItem[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  navItems,
}) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 半透明遮罩层 */}
      <div
        className={`
          fixed inset-0 bg-p3dark/60 backdrop-blur-sm
          z-[54]
          ${isMounted ? 'transition-opacity duration-300' : ''}
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* 右侧滑入菜单面板 */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-64 max-w-[65vw]
          bg-p3dark/95 backdrop-blur-md
          border-l-2 border-p3cyan
          transform
          z-[55]
          ${isMounted ? 'transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]' : ''}
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="absolute top-0 left-0 right-0 h-16 transform -skew-x-12 bg-p3blue/20 border-b-2 border-p3cyan/50" />

        <div className="pt-20 px-6 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  onToggle();
                  const [pathPart, hashPart] = item.path.split('#');
                  const path = pathPart || '/';
                  if (pathname === path && window.location.hash === (hashPart ? `#${hashPart}` : '')) {
                    if (hashPart) {
                      document.getElementById(hashPart)?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className={`
                  relative group block w-full
                  transform -skew-x-12 transition-all duration-300
                  border-2
                  ${isActive ? 'bg-white border-p3blue' : 'bg-transparent border-white hover:bg-p3blue/50'}
                `}
              >
                <div className="relative px-8 py-3 transform skew-x-12">
                  <span
                    className={`
                      font-display text-lg tracking-wider block
                      transition-colors duration-300
                      ${isActive ? 'text-p3dark font-bold' : 'text-white group-hover:text-p3cyan'}
                    `}
                  >
                    {item.label}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-2 h-2 bg-p3cyan rotate-45 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="h-1 bg-gradient-to-r from-p3blue via-p3cyan to-p3blue opacity-50" />
        </div>
      </div>
    </>
  );
};

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative z-[60] w-10 h-10 flex items-center justify-center pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <div className="absolute inset-0 transform -skew-x-12 bg-p3white border-2 border-p3blue shadow-[3px_3px_0px_rgba(18,105,204,0.5)]" />

      <div className="relative z-10 transform skew-x-12 p-2.5">
        <span
          className={`
            block w-5 h-0.5 bg-p3dark
            transition-[transform] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
        <span
          className={`
            block w-5 h-0.5 bg-p3dark mt-1.5
            transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}
          `}
        />
        <span
          className={`
            block w-5 h-0.5 bg-p3dark mt-1.5
            transition-[transform] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
      </div>
    </button>
  );
};

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { SkewButton } from '@/components/ui/SkewButton';
import { HamburgerMenu, HamburgerButton } from '@/components/ui/HamburgerMenu';

const NAV_ITEMS = [
  { label: 'HOME', path: '/' },
  { label: 'BLOG', path: '/blog' },
  { label: 'ABOUT', path: '/#about' },
  { label: 'FAVORITES', path: '/#favorites' },
];

export const LayoutChrome = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSearchActive = pathname === '/blog' && searchParams.get('search') === '1';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 py-2 pb-8 px-4 md:px-8 flex items-center bg-p3black/60 backdrop-blur-md backdrop-saturate-150"
        style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' }}
      >
        <div className="hidden md:flex flex-1 min-w-0 items-center space-x-2 text-sm font-mono text-p3cyan tracking-wider">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/logo.svg"
              alt="Logo"
              width="512"
              height="512"
              className="h-10 w-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </Link>
          <span className="text-p3blue"> ❯❯ </span>
          <Link href="/" className="hover:text-white transition-colors">
            SYSTEM
          </Link>
          <span>//</span>
          {pathname === '/' ? (
            <span>ROOT</span>
          ) : (
            pathname
              .substring(1)
              .split('/')
              .map((segment, index, segments) => {
                const path = `/${segments.slice(0, index + 1).join('/')}`;
                return (
                  <span key={path} className="contents">
                    {index > 0 && <span>/</span>}
                    <Link
                      href={path}
                      className="hover:text-white transition-colors"
                    >
                      {decodeURIComponent(segment).toUpperCase()}
                    </Link>
                  </span>
                );
              })
          )}
        </div>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-end gap-2"
        >
          {NAV_ITEMS.map((item) => (
            <SkewButton key={item.path} href={item.path}>
              {item.label}
            </SkewButton>
          ))}
          <div className="ml-10">
            <SkewButton href="/blog?search=1" hoverActive isActive={isSearchActive}>
              <span className="flex items-center gap-1.5"><Search size={14} />Search</span>
            </SkewButton>
          </div>
        </nav>

        <div className="md:hidden flex items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/logo.svg"
              alt="Logo"
              width="512"
              height="512"
              className="h-8 w-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </Link>
        </div>

        <div className="md:hidden absolute right-4">
          <HamburgerButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </header>

      <HamburgerMenu
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
      />
    </>
  );
};

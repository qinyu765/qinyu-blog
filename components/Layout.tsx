import React, { useState, useEffect } from 'react';
import { NavItem } from '../types';
import { NAV_ITEMS } from '../constants';
import { SkewButton } from './ui/SkewButton';
import { BackgroundEffect } from './ui/BackgroundEffect';
import { HamburgerMenu, HamburgerButton } from './ui/HamburgerMenu';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Calendar, Battery } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();
  const date = new Date();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen relative font-body text-white selection:bg-p3cyan selection:text-black">
      <BackgroundEffect />

      {/* Header / Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">

        {/* Date / Day Indicator (Top Left) - Responsive sizing */}
        <div className="pointer-events-auto transform -skew-x-12 bg-white text-black md:px-6 md:py-4 px-4 py-2 shadow-[5px_5px_0px_rgba(0,85,255,0.8)] border-2 border-p3blue">
          <div className="transform skew-x-12 flex flex-col items-center leading-none">
            <span className="md:text-4xl text-2xl font-display font-black tracking-tighter">
              {date.getDate()}
            </span>
            <span className="md:text-sm text-xs font-bold tracking-widest uppercase">
              {date.toLocaleString('default', { month: 'short' })}
            </span>
            <span className="text-xs mt-1 bg-black text-white px-2 py-0.5 rounded-sm">
              {date.toLocaleString('default', { weekday: 'short' })}
            </span>
          </div>
        </div>

        {/* Desktop Navigation (Top Right) - Hidden on mobile */}
        <nav className="hidden md:flex pointer-events-auto flex-col items-end space-y-4">
          {NAV_ITEMS.map((item) => (
            <SkewButton key={item.path} to={item.path}>
              {item.label}
            </SkewButton>
          ))}
        </nav>

        {/* Mobile Hamburger Button - Hidden on desktop */}
        <div className="md:hidden">
          <HamburgerButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </header>

      {/* Mobile Menu Overlay and Panel */}
      <HamburgerMenu
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
      />

      {/* Main Content Area - Responsive padding-top */}
      <main className="md:pt-32 pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col relative z-10">
         {/* Breadcrumb / Path Indicator */}
         <div className="mb-8 flex items-center space-x-2 text-p3cyan/80 text-sm font-bold uppercase tracking-widest border-b border-p3cyan/30 pb-2 w-fit">
            <Menu size={16} />
            <span>SYSTEM</span>
            <span>//</span>
            <span>{location.pathname === '/' ? 'ROOT' : location.pathname.substring(1)}</span>
         </div>
         
         <Outlet />
      </main>

      {/* Floating Footer Elements */}
      <div className="fixed bottom-8 left-8 hidden md:flex flex-col space-y-2 text-xs font-mono text-white/50 z-40">
        <div className="flex items-center space-x-2">
           <Battery size={16} className="text-p3cyan" />
           <span>STATUS: WORKING</span>
        </div>
        <div>GITHUB_PAGES: DEPLOYED</div>
        <div>REACT_VER: 18.2.0</div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-p3blue to-p3cyan" />
    </div>
  );
};
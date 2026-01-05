import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../../types';

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
  const location = useLocation();

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          z-[54]
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* Sliding Menu Panel */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-80 max-w-[85vw]
          bg-p3dark/95 backdrop-blur-md
          border-l-2 border-p3cyan
          transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          z-[55]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 transform -skew-x-12 bg-p3blue/20 border-b-2 border-p3cyan/50" />

        {/* Nav Items Container */}
        <div className="pt-20 px-6 space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onToggle}
                className={`
                  relative group block w-full
                  transform -skew-x-12 transition-all duration-300
                  border-2
                  ${isActive ? 'bg-white border-p3blue' : 'bg-transparent border-white hover:bg-p3blue/50'}
                `}
              >
                {/* Text Container (Counter-skewed) */}
                <div className="relative px-12 py-5 transform skew-x-12">
                  <span
                    className={`
                      font-display text-2xl tracking-wider transform skew-x-12 block
                      transition-colors duration-300
                      ${isActive ? 'text-p3dark font-bold' : 'text-white group-hover:text-cyan-300'}
                    `}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-1/2 -left-4 w-2 h-2 bg-p3cyan rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Decorative Bottom Element */}
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
      className="relative z-[60] w-12 h-12 flex items-center justify-center pointer-events-auto"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {/* Skewed Background */}
      <div className="absolute inset-0 transform -skew-x-12 bg-white border-2 border-p3blue shadow-[3px_3px_0px_#0055FF]" />

      {/* Icon Container (Counter-skewed) */}
      <div className="relative z-10 transform skew-x-12 p-3">
        {/* Top Line */}
        <span
          className={`
            block w-6 h-0.5 bg-p3dark
            transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
        {/* Middle Line */}
        <span
          className={`
            block w-6 h-0.5 bg-p3dark mt-1.5
            transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}
          `}
        />
        {/* Bottom Line */}
        <span
          className={`
            block w-6 h-0.5 bg-p3dark mt-1.5
            transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
      </div>
    </button>
  );
};

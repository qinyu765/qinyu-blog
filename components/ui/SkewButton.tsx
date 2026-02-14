import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SkewButtonProps {
  to: string;
  children: React.ReactNode;
  isActive?: boolean;
  hoverActive?: boolean;
}

export const SkewButton: React.FC<SkewButtonProps> = ({ to, children, isActive, hoverActive = false }) => {
  const location = useLocation();
  const [targetPath] = to.split('?');
  const active = isActive !== undefined ? isActive : location.pathname === targetPath;

  const bgClass = active
    ? 'bg-white border-p3blue'
    : hoverActive
      ? 'bg-transparent border-p3blue group-hover:bg-white group-hover:border-p3blue'
      : 'bg-transparent border-p3blue group-hover:bg-p3blue/20';

  const textClass = active
    ? 'text-p3dark font-bold'
    : hoverActive
      ? 'text-white group-hover:text-p3dark group-hover:font-bold'
      : 'text-white group-hover:text-p3cyan';

  return (
    <Link to={to} aria-current={active ? "page" : undefined} className="relative group block transition-transform duration-200 ease-out hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark">
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

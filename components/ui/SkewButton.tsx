import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SkewButtonProps {
  to: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const SkewButton: React.FC<SkewButtonProps> = ({ to, children, isActive }) => {
  const location = useLocation();
  // If isActive is not explicitly passed, check the path
  const active = isActive !== undefined ? isActive : location.pathname === to;

  return (
    <Link to={to} className="relative group block">
      {/* Background shape */}
      <div 
        className={`
          absolute inset-0 transform -skew-x-12 transition-all duration-300
          border-2 border-white
          ${active ? 'bg-white' : 'bg-transparent hover:bg-p3blue/50'}
        `}
      />
      
      {/* Text Container (Counter-skewed to keep text straight) */}
      <div className="relative px-8 py-3 transform -skew-x-12">
        <span 
          className={`
            font-display text-xl tracking-wider transform skew-x-12 block
            transition-colors duration-300
            ${active ? 'text-p3dark font-bold' : 'text-white group-hover:text-cyan-300'}
          `}
        >
          {children}
        </span>
      </div>

      {/* Decorative dots */}
      {active && (
        <div className="absolute top-1/2 -left-4 w-2 h-2 bg-p3cyan rounded-full animate-pulse" />
      )}
    </Link>
  );
};
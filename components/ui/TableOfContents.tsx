import React, { useState } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { TocItem } from '../../lib/toc';

interface TableOfContentsProps {
  headings: TocItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  collapsible?: boolean;
}

const TocList: React.FC<Omit<TableOfContentsProps, 'collapsible'>> = ({ headings, activeId, onItemClick }) => (
  <ul className="space-y-1">
    {headings.map((item) => (
      <li key={item.id}>
        <button
          onClick={() => onItemClick(item.id)}
          className={`text-left w-full transition-all duration-200 group ${item.level > 2 ? 'pl-5' : ''}`}
        >
          <div className={`
            relative py-2 px-3 border-l-2 transition-all duration-200 flex items-center
            ${activeId === item.id
              ? 'border-p3cyan text-white font-bold bg-p3cyan/5'
              : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'}
          `}>
            <span className={`block ${item.level > 2 ? 'text-xs' : 'text-sm'} leading-snug`}>
              {item.text}
            </span>
          </div>
        </button>
      </li>
    ))}
  </ul>
);

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, activeId, onItemClick, collapsible }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!headings.length) return null;

  if (collapsible) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between bg-black/50 border border-white/20 p-4 hover:bg-black/80 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-p3cyan text-black p-1 transform -skew-x-12">
              <List size={16} className="transform skew-x-12" />
            </div>
            <span className="font-display font-bold uppercase tracking-wider text-p3cyan">Index</span>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && (
          <div className="border-x border-b border-white/20 bg-black/80 p-4 animate-in slide-in-from-top-2">
            <TocList
              headings={headings}
              activeId={activeId}
              onItemClick={(id) => { onItemClick(id); setIsOpen(false); }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="backdrop-blur-md p-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Contents</p>
      <TocList headings={headings} activeId={activeId} onItemClick={onItemClick} />
    </nav>
  );
};

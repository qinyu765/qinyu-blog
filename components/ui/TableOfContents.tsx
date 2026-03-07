import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { TocItem } from '../../lib/toc';

interface TableOfContentsProps {
  headings: TocItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  collapsible?: boolean;
}

const TocList: React.FC<Omit<TableOfContentsProps, 'collapsible'> & { isSlotMachine?: boolean }> = ({ headings, activeId, onItemClick, isSlotMachine }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  const activeIndex = headings.findIndex(h => h.id === activeId);
  const validActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  useEffect(() => {
    if (isSlotMachine && listRef.current) {
      const activeEl = listRef.current.children[validActiveIndex] as HTMLElement;
      if (activeEl) {
        setOffsetY(-activeEl.offsetTop + 120);
      }
    }
  }, [validActiveIndex, isSlotMachine, headings]);

  const containerStyle: React.CSSProperties = isSlotMachine ? {
    height: 'calc(100vh - 250px)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
  } : {};

  return (
    <div className={isSlotMachine ? "relative overflow-hidden" : ""} style={containerStyle}>
      <ul
        ref={listRef}
        className={`space-y-1 ${isSlotMachine ? 'transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''}`}
        style={isSlotMachine ? { transform: `translateY(${offsetY}px)` } : undefined}
      >
        {headings.map((item, index) => {
          const distance = index - validActiveIndex;
          const absDistance = Math.abs(distance);
          
          let liStyle: React.CSSProperties = {};
          if (isSlotMachine) {
            // 基本不怎么缩小，最小保持 0.95
            const scale = Math.max(0.95, 1 - absDistance * 0.005);
            // 透明度大幅度提升，最低保持在 0.6，且衰减极慢
            const opacity = Math.max(0.6, 1 - absDistance * 0.04);
            const rotateX = distance * 2; 
            const translateX = absDistance * 0.2;
            
            liStyle = {
              opacity,
              transform: `scale(${scale}) rotateX(${rotateX}deg) translateX(${translateX}px)`,
              transformOrigin: 'left center',
              transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            };
          }

          return (
            <li key={item.id} style={liStyle} className={isSlotMachine ? "will-change-transform perspective-[1000px]" : ""}>
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
          );
        })}
      </ul>
    </div>
  );
};

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
      {/* <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4 z-10 relative">Contents</p> */}
      <TocList headings={headings} activeId={activeId} onItemClick={onItemClick} isSlotMachine={true} />
    </nav>
  );
};

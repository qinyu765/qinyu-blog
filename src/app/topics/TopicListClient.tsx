'use client';

import React from 'react';
import Link from 'next/link';
import { Topic } from '@/types';
import { BookOpen } from 'lucide-react';
import { topicPath } from '@/lib/content/routes';

interface Props {
  topics: Topic[];
}

export const TopicListClient: React.FC<Props> = ({ topics }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-12">
      <h1 className="text-6xl md:text-8xl font-display font-black uppercase italic text-white leading-none">
        OPERATIONS
      </h1>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-12 h-1 bg-p3cyan -skew-x-12" />
        <p className="text-p3mid text-sm font-mono tracking-widest uppercase">Series / Topics</p>
      </div>
    </div>

    {topics.length === 0 ? (
      <div className="text-center py-20">
        <p className="text-p3mid text-lg font-mono">NO RECORDS FOUND</p>
        <p className="text-white/30 text-sm mt-2">Topics will appear here once created.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link
            key={topic.meta.slug}
            href={topicPath(topic.meta.slug)}
            className="group block border-l-4 border-white hover:border-p3cyan bg-white/5 hover:bg-white/[0.08] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-p3r-crosshatch opacity-10" />
            <div className="absolute -bottom-4 -right-4 text-7xl font-display font-black text-white/5 transform -skew-x-12 select-none uppercase pointer-events-none">
              TOPIC
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-p3cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="p-8 relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white group-hover:text-p3cyan transition-colors uppercase tracking-wide">
                  {topic.meta.title}
                </h2>
                <span className="flex-shrink-0 bg-p3red text-white text-xs font-mono px-3 py-1 flex items-center gap-2 transform -skew-x-12 shadow-md">
                  <span className="transform skew-x-12 flex items-center gap-1">
                    <BookOpen size={14} />
                    {topic.posts.length}
                  </span>
                </span>
              </div>

              <p className="text-p3mid text-sm leading-relaxed mb-8 flex-grow border-l-2 border-white/20 pl-4">
                {topic.meta.description}
              </p>

              {topic.meta.tags && topic.meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/10">
                  {topic.meta.tags.map((tag) => (
                    <span key={tag} className="inline-block -skew-x-12 border border-white/10 bg-white/5 px-2 py-0.5">
                      <span className="inline-block skew-x-12 text-p3mid text-xs font-mono uppercase">{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

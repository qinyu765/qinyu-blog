'use client';

import React from 'react';
import Link from 'next/link';
import { Topic } from '@/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { topicPostPath } from '@/lib/content/routes';

interface Props {
  topic: Topic;
}

export const TopicDetailClient: React.FC<Props> = ({ topic }) => {
  const { meta, posts, introContent } = topic;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* 返回链接 */}
      <Link href="/topics" className="group inline-flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-white/60 hover:text-p3cyan transition-colors mb-8">
        <div className="bg-white/10 p-2 transform -skew-x-12 group-hover:bg-p3cyan group-hover:text-black transition-colors">
          <div className="transform skew-x-12"><ChevronLeft size={16} /></div>
        </div>
        <span>All Topics</span>
      </Link>

      {/* 专题海报风格头部 */}
      <header className="mb-12 relative p-8 md:p-12 border-2 border-white/10 bg-p3dark/50 overflow-hidden">
        <div className="absolute inset-0 bg-p3r-crosshatch opacity-10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 text-[6rem] md:text-[10rem] font-display font-black text-white/5 transform -skew-x-12 select-none leading-none pointer-events-none whitespace-nowrap">
          SERIES
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-p3cyan via-p3blue to-transparent" />

        <div className="relative z-10">
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {meta.tags.map((tag) => (
                <span key={tag} className="inline-block -skew-x-12 border border-p3cyan/50 bg-p3cyan/10 px-3 py-1">
                  <span className="inline-block skew-x-12 text-p3cyan text-xs font-mono font-bold uppercase">{tag}</span>
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic leading-tight mb-6 text-white drop-shadow-lg">
            {meta.title}
          </h1>
          <p className="text-p3mid text-lg leading-relaxed max-w-2xl border-l-4 border-p3red pl-4 bg-black/20 py-2 pr-4">
            {meta.description}
          </p>
        </div>
      </header>

      {/* 系列介绍 */}
      {introContent && (
        <div className="bg-p3black p-6 md:p-8 border border-white/5 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-6 -translate-y-6" />
          <MarkdownRenderer content={introContent} />
        </div>
      )}

      {/* 文章列表 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-1 bg-p3blue -skew-x-12" />
          <h2 className="text-sm font-mono text-p3mid tracking-widest uppercase">
            {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
          </h2>
        </div>

        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={topicPostPath(meta.slug, post.slug)}
            className="group flex items-stretch gap-4 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-p3cyan/30 transition-all duration-300"
          >
            <div className="flex-shrink-0 w-16 flex items-center justify-center bg-white/5 group-hover:bg-p3blue/20 transition-colors border-r border-white/5">
              <span className="text-2xl font-mono font-bold text-p3mid group-hover:text-p3cyan transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="flex-1 py-4 pr-4">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-p3cyan transition-colors uppercase tracking-wide">
                  {post.title}
                </h3>
                <span className="text-xs font-mono text-p3mid">{post.date}</span>
              </div>
              <p className="text-p3mid text-sm leading-relaxed line-clamp-1">{post.excerpt}</p>
            </div>

            <div className="flex-shrink-0 flex items-center pr-4 text-white/20 group-hover:text-p3cyan transition-colors">
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MarkdownRenderer } from './MarkdownRenderer';
import Giscus from '@giscus/react';
import { estimateReadingTime } from '../lib/reading-time';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { extractHeadings, TocItem } from '../lib/toc';
import { TableOfContents } from './ui/TableOfContents';
import { BlogPost } from '../types';

interface ArticleViewProps {
  post: BlogPost;
  backLink: { to: string; label: string };
  prevPost?: { id: string; title: string; linkTo: string };
  nextPost?: { id: string; title: string; linkTo: string };
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post, backLink, prevPost, nextPost,
}) => {
  const headings = useMemo<TocItem[]>(
    () => extractHeadings(post.content),
    [post.content],
  );

  const [shareMsg, setShareMsg] = useState('');
  const [activeId, setActiveId] = useState('');
  const isScrollingLocked = React.useRef(false);

  useEffect(() => { setActiveId(''); }, [post.id]);

  useEffect(() => {
    if (!headings.length) { setActiveId(''); return; }
    const handleScroll = () => {
      if (isScrollingLocked.current) return;
      let current = '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) current = h.id;
      }
      if (current) setActiveId(current);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, post.id]);

  const scrollToHeading = useCallback((headingId: string) => {
    const el = document.getElementById(headingId);
    if (!el) return;
    
    isScrollingLocked.current = true;
    setActiveId(headingId);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // 平滑滚动通常需要一定时间，在此期间锁定自动计算。800ms大约能覆盖常见的滚动动画周期。
    setTimeout(() => {
      isScrollingLocked.current = false;
    }, 800);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  }, [post.title]);

  return (
    <div className="relative max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full min-w-0">
      <article>
        <div className="flex justify-between items-center mb-8">
          <Link to={backLink.to} className="group flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-white/60 hover:text-p3cyan transition-colors">
            <div className="bg-white/10 p-2 transform -skew-x-12 group-hover:bg-p3cyan group-hover:text-black transition-colors">
              <div className="transform skew-x-12"><ChevronLeft size={16} /></div>
            </div>
            <span>{backLink.label}</span>
          </Link>
          <div className="relative">
            <button onClick={handleShare} className="text-white/60 hover:text-white transition-colors" aria-label="Share this post">
              <Share2 size={20} />
            </button>
            {shareMsg && <span className="absolute -bottom-8 right-0 text-xs text-p3cyan whitespace-nowrap">{shareMsg}</span>}
          </div>
        </div>

        <header className="mb-8 md:mb-12 relative p-5 md:p-12 border-2 border-white/10 bg-p3dark/50 overflow-hidden">
          {/* 背景大字与斜纹 */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-10 pointer-events-none" />
          <div className="absolute -right-8 -top-8 text-[8rem] md:text-[12rem] font-display font-black text-white/5 transform -skew-x-12 select-none leading-none pointer-events-none overflow-hidden">
            {post.category || 'ARTICLE'}
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-4 text-xs font-mono text-p3cyan mb-6">
              <span className="border border-p3cyan bg-p3cyan/10 px-3 py-1.5">{post.date}</span>
              <span className="bg-p3red text-white px-3 py-1.5 transform -skew-x-12"><span className="inline-block skew-x-12">{post.category}</span></span>
              <span className="border border-white/20 text-p3mid px-3 py-1.5">{estimateReadingTime(post.content)} MIN READ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-black uppercase italic leading-tight text-white drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </header>

        {headings.length > 0 && (
          <div className="2xl:hidden">
            <TableOfContents headings={headings} activeId={activeId} onItemClick={scrollToHeading} collapsible />
          </div>
        )}

        <div className="bg-p3black p-4 sm:p-8 md:p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
          <MarkdownRenderer content={post.content} headings={headings} />
        </div>

        {import.meta.env.VITE_GISCUS_REPO_ID && import.meta.env.VITE_GISCUS_REPO_ID !== 'your-repo-id' && (
          <div className="mt-12 border border-white/10 p-6" key={post.id}>
            <Giscus
              repo={import.meta.env.VITE_GISCUS_REPO as `${string}/${string}`}
              repoId={import.meta.env.VITE_GISCUS_REPO_ID}
              category={import.meta.env.VITE_GISCUS_CATEGORY}
              categoryId={import.meta.env.VITE_GISCUS_CATEGORY_ID}
              mapping="specific"
              term={post.id}
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme="dark_dimmed"
              lang="zh-CN"
            />
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="text-center mb-8">
            <p className="text-sm text-p3mid/50 mb-2">END OF RECORD</p>
            <div className="w-2 h-2 bg-p3red shadow-[0_0_10px_rgba(244,2,32,0.75)] transform rotate-45 mx-auto animate-pulse" />
          </div>
          <div className="flex justify-between items-stretch gap-4">
            {prevPost ? (
              <Link to={prevPost.linkTo} className="group flex items-center space-x-3 text-sm text-white/50 hover:text-p3cyan transition-colors min-w-0">
                <ChevronLeft size={16} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest mb-1">Prev</div>
                  <div className="font-bold uppercase truncate">{prevPost.title}</div>
                </div>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link to={nextPost.linkTo} className="group flex items-center space-x-3 text-sm text-white/50 hover:text-p3cyan transition-colors text-right min-w-0">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest mb-1">Next</div>
                  <div className="font-bold uppercase truncate">{nextPost.title}</div>
                </div>
                <ChevronRight size={16} />
              </Link>
            ) : <div />}
          </div>
        </div>
      </article>

      {headings.length > 0 && (
        <aside className="hidden 2xl:block fixed top-24 left-8 w-64">
          <TableOfContents headings={headings} activeId={activeId} onItemClick={scrollToHeading} />
        </aside>
      )}
    </div>
  );
};

import Link from 'next/link';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { estimateReadingTime } from '@/lib/reading-time';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { extractHeadings } from '@/lib/toc';
import { DeferredComments } from '@/components/article/DeferredComments';
import { InteractiveToc } from '@/components/article/InteractiveToc';
import { ShareButton } from '@/components/article/ShareButton';
import { BlogPost } from '@/types';

interface ArticleViewProps {
  post: BlogPost;
  backLink: { to: string; label: string };
  prevPost?: { id: string; title: string; linkTo: string };
  nextPost?: { id: string; title: string; linkTo: string };
}

export const ArticleView = ({
  post, backLink, prevPost, nextPost,
}: ArticleViewProps) => {
  const headings = extractHeadings(post.content);
  const readingTime = estimateReadingTime(post.content);

  return (
    <div className="relative max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full min-w-0">
      {headings.length > 0 && (
        <InteractiveToc headings={headings} mode="desktop" />
      )}

      <article>
        <div className="flex justify-between items-center mb-8">
          <Link href={backLink.to} className="group flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-white/60 hover:text-p3cyan transition-colors">
            <div className="bg-white/10 p-2 transform -skew-x-12 group-hover:bg-p3cyan group-hover:text-black transition-colors">
              <div className="transform skew-x-12"><ChevronLeft size={16} /></div>
            </div>
            <span>{backLink.label}</span>
          </Link>
          <ShareButton title={post.title} />
        </div>

        <header className="mb-8 md:mb-12 relative p-5 md:p-12 border-2 border-white/10 bg-p3dark/50 overflow-hidden">
          {/* 背景大字与斜纹 */}
          <div className="absolute inset-0 bg-p3r-crosshatch opacity-10 pointer-events-none" />
          <div className="absolute -right-8 -top-8 text-[8rem] md:text-[12rem] font-display font-black text-white/5 transform -skew-x-12 select-none leading-none pointer-events-none overflow-hidden">
            {post.category || 'ARTICLE'}
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-4 text-xs font-mono text-p3cyan mb-6">
              <span className="border border-p3cyan bg-p3cyan/10 px-3 py-1.5">{post.date}</span>
              <span className="bg-p3red text-white px-3 py-1.5 transform -skew-x-12"><span className="inline-block skew-x-12">{post.category}</span></span>
              <span className="border border-white/20 text-p3mid px-3 py-1.5">{readingTime} MIN READ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-black uppercase italic leading-tight text-white drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </header>

        {headings.length > 0 && (
          <InteractiveToc headings={headings} mode="mobile" />
        )}

        <div className="bg-p3black p-4 sm:p-8 md:p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
          <MarkdownRenderer content={post.content} headings={headings} />
        </div>

        <DeferredComments term={post.id} />

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="text-center mb-8">
            <p className="text-sm text-p3mid/50 mb-2">END OF RECORD</p>
            <div className="w-2 h-2 bg-p3red shadow-[0_0_10px_rgba(244,2,32,0.75)] transform rotate-45 mx-auto animate-pulse" />
          </div>
          <div className="flex justify-between items-stretch gap-4">
            {prevPost ? (
              <Link href={prevPost.linkTo} className="group flex items-center space-x-3 text-sm text-white/50 hover:text-p3cyan transition-colors min-w-0">
                <ChevronLeft size={16} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest mb-1">Prev</div>
                  <div className="font-bold uppercase truncate">{prevPost.title}</div>
                </div>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link href={nextPost.linkTo} className="group flex items-center space-x-3 text-sm text-white/50 hover:text-p3cyan transition-colors text-right min-w-0">
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
    </div>
  );
};

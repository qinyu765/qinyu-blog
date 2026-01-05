import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { BLOG_POSTS } from '../constants';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ChevronLeft, Share2 } from 'lucide-react';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find((p) => p.id === id);

  if (!post) {
    return <Navigate to="/" replace />;
  }

  return (
    <article className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Post Navigation Header */}
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="group flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-white/60 hover:text-p3cyan transition-colors">
           <div className="bg-white/10 p-2 rounded-full group-hover:bg-p3cyan group-hover:text-black transition-colors">
             <ChevronLeft size={16} />
           </div>
           <span>Return to Base</span>
        </Link>
        <button className="text-white/60 hover:text-white transition-colors">
           <Share2 size={20} />
        </button>
      </div>

      {/* Post Header */}
      <header className="mb-12 relative">
         <div className="absolute -left-4 md:-left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-p3cyan via-p3blue to-transparent" />
         
         <div className="flex flex-wrap gap-4 text-xs font-mono text-p3cyan mb-4">
            <span className="border border-p3cyan px-2 py-1">{post.date}</span>
            <span className="bg-p3blue text-white px-2 py-1">{post.category}</span>
         </div>

         <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic leading-tight mb-6">
            {post.title}
         </h1>

         {post.coverImage && (
           <div className="relative w-full aspect-[21/9] overflow-hidden border-2 border-white/20">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent opacity-80" />
           </div>
         )}
      </header>

      {/* Content */}
      <div className="bg-black/40 backdrop-blur-sm p-8 md:p-12 border border-white/5 relative overflow-hidden">
         {/* Decorative Corner */}
         <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
         
         <MarkdownRenderer content={post.content} />
      </div>

      {/* Footer / Read Next */}
      <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
         <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">END OF RECORD</p>
            <div className="w-2 h-2 bg-p3cyan rounded-full mx-auto animate-pulse" />
         </div>
      </div>
    </article>
  );
};
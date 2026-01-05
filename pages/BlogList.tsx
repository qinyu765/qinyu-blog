import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../constants';

export const BlogList: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-6xl font-display font-black italic mb-12 text-white/20">ARCHIVE</h1>
      
      <div className="space-y-4">
        {BLOG_POSTS.map((post, index) => (
          <Link 
            key={post.id} 
            to={`/blog/${post.id}`}
            className="group block relative"
          >
            <div className="absolute inset-0 bg-p3blue transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />
            
            <div className="relative z-10 flex items-center p-6 border-b border-white/20 group-hover:border-transparent transition-colors">
               <div className="font-mono text-p3cyan text-lg w-32 shrink-0">{post.date}</div>
               <div className="flex-grow">
                 <h2 className="text-2xl font-bold uppercase group-hover:text-white transition-colors">{post.title}</h2>
                 <p className="text-sm text-gray-400 group-hover:text-white/80 line-clamp-1">{post.excerpt}</p>
               </div>
               <div className="text-4xl font-display italic text-white/10 group-hover:text-white/30 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
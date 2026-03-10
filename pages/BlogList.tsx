import React, { useState, useDeferredValue, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BLOG_POSTS } from "../constants";
import { Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { useSEO } from "../lib/use-seo";

const fuse = new Fuse(BLOG_POSTS, {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "excerpt", weight: 0.35 },
    { name: "category", weight: 0.15 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export const BlogList: React.FC = () => {
  useSEO({ title: 'Blog', description: '所有文章列表 — 前端技术分享与实践', path: '/blog' });
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearchExpanded = searchParams.get("search") === "1";

  useEffect(() => {
    if (!isSearchExpanded) {
      setQuery("");
      return;
    }
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 170);
    return () => window.clearTimeout(timer);
  }, [isSearchExpanded]);

  const handleSearchDismiss = () => {
    if (query) {
      setQuery("");
      return;
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      return next;
    }, { replace: true });
  };

  const deferredQuery = useDeferredValue(query.trim());

  const filteredPosts = useMemo(() => {
    if (!deferredQuery) return BLOG_POSTS;
    return fuse.search(deferredQuery).map((r) => r.item);
  }, [deferredQuery]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      {/* 搜索栏：默认隐藏，?search=1 时展开 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isSearchExpanded
            ? "max-h-20 mb-10 opacity-100 translate-y-0"
            : "max-h-0 mb-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-w-lg ml-4">
          <div className="relative transform -skew-x-12 border border-p3white bg-p3black hover:border-p3white transition-colors">
            <div className="flex items-center px-5 py-3 skew-x-12">
              <Search size={18} className="text-p3white shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search blog posts"
                tabIndex={isSearchExpanded ? 0 : -1}
                placeholder="> SEARCH ARCHIVES..."
                className="w-full bg-transparent border-none outline-none text-p3cyan font-mono placeholder-p3cyan/40 ml-3 text-sm caret-p3red"
              />
              {isSearchExpanded && (
                <button type="button" onClick={handleSearchDismiss} aria-label={query ? "Clear search" : "Close search"} className="text-white hover:text-p3red transition-colors shrink-0">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => {
            const yearStr = post.date.substring(0, 4);
            const prevPost = index > 0 ? filteredPosts[index - 1] : null;
            const prevYearStr = prevPost ? prevPost.date.substring(0, 4) : null;
            const showYear = yearStr !== prevYearStr;

            return (
              <React.Fragment key={post.id}>
                {showYear && (
                  <div className="relative mt-12 mb-8 group">
                    <div className="text-5xl md:text-7xl font-display font-black italic text-p3white tracking-tighter mix-blend-screen opacity-80">
                      {yearStr}
                    </div>
                    {/* 装饰线条 */}
                    <div className="absolute left-0 bottom-2 w-full h-[2px] bg-gradient-to-r from-p3cyan via-p3cyan/20 to-transparent transform -skew-x-12" />
                    <div className="absolute left-0 -bottom-1 w-1/3 h-[4px] bg-p3cyan transform -skew-x-12" />
                  </div>
                )}
                <Link
                  to={`/blog/${post.id}`}
                  className="group block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark"
                >
                  <div className="absolute inset-0 bg-p3blue transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />

                  <div className="relative z-10 flex items-center p-6 border-b border-white/20 group-hover:border-transparent transition-colors">
                    <div className="font-mono text-p3cyan text-lg w-32 shrink-0">
                      {post.date}
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-2xl font-bold uppercase group-hover:text-white transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-p3mid/70 group-hover:text-white/80 line-clamp-1">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="text-4xl font-display italic text-white/10 group-hover:text-white/30 transition-colors">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                  </div>
                </Link>
              </React.Fragment>
            );
          })
        ) : (
          <div className="text-center py-20">
            <div className="text-3xl font-display italic text-white/20 mb-4">NO RECORDS FOUND</div>
            <div className="w-3 h-3 bg-p3red shadow-[0_0_12px_rgba(244,2,32,0.8)] mx-auto animate-spin rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};

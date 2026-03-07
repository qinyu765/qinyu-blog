import React from "react";
import { Link } from "react-router-dom";
import { BLOG_POSTS } from "../constants";
import { ArrowRight, Star } from "lucide-react";
import { P3RDialogUI } from "../components/P3RDialogUI";

export const Home: React.FC = () => {
  if (!BLOG_POSTS.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-display font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-p3mid">
          PERSONA
          <br />
          BLOG
        </h1>
        <p className="mt-8 text-xl text-p3cyan font-light tracking-widest">
          No records found in the archive.
        </p>
      </div>
    );
  }

  const latestPost = BLOG_POSTS[0];
  const otherPosts = BLOG_POSTS.slice(1);

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-16 items-center">
          {/* Typography Graphic */}
          <div className="space-y-6 z-10">
            {/* <div className="flex justify-center max-w-md">
              <div className="relative">
                <div className="absolute -inset-4 bg-p3cyan/10 blur-3xl rounded-full animate-pulse" />
                <img src="/logo.svg" alt="Logo" className="relative w-48 sm:w-64 md:w-80 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" />
              </div>
            </div> */}
            <p className="text-sm md:text-base font-light border border-p3blue/30 border-l-[4px] border-l-p3blue bg-p3dark/90 px-6 py-5 backdrop-blur-md max-w-lg text-p3white/90 leading-relaxed shadow-[3px_3px_0_0_rgba(18,105,204,0.5)]">
              简单写写博客，记录一些想法和经历。偶尔也会分享一些有趣的资源和工具。欢迎来到我的个人博客！希望你能在这里找到一些有价值的内容。
            </p>
          </div>

          {/* Featured Post Card (High Impact) */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-p3cyan/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Link
              to={`/blog/${latestPost.id}`}
              className="block relative transform transition-transform duration-300"
            >
              {/* Header Label */}
              <div className="absolute -top-4 -left-4 z-20 bg-p3red text-p3black px-4 py-1 transform -skew-x-12 font-bold shadow-lg">
                FEATURED ENTRY
              </div>

              <div className="bg-p3dark/90 backdrop-blur-md border border-white/20 p-8 relative overflow-hidden group-hover:border-p3cyan transition-colors">
                {/* 粗犷的背景纹理与大字 */}
                <div className="absolute inset-0 bg-gradient-to-br from-p3blue/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 text-8xl md:text-9xl font-display font-black text-white/5 transform -skew-x-12 select-none uppercase pointer-events-none">
                  {latestPost.category || 'ENTRY'}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center text-p3cyan/80 text-sm font-mono mb-6 border-b border-white/10 pb-4">
                    <span className="bg-p3cyan/10 px-2 py-1">{latestPost.date}</span>
                    <span className="border border-p3cyan/30 px-2 py-1 -skew-x-12"><span className="inline-block skew-x-12">{latestPost.category}</span></span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6 text-white group-hover:text-p3cyan transition-colors leading-tight">
                    {latestPost.title}
                  </h2>
                  <p className="text-p3mid font-light text-base md:text-lg leading-relaxed border-l-4 border-p3red pl-4">
                    {latestPost.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Entries List */}
      <section className="space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-1 flex-grow bg-white/20"></div>
          <h3 className="text-2xl font-display italic text-white/80">
            RECENT LOGS
          </h3>
          <div className="h-1 w-12 bg-p3cyan"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group relative block bg-p3dark/70 border-l-4 border-white hover:border-p3cyan transition-colors overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-p3blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star size={12} className="text-p3red" />
                    <span className="text-xs font-mono text-p3cyan">
                      {post.date}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold uppercase mb-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-p3mid/70">{post.excerpt}</p>
                </div>

                <div className="mt-4 flex items-center justify-end text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                  <span>Read Protocol</span>
                  <ArrowRight
                    size={14}
                    className="ml-2 transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

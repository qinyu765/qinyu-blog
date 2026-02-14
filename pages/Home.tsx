import React from "react";
import { Link } from "react-router-dom";
import { BLOG_POSTS } from "../constants";
import { ArrowRight, Star } from "lucide-react";

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
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
          {/* Typography Graphic */}
          <div className="space-y-6 z-10">
            <div className="flex justify-center max-w-md">
              <div className="relative">
                <div className="absolute -inset-4 bg-p3cyan/10 blur-3xl rounded-full animate-pulse" />
                <img src="/logo.svg" alt="Logo" className="relative w-48 sm:w-64 md:w-80 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" />
              </div>
            </div>
            <p className="text-base md:text-lg font-light border-l-4 border-p3blue pl-4 bg-black/40 py-3 backdrop-blur-sm max-w-md text-p3white/80 leading-relaxed">
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

              <div className="bg-white/5 backdrop-blur-md border border-white/20 p-1">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={latestPost.coverImage}
                    alt={latestPost.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="p-6 bg-p3dark/90 border-t border-p3blue">
                  <div className="flex justify-between items-center text-p3blue text-xs font-mono mb-2">
                    <span>{latestPost.date}</span>
                    <span>{latestPost.category}</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold uppercase mb-4 text-white group-hover:text-p3cyan transition-colors">
                    {latestPost.title}
                  </h2>
                  <p className="text-p3mid line-clamp-3 font-light text-sm">
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

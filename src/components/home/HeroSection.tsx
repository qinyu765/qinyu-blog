import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types";
import { blogPostPath } from "@/lib/content/routes";

interface HeroSectionProps {
  latestPost: BlogPost;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ latestPost }) => {
  return (
    <section className="relative w-full min-h-[50vh] flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-16 items-center">
        {/* 介绍文案 */}
        <div className="space-y-6 z-10">
          <p className="text-sm md:text-base font-light border border-p3blue/30 border-l-[4px] border-l-p3blue bg-p3dark/90 px-6 py-5 backdrop-blur-md max-w-lg text-p3white/90 leading-relaxed shadow-[3px_3px_0_0_rgba(18,105,204,0.5)]">
            简单写写博客，记录一些想法和经历。偶尔也会分享一些有趣的资源和工具。欢迎来到我的个人博客！希望你能在这里找到一些有价值的内容。
          </p>
        </div>

        {/* Featured Post Card */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-p3cyan/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Link
            href={blogPostPath(latestPost.id)}
            className="block relative transform transition-transform duration-300"
          >
            {/* Header Label */}
            <div className="absolute -top-4 -left-4 z-20 bg-p3red text-p3black px-4 py-1 transform -skew-x-12 font-bold shadow-lg">
              FEATURED ENTRY
            </div>

            <div className="bg-p3dark/90 backdrop-blur-md border border-white/20 p-8 relative overflow-hidden group-hover:border-p3cyan transition-colors">
              {/* 背景纹理与大字 */}
              <div className="absolute inset-0 bg-gradient-to-br from-p3blue/10 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-p3r-crosshatch opacity-20 pointer-events-none" />
              <div className="absolute -right-4 -bottom-4 text-8xl md:text-9xl font-display font-black text-white/5 transform -skew-x-12 select-none uppercase pointer-events-none">
                {latestPost.category || 'ENTRY'}
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center text-p3cyan/80 text-sm font-mono mb-6 border-b border-white/10 pb-4">
                  <span className="bg-p3cyan/10 px-2 py-1">{latestPost.date}</span>
                  <span className="border border-p3cyan/30 px-2 py-1 -skew-x-12"><span className="inline-block skew-x-12">{latestPost.category}</span></span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6 text-white transition-colors leading-tight">
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
  );
};

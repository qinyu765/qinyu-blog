import React from "react";
import { BlogPost } from "@/types";
import { MarqueePostCard } from "./MarqueePostCard";

interface RecentLogsProps {
  posts: BlogPost[];
}

export const RecentLogs: React.FC<RecentLogsProps> = ({ posts }) => {
  if (!posts.length) {
    return null;
  }

  const buildMarqueeBase = (items: BlogPost[]) => {
    const repeatCount = Math.ceil(5 / items.length);
    return Array.from({ length: repeatCount }, () => items)
      .flat()
      .slice(0, Math.max(5, items.length));
  };

  const base1 = buildMarqueeBase(posts);
  const base2 = buildMarqueeBase([...posts].reverse());

  const finalRow1 = [...base1, ...base1];
  const finalRow2 = [...base2, ...base2];

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-1 flex-grow bg-white/20"></div>
        <h3 className="text-2xl font-display italic text-white/80">
          RECENT LOGS
        </h3>
        <div className="h-1 w-12 bg-p3cyan"></div>
      </div>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden flex flex-col gap-6 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-16 md:before:w-32 before:bg-gradient-to-r before:from-p3dark before:to-transparent before:z-20 before:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-16 md:after:w-32 after:bg-gradient-to-l after:from-p3dark after:to-transparent after:z-20 after:pointer-events-none">
        {/* Row 1 - Marquee Left */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-4 will-change-transform">
          {finalRow1.map((post, index) => (
            <MarqueePostCard key={`row1-${post.id}-${index}`} post={post} />
          ))}
        </div>

        {/* Row 2 - Marquee Right */}
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] gap-6 px-4 will-change-transform">
          {finalRow2.map((post, index) => (
            <MarqueePostCard key={`row2-${post.id}-${index}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

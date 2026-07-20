import React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { BlogPost } from "@/types";
import { blogPostPath } from "@/lib/content/routes";

interface MarqueePostCardProps {
  post: BlogPost;
}

export const MarqueePostCard: React.FC<MarqueePostCardProps> = ({ post }) => {
  return (
    <Link
      href={blogPostPath(post.id)}
      className="w-[280px] md:w-[380px] shrink-0 group relative block bg-p3dark/70 border-l-4 border-white hover:border-p3cyan transition-colors overflow-hidden h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-p3blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Star size={12} className="text-p3red" />
            <span className="text-xs font-mono text-p3cyan">
              {post.date}
            </span>
          </div>
          <h4 className="text-xl font-bold uppercase mb-2 line-clamp-2">
            {post.title}
          </h4>
          <p className="text-sm text-p3mid/70 line-clamp-3">{post.excerpt}</p>
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
  );
};

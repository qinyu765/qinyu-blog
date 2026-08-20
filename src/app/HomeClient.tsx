'use client';

import React, { useLayoutEffect } from 'react';
import { BlogPost } from '@/types';
import { CategoryGroup } from '@/lib/favorites';
import {
  getHomeSectionFromHash,
  shouldClearHomeAnchor,
} from '@/lib/home-entry';
import { useHomeEntry } from '@/components/providers/HomeEntryProvider';
import { HeroSection } from '@/components/home/HeroSection';
import { RecentLogs } from '@/components/home/RecentLogs';
import { AboutSection } from '@/components/home/AboutSection';
import { FavoritesSection } from '@/components/home/FavoritesSection';

interface HomeClientProps {
  posts: BlogPost[];
  favorites: CategoryGroup[];
}

export const HomeClient: React.FC<HomeClientProps> = ({ posts, favorites }) => {
  const { pendingHomeSection, clearHomeSection } = useHomeEntry();

  useLayoutEffect(() => {
    const section = pendingHomeSection
      ?? getHomeSectionFromHash(window.location.hash);
    if (section === null) return;

    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (shouldClearHomeAnchor(pendingHomeSection, window.location.hash)) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }

    clearHomeSection();
  }, [clearHomeSection, pendingHomeSection]);

  if (!posts.length) {
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

  const latestPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <HeroSection latestPost={latestPost} />
      <RecentLogs posts={otherPosts} />
      <div>
        <AboutSection />
      </div>
      <div>
        <FavoritesSection favorites={favorites} />
      </div>
    </div>
  );
};

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const GiscusWidget = dynamic(() => import('@/components/article/GiscusWidget'), {
  ssr: false,
});

interface DeferredCommentsProps {
  term: string;
}

const COMMENTS_ROOT_MARGIN = '800px 0px';

export const DeferredComments = ({ term }: DeferredCommentsProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_GISCUS_REPO &&
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID &&
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID &&
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID !== 'your-repo-id',
  );

  useEffect(() => {
    if (!isConfigured || shouldLoad || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: COMMENTS_ROOT_MARGIN },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [isConfigured, shouldLoad]);

  if (!isConfigured) {
    return null;
  }

  return (
    <div className="mt-12" ref={sentinelRef}>
      <div className="border border-white/10 p-6 min-h-24" key={term}>
        {shouldLoad ? <GiscusWidget term={term} /> : null}
      </div>
    </div>
  );
};

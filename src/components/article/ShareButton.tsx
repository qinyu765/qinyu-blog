'use client';

import { useCallback, useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export const ShareButton = ({ title }: ShareButtonProps) => {
  const [shareMsg, setShareMsg] = useState('');

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 用户取消分享时不提示错误
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setShareMsg('Link copied!');
    window.setTimeout(() => setShareMsg(''), 2000);
  }, [title]);

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="text-white/60 hover:text-white transition-colors"
        aria-label="Share this post"
      >
        <Share2 size={20} />
      </button>
      {shareMsg && (
        <span className="absolute -bottom-8 right-0 text-xs text-p3cyan whitespace-nowrap">
          {shareMsg}
        </span>
      )}
    </div>
  );
};

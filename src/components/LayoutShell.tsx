import { ReactNode, Suspense } from 'react';
import { Github } from 'lucide-react';
import { BackgroundEffect } from '@/components/ui/BackgroundEffect';
import { LayoutChrome } from '@/components/LayoutChrome';
import { GITHUB_URL } from '@/lib/site';

interface LayoutShellProps {
  children: ReactNode;
}

export const LayoutShell = ({ children }: LayoutShellProps) => {
  return (
    <div className="min-h-screen relative font-body text-white selection:bg-p3cyan selection:text-black overflow-x-hidden">
      <BackgroundEffect />
      <Suspense>
        <LayoutChrome />
      </Suspense>
      <main className="md:pt-20 pt-16 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col relative z-10">
        {children}
      </main>
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pb-8">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-p3mid">
            HF&apos;S BLOG // EXTERNAL LINK
          </span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="访问 HF 的 GitHub 主页"
            className="inline-flex items-center gap-2 self-start text-p3cyan transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark sm:self-auto"
          >
            <Github size={18} aria-hidden="true" />
            <span className="font-display text-sm tracking-wider">GITHUB</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

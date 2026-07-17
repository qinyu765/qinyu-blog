import { ReactNode, Suspense } from 'react';
import { BackgroundEffect } from '@/components/ui/BackgroundEffect';
import { LayoutChrome } from '@/components/LayoutChrome';

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
    </div>
  );
};

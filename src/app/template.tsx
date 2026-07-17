import { LayoutShell } from '@/components/LayoutShell';

export default function Template({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}

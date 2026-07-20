import type { Metadata } from 'next';
import './globals.css';
import { websiteJsonLd, personJsonLd } from '@/lib/structured-data';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: `HF 的技术博客 — ${SITE_DESCRIPTION}`,
  keywords: ['计算机科学', '工程技术', '技术博客', 'JavaScript'],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary',
  },
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Noto+Sans+SC:wght@400;700;900&family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Cg transform='skewX(-12)' transform-origin='32 32'%3E%3Cpath d='M20 20 L28 20 L32 44 L26 44 Z' fill='%23F0F0F0'/%3E%3Cpath d='M44 20 L36 20 L34 36 L40 36 Z' fill='%231269CC'/%3E%3Ccircle cx='32' cy='50' r='2.5' fill='%231269CC'/%3E%3Cline x1='26' y1='44' x2='32' y2='50' stroke='%231269CC' stroke-width='1.5'/%3E%3Cline x1='34' y1='36' x2='32' y2='50' stroke='%231269CC' stroke-width='1.5'/%3E%3C/g%3E%3C/svg%3E"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </head>
      <body className="font-body text-white selection:bg-p3cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}

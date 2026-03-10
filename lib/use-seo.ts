import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  path?: string;
}

/**
 * 动态设置页面 title 和 meta description，提升 SEO
 */
export function useSEO({ title, description, path }: SEOHeadProps) {
  useEffect(() => {
    // 设置 title
    document.title = `${title} | HF's Blog`;

    // 设置 meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    // 设置 og:title
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = title;

    // 设置 og:description
    if (description) {
      let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDesc) ogDesc.content = description;
    }

    // 设置 og:url
    if (path) {
      let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
      if (ogUrl) ogUrl.content = `https://hflin.xyz${path}`;
    }
  }, [title, description, path]);
}

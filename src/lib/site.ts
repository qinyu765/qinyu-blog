export const SITE_URL = 'https://hflin.xyz';
export const SITE_NAME = "HF's Blog";
export const SITE_DESCRIPTION = '计算机科学技术分享与实践记录';

export function absoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(normalizedPath, `${SITE_URL}/`).toString();
}

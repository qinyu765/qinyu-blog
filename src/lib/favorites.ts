// Favorites image scanning — replaced import.meta.glob with Node.js fs
import fs from 'fs';
import path from 'path';

export interface FavoriteGroup {
  prefix: string;
  images: string[];
}

export interface CategoryGroup {
  category: string;
  groups: FavoriteGroup[];
}

function scanFavorites(): CategoryGroup[] {
  const dir = path.join(process.cwd(), 'public', 'images', 'Favorites');
  if (!fs.existsSync(dir)) return [];

  const exts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  const files = fs.readdirSync(dir).filter(f => exts.has(path.extname(f).toLowerCase()));
  const result: CategoryGroup[] = [];

  for (const filename of files) {
    const nameWithoutExt = filename.split('.')[0];
    const parts = nameWithoutExt.split('_');
    const category = parts.pop() || 'Other';
    const prefix = parts[0] || nameWithoutExt;
    const imgSrc = `/images/Favorites/${filename}`;

    let categoryObj = result.find(c => c.category === category);
    if (!categoryObj) {
      categoryObj = { category, groups: [] };
      result.push(categoryObj);
    }

    const groupObj = categoryObj.groups.find(g => g.prefix === prefix);
    if (groupObj) {
      groupObj.images.push(imgSrc);
    } else {
      categoryObj.groups.push({ prefix, images: [imgSrc] });
    }
  }

  result.sort((a, b) => a.category.localeCompare(b.category));
  return result;
}

export const categorizedFavorites = scanFavorites();

import { BlogPost, PostFrontmatter } from '../types';

// Simple frontmatter parser (YAML-like)
function parseFrontmatter(content: string): { data: PostFrontmatter; content: string } | null {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterText = match[1];
  const markdownContent = match[2].trim();

  // Parse simple key-value pairs
  const data: Partial<PostFrontmatter> = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    (data as any)[key] = value;
  }

  // Validate required fields
  if (!data.title || !data.date || !data.category || !data.excerpt) {
    console.error('Missing required frontmatter fields', data);
    return null;
  }

  return { data: data as PostFrontmatter, content: markdownContent };
}

// Load all markdown files from content/posts
const postModules = import.meta.glob('../content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function loadBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const path in postModules) {
    const content = postModules[path] as string;
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      console.error(`Failed to parse frontmatter for ${path}`);
      continue;
    }

    const { data, content: markdown } = parsed;

    // Extract id from filename (remove path and .md extension)
    const id = path.replace('../content/posts/', '').replace('.md', '');

    posts.push({
      id,
      title: data.title,
      date: data.date,
      category: data.category,
      coverImage: data.coverImage,
      excerpt: data.excerpt,
      content: markdown,
    });
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const dateA = a.date.split('.').reverse().join('');
    const dateB = b.date.split('.').reverse().join('');
    return dateB.localeCompare(dateA);
  });

  return posts;
}

export { loadBlogPosts };

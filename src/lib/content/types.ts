export type ContentCategory = 'TECH' | 'LIFE' | 'MEMO';

export interface PostFrontmatter {
  title: string;
  date: string;
  category: ContentCategory;
  coverImage?: string;
  excerpt: string;
  tags?: string[];
}

export interface BlogPost extends PostFrontmatter {
  id: string;
  content: string;
}

export interface TopicMeta {
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  coverImage?: string;
}

export interface TopicPost extends BlogPost {
  slug: string;
  topicSlug: string;
  order?: number;
}

export interface Topic {
  meta: TopicMeta;
  posts: TopicPost[];
  introContent?: string;
}

export interface ContentCatalog {
  posts: BlogPost[];
  topics: Topic[];
}

export interface RoutableArticle {
  kind: 'blog' | 'topic';
  id: string;
  title: string;
  date: string;
  excerpt: string;
  path: string;
}

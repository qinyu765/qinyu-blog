import React from 'react';

export type {
  BlogPost,
  ContentCategory,
  PostFrontmatter,
  Topic,
  TopicMeta,
  TopicPost,
} from '@/lib/content';

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

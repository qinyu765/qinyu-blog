import React from 'react';

// Frontmatter metadata for Markdown blog posts
export interface PostFrontmatter {
  title: string;
  date: string;
  category: 'TECH' | 'LIFE' | 'MEMO';
  coverImage?: string;
  excerpt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: 'TECH' | 'LIFE' | 'MEMO';
  excerpt: string;
  content: string; // Markdown/MDX content
  coverImage?: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}
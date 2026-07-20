import { z } from 'zod';
import { isValidContentDate } from './date';

const optionalString = z.string().trim().min(1).optional();
const optionalTags = z.array(z.string().trim().min(1)).optional();

export const postFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  date: z.string().refine(isValidContentDate, '必须使用有效的 YYYY.MM.DD 日期'),
  category: z.enum(['TECH', 'LIFE', 'MEMO']),
  excerpt: z.string().trim().min(1),
  coverImage: optionalString,
  tags: optionalTags,
});

export const topicPostFrontmatterSchema = postFrontmatterSchema.extend({
  order: z.number().int().finite().optional(),
});

export const topicFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  coverImage: optionalString,
  tags: optionalTags,
});

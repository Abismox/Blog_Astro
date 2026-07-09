import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.string().optional(),
    language: z.enum(['es', 'en']).default('es'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['tech', 'gaming', 'devlog']).default('tech'),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
};

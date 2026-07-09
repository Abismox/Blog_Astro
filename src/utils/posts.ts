import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

export type PostEntry = CollectionEntry<'posts'>;

export async function getPostsByLang(lang: Lang): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ id, data }) => {
    return id.startsWith(`${lang}/`) && data.language === lang && !data.draft;
  });

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

export async function getPostBySlug(
  lang: Lang,
  slug: string
): Promise<PostEntry | undefined> {
  const posts = await getCollection('posts', ({ id, data }) => {
    return (
      id.startsWith(`${lang}/`) &&
      data.language === lang &&
      !data.draft
    );
  });

  return posts.find((post) => {
    const postSlug = post.id.replace(`${lang}/`, '').replace(/\.(md|mdx)$/, '');
    return postSlug === slug;
  });
}

export function formatDate(date: Date, lang: Lang): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', options);
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

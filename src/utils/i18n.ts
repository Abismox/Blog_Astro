import es from '../i18n/ui/es.json';
import en from '../i18n/ui/en.json';

export const languages = {
  es: 'Español',
  en: 'English',
};

export const defaultLang = 'es';

export const ui = { es, en } as const;

export type Lang = keyof typeof ui;
export type TranslationKey = keyof typeof ui[typeof defaultLang];

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey | string): string {
    return (ui[lang] as Record<string, string>)[key] ||
      (ui[defaultLang] as Record<string, string>)[key] ||
      '';
  };
}

// Base URL configured in astro.config.mjs (e.g. '/Blog_Astro'). Astro guarantees
// a trailing slash is NOT included, so we normalize here to make concatenation safe.
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Build an internal link that respects the i18n locale and the project's `base`.
 * Use for every internal href that includes a language prefix.
 *
 *   localePath('es', '/blog')   → '/Blog_Astro/es/blog'
 *   localePath('en', 'blog/foo') → '/Blog_Astro/en/blog/foo'
 *   localePath('es')            → '/Blog_Astro/es'   (root of the locale)
 */
export function localePath(lang: Lang, path = ''): string {
  const cleanPath = path && !path.startsWith('/') ? `/${path}` : path;
  return `${BASE_URL}/${lang}${cleanPath}`;
}

/** Resolve a static asset (under /public) against the project's base. */
export function assetPath(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

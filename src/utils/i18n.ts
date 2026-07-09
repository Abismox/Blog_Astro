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

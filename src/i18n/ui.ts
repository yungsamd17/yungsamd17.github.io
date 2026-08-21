import type { Locale } from '../data/site';

export const UI = {
  en: {
    tagline: 'building tools for the web',
    taglineAlt: 'building bugs for the web',
    navProjects: 'Other projects',
    navAbout: 'About me',
    back: 'back',
    projectsTitle: 'Other projects',
    viewAll: 'view all repositories',
    aboutTitle: 'About me',
    linksTitle: 'Links',
    linksMeta: 'All my social links and profiles',
    linksBack: 'Back to Homepage',
    secretTitle: 'You found the secret page!',
    secretText: 'Now go back to doing something useful.',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist.',
    themeToggle: 'Toggle theme',
    langToggle: 'Switch language',
    skipToContent: 'Skip to main content',
  },
  sk: {
    tagline: 'tvorím nástroje pre web',
    taglineAlt: 'tvorím chyby pre web',
    navProjects: 'Iné projekty',
    navAbout: 'O mne',
    back: 'späť',
    projectsTitle: 'Iné projekty',
    viewAll: 'zobraziť všetky repozitáre',
    aboutTitle: 'O mne',
    linksTitle: 'Odkazy',
    linksMeta: 'Všetky moje sociálne odkazy a profily',
    linksBack: 'Späť na hlavnú stránku',
    secretTitle: 'Našiel si tajnú stránku!',
    secretText: 'Teraz sa vráť k niečomu užitočnému.',
    notFoundTitle: 'Stránka nenájdená',
    notFoundText: 'Táto stránka neexistuje.',
    themeToggle: 'Prepnúť tému',
    langToggle: 'Zmeniť jazyk',
    skipToContent: 'Preskočiť na hlavný obsah',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof UI)['en'];

export function t(key: UIKey, locale: Locale = 'en'): string {
  return UI[locale][key] ?? UI.en[key];
}

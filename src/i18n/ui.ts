import type { Locale } from '../data/site';

export const UI = {
  en: {
    tagline: 'building tools for the web',
    taglineAlt: 'building bugs for the web',
    status: 'open to collabs',
    featuredLabel: 'featured',
    exploreLabel: 'explore',
    navProjects: 'Other projects',
    navAbout: 'About me',
    back: 'back',
    backHome: 'back home',
    projectsTitle: 'Other projects',
    viewAll: 'view all repositories',
    aboutTitle: 'About me',
    linksTitle: 'Links',
    linksMeta: 'All my social links and profiles',
    linksBack: 'Back to Homepage',
    secretTitle: 'You found the secret page!',
    secretText: 'Now go back to doing something useful.',
    notFoundTitle: 'Signal lost',
    notFoundText: 'This page drifted into the void.',
    themeToggle: 'Toggle theme',
    langToggle: 'Switch language',
    skipToContent: 'Skip to main content',
  },
  sk: {
    tagline: 'tvorím nástroje pre web',
    taglineAlt: 'tvorím chyby pre web',
    status: 'otvorený na spoluprácu',
    featuredLabel: 'zvýraznené',
    exploreLabel: 'preskúmať',
    navProjects: 'Iné projekty',
    navAbout: 'O mne',
    back: 'späť',
    backHome: 'späť domov',
    projectsTitle: 'Iné projekty',
    viewAll: 'zobraziť všetky repozitáre',
    aboutTitle: 'O mne',
    linksTitle: 'Odkazy',
    linksMeta: 'Všetky moje sociálne odkazy a profily',
    linksBack: 'Späť na hlavnú stránku',
    secretTitle: 'Našiel si tajnú stránku!',
    secretText: 'Teraz sa vráť k niečomu užitočnému.',
    notFoundTitle: 'Signál stratený',
    notFoundText: 'Táto stránka sa stratila v prázdne.',
    themeToggle: 'Prepnúť tému',
    langToggle: 'Zmeniť jazyk',
    skipToContent: 'Preskočiť na hlavný obsah',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof UI)['en'];

export function t(key: UIKey, locale: Locale = 'en'): string {
  return UI[locale][key] ?? UI.en[key];
}

import type { LocalizedText } from './site';

export const HISTORY_PROJECT = {
  title: 'Website Time Machine',
  site: '/history/',
  mono: 'TM',
  projectIcon: '/projects/website-time-machine.svg',
  iconBg: '#332526',
  accent: '#ff8a80',
  langs: ['HTML', 'CSS', 'Astro'],
  desc: {
    en: 'Four versions of my homepage from 2023 to 2026.',
    sk: 'Štyri podoby mojej domovskej stránky z rokov 2023 až 2026.',
  },
};

interface Edition {
  slug: string;
  date: string;
  label: string;
  revision: string;
  title: LocalizedText;
  description: LocalizedText;
  alt: LocalizedText;
  focus: string;
  light?: boolean;
}

export const EDITIONS: Edition[] = [
  {
    slug: 'early-web',
    date: '2023-04-05',
    label: '04.2023',
    revision: '201146d846af1d3a9095305514d72048c6e9fe26',
    title: { en: 'The first post', sk: 'Prvý príspevok' },
    description: {
      en: 'A two-column personal blog with a row of social links, an About Me box, and a single post saying hello.',
      sk: 'Osobný blog s dvoma stĺpcami, odkazmi na sociálne siete, sekciou o mne a jedným príspevkom na uvítanie.',
    },
    alt: {
      en: 'The 2023 homepage with a large Sam heading, a row of social links, a "My First Post" entry and an About Me box.',
      sk: 'Domovská stránka z roku 2023 s veľkým nadpisom Sam, radom sociálnych odkazov, príspevkom „My First Post“ a boxom O mne.',
    },
    focus: '50% 50%',
  },
  {
    slug: 'first-portfolio',
    date: '2024-02-13',
    label: '02.2024',
    revision: '10fb71081fd71415220e8b8d1b73c7a564522f02',
    title: { en: 'From blog to portfolio', sk: 'Od blogu k portfóliu' },
    description: {
      en: 'The one-page portfolio in its final form: a wipe-in reveal on load, a self-updating age in About Me, and Twitch Live and UserScripts leading the project lists.',
      sk: 'Jednostrankové portfólio v poslednej podobe: postupné odhaľovanie obsahu pri načítaní, automaticky aktualizovaný vek v sekcii O mne a projekty Twitch Live a UserScripts na čele zoznamov.',
    },
    alt: {
      en: 'The final portfolio page with a Sam heading, a social link bar, an About Me section and lists of Twitch Live, UserScripts and other projects.',
      sk: 'Posledná podoba portfólia s nadpisom Sam, panelom sociálnych odkazov, sekciou O mne a zoznamami projektov Twitch Live, UserScripts a ďalších.',
    },
    focus: '35% 50%',
  },
  {
    slug: 'minimal-site',
    date: '2026-03-31',
    label: '03.2026',
    revision: '470bb36d26445ca27f3790c57b4200bae1cba654',
    title: { en: 'Essentials, now on Astro', sk: 'Podstatné, teraz v Astre' },
    description: {
      en: 'The one-column layout moved to Astro with separate About, Projects and Links pages and theme and language switchers. This was the last look before the card redesign.',
      sk: 'Jednostĺpcové rozloženie prešlo na Astro so samostatnými stránkami O mne, Projekty a Odkazy a s prepínačmi témy a jazyka. Táto bola posledná podoba pred prepracovaním na karty.',
    },
    alt: {
      en: 'The last one-column version: a small Sam heading, a short tagline and a plain vertical list of links and projects.',
      sk: 'Posledná jednostĺpcová verzia: malý nadpis Sam, krátke motto a jednoduchý zvislý zoznam odkazov a projektov.',
    },
    focus: '35% 50%',
    light: true,
  },
  {
    slug: 'card-redesign',
    date: '2026-11-25',
    label: '11.2026',
    revision: '880bde920038a4078a442b2036358182b158d0ca',
    title: { en: 'The current design', sk: 'Súčasný dizajn' },
    description: {
      en: 'Built with Astro, this version brought the bio back to the homepage alongside featured project cards and a GitHub contribution graph.',
      sk: 'Táto verzia využíva Astro. Na domovskú stránku sa vrátil profil a pribudli karty vybraných projektov aj graf aktivity na GitHube.',
    },
    alt: {
      en: 'The current homepage with an avatar, a short bio, social link cards and featured project cards.',
      sk: 'Súčasná domovská stránka s avatarom, krátkym profilom, kartami sociálnych odkazov a vybraných projektov.',
    },
    focus: '30% 50%',
    light: true,
  },
];

export function editionImage(edition: Edition, theme: 'dark' | 'light' = 'dark') {
  const suffix = theme === 'light' && edition.light ? '-light' : '';
  return `${HISTORY_PROJECT.site}${edition.slug}${suffix}.webp`;
}

export function editionPath(edition: Edition) {
  return edition === EDITIONS[0] ? HISTORY_PROJECT.site : `${HISTORY_PROJECT.site}${edition.slug}/`;
}

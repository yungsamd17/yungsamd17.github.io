import type { LocalizedText } from './site';

export const HISTORY_PROJECT = {
  title: 'Website Time Machine',
  site: '/history/',
  mono: 'TM',
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
  },
  {
    slug: 'first-portfolio',
    date: '2024-02-13',
    label: '02.2024',
    revision: '1f9f01e081295599b86950d65e9361f5d6f635d5',
    title: { en: 'From blog to portfolio', sk: 'Od blogu k portfóliu' },
    description: {
      en: 'Twitch Live and UserScripts took center stage. The homepage had a social link bar and a new reveal animation.',
      sk: 'Do popredia sa dostali Twitch Live a UserScripts. Na domovskej stránke pribudol panel s odkazmi na sociálne siete a animácia pri načítaní.',
    },
  },
  {
    slug: 'minimal-site',
    date: '2026-03-31',
    label: '03.2026',
    revision: '68048fbb8244076836f5ad24a79dced4053827b3',
    title: { en: 'Down to the essentials', sk: 'Len to podstatné' },
    description: {
      en: 'The home page narrowed to one quiet column. Projects and the bio moved into their own views inside a single HTML page.',
      sk: 'Domovská stránka sa zúžila na jeden jednoduchý stĺpec. Projekty a profil sa presunuli do samostatných zobrazení v rámci jednej HTML stránky.',
    },
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
  },
];

export function editionPath(edition: Edition) {
  return edition === EDITIONS[0] ? HISTORY_PROJECT.site : `${HISTORY_PROJECT.site}${edition.slug}/`;
}

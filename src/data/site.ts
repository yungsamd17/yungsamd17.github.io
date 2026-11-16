import type { IconName } from '../icons';

export const SITE = {
  name: 'Sam',
  handle: 'yungsamd17',
  title: 'Sam @yungsamd17',
  email: 'yungsamd@proton.me',
  url: 'https://yungsamd17.github.io',
  description: 'Web developer building browser extensions, userscripts, and web tools — Sam (@yungsamd17)',
  birthDate: new Date(2003, 7, 1),
} as const;

export type Locale = 'en' | 'sk';

export type LocalizedText = Record<Locale, string>;

export interface Social {
  label: string;
  href: string;
  icon: IconName;
}

export const SOCIALS: Social[] = [
  { label: 'GitHub', href: 'https://github.com/yungsamd17', icon: 'github' },
  { label: 'X/Twitter', href: 'https://x.com/yungsamd17', icon: 'x' },
  { label: 'Twitch', href: 'https://twitch.tv/yungsamd17', icon: 'twitch' },
  { label: 'Discord', href: 'https://discord.com/users/402083911053869056', icon: 'discord' },
];

export interface FeaturedLink {
  title: string;
  desc: LocalizedText;
  href: string;
  icon: IconName;
  /** Languages/tech used */
  langs?: string[];
  /** Project icon for the experimental redesign (public path) */
  projectIcon?: string;
  /** Glow accent color for the experimental redesign */
  accent?: string;
  /** Live site URL (for projects page) */
  site?: string;
  /** GitHub slug (owner/repo) for star count */
  repo?: string;
}

export const FEATURED: FeaturedLink[] = [
  {
    title: 'Twitch Live',
    desc: {
      en: 'Your ultimate companion for Twitch — live channels, at a glance.',
      sk: 'Váš ultimátny spoločník pre Twitch — živé kanály na prvý pohľad.',
    },
    href: 'https://yungsamd17.github.io/Twitch-Live/',
    site: 'https://yungsamd17.github.io/Twitch-Live/',
    repo: 'yungsamd17/Twitch-Live',
    icon: 'twitch',
    langs: ['Web', 'JS', 'Twitch', 'Extension'],
    projectIcon: '/projects/twitch-live.svg',
    accent: '#8531ff',
  },
  {
    title: 'Singlenote',
    desc: {
      en: 'Focus on one note at a time. A minimalist, offline-first Android note app.',
      sk: 'Sústreď sa vždy len na jednu poznámku. Minimalistická, offline-first Android aplikácia na poznámky.',
    },
    href: 'https://github.com/yungsamd17/singlenote',
    repo: 'yungsamd17/singlenote',
    icon: 'android',
    langs: ['Kotlin', 'Android', 'Notes'],
    projectIcon: '/projects/singlenote.svg',
    accent: '#a78bfa',
  },
  {
    title: 's17 Labs',
    desc: {
      en: 'GitHub Org - Lightweight, privacy-first software for the web and mobile.',
      sk: 'GitHub Org - Ľahký softvér s dôrazom na súkromie pre web a mobil.',
    },
    href: 'https://s17labs.github.io',
    site: 'https://s17labs.github.io',
    icon: 'flask',
    projectIcon: '/projects/s17-labs.svg',
    accent: '#f53f35',
  },
];

export interface Project {
  title: string;
  desc: LocalizedText;
  langs: string[];
  /** Card icon (public path). Falls back to a monogram tile when omitted. */
  icon?: string;
  /** Card glow color, sampled from the project's icon */
  accent: string;
  /** GitHub slug (owner/repo) → GitHub link + build-time star count */
  repo?: string;
  /** Live site URL → "Site" link */
  site?: string;
  /** Monogram text used when there is no icon (defaults to the first letter). */
  mono?: string;
  /** Override the icon tile background (defaults to a tinted accent wash). */
  iconBg?: string;
  /** Show a "Public Archive" badge on the card. */
  archived?: boolean;
}

export const PROJECTS: Project[] = [
  {
    title: 'Koda',
    icon: '/projects/koda.svg',
    repo: 's17labs/koda',
    site: 'https://s17labs.github.io/koda',
    accent: '#0146c0',
    desc: {
      en: 'A clean, minimal text editor for Android by s17 Labs.',
      sk: 'Čistý, minimalistický textový editor pre Android od s17 Labs.',
    },
    langs: ['Kotlin', 'Android', 'Editor'],
  },
  {
    title: 's17 Labs Tools',
    icon: '/projects/s17-labs.svg',
    repo: 's17labs/tools',
    site: 'https://s17labs.github.io/tools',
    accent: '#f53f35',
    desc: {
      en: 'Fast, privacy-first browser utility tools for creators and developers.',
      sk: 'Rýchle nástroje pre prehliadače so zameraním na súkromie pre tvorcov a vývojárov.',
    },
    langs: ['Astro', 'TypeScript', 'Tools'],
    live: true,
  },
  {
    title: 'Volume Control',
    icon: '/projects/volume-control.svg',
    repo: 'yungsamd17/Volume-Control',
    accent: '#1a74ea',
    desc: {
      en: 'Browser extension to push tab volume beyond the default 100% cap.',
      sk: 'Rozšírenie prehliadača na zvýšenie hlasitosti karty nad predvolených 100 %.',
    },
    langs: ['JS', 'Extension', 'Chrome'],
  },
  {
    title: 'UserScripts',
    icon: '/projects/userscripts.svg',
    repo: 'yungsamd17/UserScripts',
    site: 'https://yungsamd17.github.io/UserScripts/',
    accent: '#f7df1e',
    desc: {
      en: 'Userscripts for Twitch, X and more — small tweaks that improve day-to-day use.',
      sk: 'Userscripts pre Twitch, X a ďalšie — malé vylepšenia pre každodenné používanie.',
    },
    langs: ['JS', 'Web', 'Userscripts'],
    live: true,
  },
  {
    title: 'BetterDiscord Addons',
    icon: '/projects/betterdiscord-addons.svg',
    repo: 'yungsamd17/BetterDiscordAddons',
    accent: '#2853ab',
    desc: {
      en: 'A collection of plugins and themes for BetterDiscord.',
      sk: 'Kolekcia pluginov a tém pre BetterDiscord.',
    },
    langs: ['JS', 'CSS', 'BetterDiscord'],
  },
  {
    title: 'NoPixel Vehicle Mods',
    repo: 'yungsamd17/np-carmods',
    accent: '#00f8b9',
    mono: 'NP',
    iconBg: '#111117',
    archived: true,
    desc: {
      en: 'A list of all vehicle mods from the NoPixel FiveM Roleplay Server.',
      sk: 'Zoznam všetkých úprav vozidiel zo servera NoPixel FiveM Roleplay.',
    },
    langs: ['FiveM', 'GTA V', 'Mods'],
  },
];

export interface LinkItem {
  platform: string;
  username: string;
  href: string;
  icon: IconName;
  copy?: string;
}

export const LINKS: LinkItem[] = [
  { platform: 'GitHub', username: 'yungsamd17', href: 'https://github.com/yungsamd17', icon: 'github' },
  { platform: 'X/Twitter', username: 'yungsamd17', href: 'https://x.com/yungsamd17', icon: 'x' },
  { platform: 'Twitch', username: 'yungsamd17', href: 'https://twitch.tv/yungsamd17', icon: 'twitch' },
  { platform: 'Discord', username: 'yungsamd17', href: 'https://discord.com/users/402083911053869056', icon: 'discord' },
  { platform: 'YouTube', username: 'yungsamd17', href: 'https://youtube.com/@yungsamd17', icon: 'youtube' },
  { platform: 'Spotify', username: 'yungsamd17', href: 'https://open.spotify.com/user/samuelfackejoff?si=35znygTDQQ6Avm89RWI1zg', icon: 'spotify' },
  { platform: 'Ko-fi', username: 'yungsamd17', href: 'https://ko-fi.com/yungsamd17', icon: 'coffee' },
  { platform: 'Email', username: 'yungsamd@proton.me', href: 'mailto:yungsamd@proton.me', icon: 'mail', copy: 'yungsamd@proton.me' },
];

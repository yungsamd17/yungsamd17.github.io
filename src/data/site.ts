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
    projectIcon: '/projects/twitch-live.png',
    accent: '#8531ff',
  },
  {
    title: 'Koda',
    desc: {
      en: 'A clean, minimal text editor for Android by s17 Labs.',
      sk: 'Čistý, minimalistický textový editor pre Android od s17 Labs.',
    },
    href: 'https://s17labs.github.io/koda',
    site: 'https://s17labs.github.io/koda',
    repo: 's17labs/koda',
    icon: 'android',
    langs: ['Kotlin', 'Android', 'Editor'],
    projectIcon: '/projects/koda.png',
    accent: '#0146c0',
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
    projectIcon: '/projects/s17-labs.png',
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
}

export const PROJECTS: Project[] = [
  {
    title: 'Singlenote',
    icon: '/projects/singlenote.png',
    repo: 'yungsamd17/singlenote',
    accent: '#a78bfa',
    desc: {
      en: 'Focus on one note at a time. A minimalist, offline-first Android note app.',
      sk: 'Sústreď sa vždy len na jednu poznámku. Minimalistická, offline-first Android aplikácia na poznámky.',
    },
    langs: ['Kotlin', 'Android', 'Notes'],
  },
  {
    title: 's17 Labs Tools',
    icon: '/projects/s17-labs.png',
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
    icon: '/projects/volume-control.png',
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
    icon: '/projects/userscripts.jpg',
    repo: 'yungsamd17/UserScripts',
    site: 'https://yungsamd17.github.io/UserScripts/',
    accent: '#d57d59',
    desc: {
      en: 'Userscripts for Twitch, X and more — small tweaks that improve day-to-day use.',
      sk: 'Userscripts pre Twitch, X a ďalšie — malé vylepšenia pre každodenné používanie.',
    },
    langs: ['JS', 'Web', 'Userscripts'],
    live: true,
  },
  {
    title: 'BetterDiscord Addons',
    repo: 'yungsamd17/BetterDiscordAddons',
    accent: '#8b9ef5',
    desc: {
      en: 'A collection of plugins and themes for BetterDiscord.',
      sk: 'Kolekcia pluginov a tém pre BetterDiscord.',
    },
    langs: ['JS', 'CSS', 'BetterDiscord'],
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

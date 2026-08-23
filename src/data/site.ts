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
  badge?: string;
}

export const FEATURED: FeaturedLink[] = [
  {
    title: 'Twitch Live',
    desc: {
      en: 'Your ultimate companion for Twitch — live channels, at a glance.',
      sk: 'Váš ultimátny spoločník pre Twitch — živé kanály na prvý pohľad.',
    },
    href: 'https://yungsamd17.github.io/Twitch-Live/',
    icon: 'twitch',
  },
  {
    title: 'Koda',
    desc: {
      en: 'A clean, minimal text editor for Android by s17 Labs.',
      sk: 'Čistý, minimalistický textový editor pre Android od s17 Labs.',
    },
    href: 'https://s17labs.github.io/koda',
    icon: 'android',
  },
  {
    title: 's17 Labs',
    desc: {
      en: 'Lightweight, privacy-first software for the web and mobile.',
      sk: 'Ľahký softvér s dôrazom na súkromie pre web a mobil.',
    },
    href: 'https://s17labs.github.io',
    icon: 'flask',
    badge: 'org',
  },
];

export interface Project {
  title: string;
  href: string;
  desc: LocalizedText;
  langs: string[];
  live?: boolean;
}

export const PROJECTS: Project[] = [
  {
    title: 'UserScripts',
    href: 'https://yungsamd17.github.io/UserScripts/',
    desc: {
      en: 'Userscripts for Twitch, X and more — small tweaks that improve day-to-day use.',
      sk: 'Userscripts pre Twitch, X a ďalšie — malé vylepšenia pre každodenné používanie.',
    },
    langs: ['JS', 'Web'],
    live: true,
  },
  {
    title: 's17 Labs Tools',
    href: 'https://s17labs.github.io/tools',
    desc: {
      en: 'Fast, privacy-first browser utility tools for creators and developers.',
      sk: 'Rýchle nástroje pre prehliadače so zameraním na súkromie pre tvorcov a vývojárov.',
    },
    langs: ['Web'],
    live: true,
  },
  {
    title: 'Volume Control',
    href: 'https://github.com/yungsamd17/Volume-Control',
    desc: {
      en: 'Browser extension to push tab volume beyond the default 100% cap.',
      sk: 'Rozšírenie prehliadača na zvýšenie hlasitosti karty nad predvolených 100 %.',
    },
    langs: ['JS'],
  },
  {
    title: 'BetterDiscord Addons',
    href: 'https://github.com/yungsamd17/BetterDiscordAddons',
    desc: {
      en: 'A collection of plugins and themes for BetterDiscord.',
      sk: 'Kolekcia pluginov a tém pre BetterDiscord.',
    },
    langs: ['JS', 'CSS'],
  },
];

export interface LinkItem {
  platform: string;
  username: string;
  href: string;
  icon: IconName;
}

export const LINKS: LinkItem[] = [
  { platform: 'GitHub', username: 'yungsamd17', href: 'https://github.com/yungsamd17', icon: 'github' },
  { platform: 'X/Twitter', username: 'yungsamd17', href: 'https://x.com/yungsamd17', icon: 'x' },
  { platform: 'Twitch', username: 'yungsamd17', href: 'https://twitch.tv/yungsamd17', icon: 'twitch' },
  { platform: 'Discord', username: 'yungsamd17', href: 'https://discord.com/users/402083911053869056', icon: 'discord' },
  { platform: 'YouTube', username: 'yungsamd17', href: 'https://youtube.com/@yungsamd17', icon: 'youtube' },
  { platform: 'Spotify', username: 'yungsamd17', href: 'https://open.spotify.com/user/samuelfackejoff?si=35znygTDQQ6Avm89RWI1zg', icon: 'spotify' },
  { platform: 'Ko-fi', username: 'yungsamd17', href: 'https://ko-fi.com/yungsamd17', icon: 'coffee' },
  { platform: 'Email', username: 'yungsamd@proton.me', href: 'mailto:yungsamd@proton.me', icon: 'mail' },
];

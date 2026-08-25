import { t } from '../i18n/ui';
import { SITE } from '../data/site';

function getStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function currentLang(): 'en' | 'sk' {
  return document.documentElement.lang === 'sk' ? 'sk' : 'en';
}

function currentThemeMode(): ThemeMode {
  const mode = document.documentElement.dataset.themeMode;
  return mode === 'light' || mode === 'dark' ? mode : 'system';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  return systemPrefersDark() ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolveTheme(mode);
}

function cycleTheme() {
  const next = THEME_ORDER[(THEME_ORDER.indexOf(currentThemeMode()) + 1) % THEME_ORDER.length];
  setStorage('theme', next);
  applyTheme(next);
  showToast(t(next === 'system' ? 'toastThemeSystem' : next === 'light' ? 'toastThemeLight' : 'toastThemeDark', currentLang()));
}

function updateToggleLabels() {
  const lang = currentLang();
  document.getElementById('theme-toggle')?.setAttribute('aria-label', t('themeToggle', lang));
  document.getElementById('lang-toggle')?.setAttribute('aria-label', t('langToggle', lang));
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
    btn.setAttribute('aria-label', t('copyEmail', lang));
  });
}

function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        showToast(t('copiedEmail', currentLang()));
      } catch {
        showToast(t('copyFailed', currentLang()));
      }
    });
  });
}

function initTheme() {
  const saved = getStorage('theme');
  applyTheme(saved === 'light' || saved === 'dark' ? saved : 'system');
  document.getElementById('theme-toggle')?.addEventListener('click', cycleTheme);
}

type AnimDir = 'bottom' | 'top';

function currentAnim(): AnimDir {
  return document.documentElement.dataset.anim === 'top' ? 'top' : 'bottom';
}

function applyAnim(dir: AnimDir) {
  if (dir === 'top') document.documentElement.dataset.anim = 'top';
  else delete document.documentElement.dataset.anim;
}

function initAnim() {
  applyAnim(getStorage('anim') === 'top' ? 'top' : 'bottom');
  const toggle = document.getElementById('anim-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = currentAnim() === 'top';
  toggle.addEventListener('change', () => {
    const dir: AnimDir = toggle.checked ? 'top' : 'bottom';
    setStorage('anim', dir);
    applyAnim(dir);
    showToast(t(dir === 'top' ? 'toastAnimTop' : 'toastAnimBottom', currentLang()));
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentThemeMode() === 'system') applyTheme('system');
});

function initLang() {
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const next = currentLang() === 'sk' ? 'en' : 'sk';
    document.documentElement.lang = next;
    setStorage('lang', next);
    updateToggleLabels();
    showToast(t(next === 'sk' ? 'toastLangSk' : 'toastLangEn'));
  });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function showToast(message: string) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = undefined;
  }, 2000);
}

function updateAge() {
  document.querySelectorAll('.age').forEach((el) => {
    const now = new Date();
    let age = now.getFullYear() - SITE.birthDate.getFullYear();
    const hadBirthday =
      now.getMonth() > SITE.birthDate.getMonth() ||
      (now.getMonth() === SITE.birthDate.getMonth() && now.getDate() >= SITE.birthDate.getDate());
    if (!hadBirthday) age--;
    el.textContent = String(age);
  });
}

function updateYear() {
  document.querySelectorAll('.year').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

let taglineTimer: ReturnType<typeof setTimeout> | undefined;
let rainbowTimer: ReturnType<typeof setTimeout> | undefined;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

function triggerRainbow() {
  if (document.documentElement.classList.contains('rainbow')) return;
  document.documentElement.classList.add('rainbow');
  showToast(t('toastRainbow', currentLang()));
  rainbowTimer = setTimeout(() => {
    document.documentElement.classList.remove('rainbow');
    rainbowTimer = undefined;
  }, 8000);
}

document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiIndex = key === KONAMI[konamiIndex] ? konamiIndex + 1 : key === KONAMI[0] ? 1 : 0;
  if (konamiIndex === KONAMI.length) {
    konamiIndex = 0;
    triggerRainbow();
  }
});

function initTaglineEasterEgg() {
  const tagline = document.querySelector<HTMLElement>('[data-easter="tagline"]');
  if (!tagline) return;
  tagline.addEventListener('click', () => {
    if (taglineTimer) return;
    const lang = currentLang();
    const alt = t('taglineAlt', lang);
    const spans = tagline.querySelectorAll<HTMLElement>('[data-lang]');
    const originals = new Map<HTMLElement, string>();
    spans.forEach((s) => {
      originals.set(s, s.textContent ?? '');
      if (s.dataset.lang === lang) s.textContent = alt;
    });
    taglineTimer = setTimeout(() => {
      spans.forEach((s) => {
        s.textContent = originals.get(s) ?? '';
      });
      taglineTimer = undefined;
    }, 2000);
  });
}

function consoleArt() {
  if ((window as any).__consoleArt) return;
  (window as any).__consoleArt = true;
  console.log('%c🛠️ Welcome to my website!', 'font-size: 20px; font-weight: bold; color: #ff8a80;');
  console.log('%cThanks for checking out my code.', 'font-size: 14px; color: #6a6a72;');
  console.log('%cFeel free to reach out: yungsamd@proton.me', 'font-size: 12px; color: #a0a0a8;');
}

function debugParam() {
  if ((window as any).__debugApplied) return;
  if (new URLSearchParams(location.search).get('debug') === 'true') {
    (window as any).__debugApplied = true;
    console.log('%c🐛 Debug mode activated!', 'font-size: 16px; color: #4caf50;');
    document.body.style.border = '3px solid #4caf50';
  }
}

function initPage() {
  initTheme();
  initAnim();
  initLang();
  updateToggleLabels();
  initCopyButtons();
  updateAge();
  updateYear();
  initTaglineEasterEgg();
  consoleArt();
  debugParam();
}

document.addEventListener('astro:before-swap', (event) => {
  clearTimeout(taglineTimer);
  taglineTimer = undefined;
  clearTimeout(toastTimer);
  toastTimer = undefined;
  clearTimeout(rainbowTimer);
  rainbowTimer = undefined;
  const { newDocument } = event as CustomEvent<{ newDocument: Document }>;
  newDocument.documentElement.dataset.theme = document.documentElement.dataset.theme;
  newDocument.documentElement.dataset.themeMode = document.documentElement.dataset.themeMode;
  newDocument.documentElement.lang = document.documentElement.lang;
  if (currentAnim() === 'top') newDocument.documentElement.dataset.anim = 'top';
  else delete newDocument.documentElement.dataset.anim;
});

document.addEventListener('astro:page-load', initPage);

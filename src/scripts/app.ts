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

function currentLang(): 'en' | 'sk' {
  return document.documentElement.lang === 'sk' ? 'sk' : 'en';
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
  const resolved = resolveTheme(mode);
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
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

function closeAllMenus() {
  document.querySelectorAll<HTMLElement>('.menu-panel.open').forEach((p) => p.classList.remove('open'));
  document.querySelectorAll<HTMLElement>('[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}

function toggleMenu(panel: HTMLElement | null) {
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  closeAllMenus();
  if (!isOpen) {
    panel.classList.add('open');
    const trigger = panel.parentElement?.querySelector<HTMLElement>('button[aria-haspopup="menu"]');
    trigger?.setAttribute('aria-expanded', 'true');
  }
}

function initTheme() {
  const saved = getStorage('theme');
  applyTheme(saved === 'light' || saved === 'dark' ? saved : 'system');

  const trigger = document.getElementById('theme-toggle') as HTMLElement | null;
  const panel = trigger?.parentElement?.querySelector<HTMLElement>('.menu-panel') ?? null;
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(panel);
  });

  document.querySelectorAll<HTMLElement>('[data-theme-value]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.dataset.themeValue as ThemeMode;
      setStorage('theme', mode);
      applyTheme(mode);
      closeAllMenus();
      showToast(t(mode === 'system' ? 'toastThemeSystem' : mode === 'light' ? 'toastThemeLight' : 'toastThemeDark', currentLang()));
    });
  });
}

type AnimDir = 'bottom' | 'top';

function currentAnim(): AnimDir {
  return document.documentElement.dataset.anim === 'bottom' ? 'bottom' : 'top';
}

function applyAnim(dir: AnimDir) {
  if (dir === 'bottom') document.documentElement.dataset.anim = 'bottom';
  else delete document.documentElement.dataset.anim;
}

function initAnim() {
  applyAnim(getStorage('anim') === 'bottom' ? 'bottom' : 'top');
  const toggle = document.getElementById('anim-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = currentAnim() === 'bottom';
  toggle.addEventListener('change', () => {
    const dir: AnimDir = toggle.checked ? 'bottom' : 'top';
    setStorage('anim', dir);
    applyAnim(dir);
    showToast(t(dir === 'top' ? 'toastAnimTop' : 'toastAnimBottom', currentLang()));
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentThemeMode() === 'system') applyTheme('system');
});

document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  if (!target?.closest('.theme-menu, .lang-menu')) closeAllMenus();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllMenus();
});

const TAGLINES: Record<'en' | 'sk', [string, string]> = {
  en: ['building tools for the web', 'Perpetual side-project starter'],
  sk: ['tvorím nástroje pre web', 'neustále začínam vedľajšie projekty'],
};

let taglineIndex = 0;
let taglineAnimate = false;
let taglineInterval: ReturnType<typeof setTimeout> | undefined;
let taglineFadeTimer: ReturnType<typeof setTimeout> | undefined;
let firstRotation = true;

function updateTagline() {
  const el = document.querySelector<HTMLElement>('[data-tagline]');
  if (!el) return;
  el.querySelectorAll<HTMLElement>('span[data-lang]').forEach((span) => {
    const lang = span.getAttribute('data-lang') as 'en' | 'sk';
    if (lang in TAGLINES) span.textContent = TAGLINES[lang][taglineIndex];
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hadAnimation = el.classList.contains('tagline-animate');
  el.style.opacity = '';
  el.style.transform = '';
  el.classList.remove('tagline-animate', 'tagline-fadeout');
  if (hadAnimation) void el.offsetWidth;
  if (!reduce && taglineAnimate) el.classList.add('tagline-animate');
}

function startTaglineRotation() {
  clearInterval(taglineInterval as any);
  clearTimeout(taglineInterval as any);
  clearInterval(taglineFadeTimer as any);
  clearTimeout(taglineFadeTimer as any);
  taglineFadeTimer = undefined;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (firstRotation && !reduce) {
    taglineFadeTimer = setTimeout(() => {
      const el = document.querySelector<HTMLElement>('[data-tagline]');
      if (!el) return;
      el.style.opacity = '1';
      el.classList.remove('tagline-animate');
      el.classList.add('tagline-fadeout');
    }, 3520);
    taglineInterval = setTimeout(() => {
      clearInterval(taglineFadeTimer as any);
      clearTimeout(taglineFadeTimer as any);
      taglineFadeTimer = undefined;
      const el = document.querySelector<HTMLElement>('[data-tagline]');
      if (el) {
        el.style.transform = 'translateY(5px)';
        el.classList.remove('tagline-fadeout');
      }
      firstRotation = false;
      taglineIndex = 1;
      taglineAnimate = true;
      updateTagline();
      startTaglineRotation();
    }, 4000);
  } else {
    taglineInterval = setInterval(() => {
      taglineIndex = (taglineIndex + 1) % 2;
      taglineAnimate = true;
      updateTagline();
    }, 4000) as any;
  }
}

function initTagline() {
  taglineIndex = 0;
  taglineAnimate = false;
  firstRotation = true;
  updateTagline();
  startTaglineRotation();
}

function initLang() {
  const trigger = document.getElementById('lang-toggle') as HTMLElement | null;
  const panel = trigger?.parentElement?.querySelector<HTMLElement>('.menu-panel') ?? null;
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(panel);
  });

  document.querySelectorAll<HTMLElement>('[data-lang-value]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = btn.dataset.langValue as 'en' | 'sk';
      if (next !== currentLang()) {
        const taglineEl = document.querySelector<HTMLElement>('[data-tagline]');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const doSwitch = () => {
          document.documentElement.lang = next;
          setStorage('lang', next);
          updateToggleLabels();
          taglineIndex = 0;
          taglineAnimate = !reduce;
          firstRotation = true;
          updateTagline();
          startTaglineRotation();
        };
        if (taglineEl && !reduce) {
          taglineEl.style.opacity = '1';
          taglineEl.style.transform = 'translateY(0)';
          taglineEl.classList.remove('tagline-animate');
          taglineEl.classList.add('tagline-fadeout');
          setTimeout(() => {
            taglineEl.style.opacity = '';
            taglineEl.style.transform = 'translateY(5px)';
            taglineEl.classList.remove('tagline-fadeout');
            doSwitch();
          }, 480);
        } else {
          doSwitch();
        }
        showToast(t(next === 'sk' ? 'toastLangSk' : 'toastLangEn', next));
      }
      closeAllMenus();
    });
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
  initTagline();
  initTaglineEasterEgg();
  consoleArt();
  debugParam();
}

document.addEventListener('astro:before-swap', (event) => {
  clearTimeout(taglineTimer);
  taglineTimer = undefined;
  clearInterval(taglineInterval as any);
  clearTimeout(taglineInterval as any);
  taglineInterval = undefined;
  clearInterval(taglineFadeTimer as any);
  clearTimeout(taglineFadeTimer as any);
  taglineFadeTimer = undefined;
  clearTimeout(toastTimer);
  toastTimer = undefined;
  clearTimeout(rainbowTimer);
  rainbowTimer = undefined;
  const { newDocument } = event as CustomEvent<{ newDocument: Document }>;
  newDocument.documentElement.dataset.theme = document.documentElement.dataset.theme;
  newDocument.documentElement.dataset.themeMode = document.documentElement.dataset.themeMode;
  newDocument.documentElement.lang = document.documentElement.lang;
  if (document.documentElement.classList.contains('dark')) newDocument.documentElement.classList.add('dark');
  else newDocument.documentElement.classList.remove('dark');
  if (currentAnim() === 'bottom') newDocument.documentElement.dataset.anim = 'bottom';
  else delete newDocument.documentElement.dataset.anim;
});

document.addEventListener('astro:page-load', initPage);
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

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function currentTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  setStorage('theme', next);
  applyTheme(next);
}

function initTheme() {
  const saved = getStorage('theme');
  applyTheme(saved === 'light' ? 'light' : saved === 'dark' ? 'dark' : systemPrefersDark() ? 'dark' : 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

function initLang() {
  const select = document.getElementById('lang-select') as HTMLSelectElement | null;
  if (!select) return;
  select.value = document.documentElement.lang === 'sk' ? 'sk' : 'en';
  select.addEventListener('change', () => {
    const lang = select.value === 'sk' ? 'sk' : 'en';
    document.documentElement.lang = lang;
    setStorage('lang', lang);
  });
}

function updateAge() {
  document.querySelectorAll('.age').forEach((el) => {
    const now = new Date();
    let age = now.getFullYear() - 2003;
    if (now < new Date(now.getFullYear(), 7, 1)) age--;
    el.textContent = String(age);
  });
}

function updateYear() {
  document.querySelectorAll('.year').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

let taglineTimer: ReturnType<typeof setTimeout> | undefined;

function initTaglineEasterEgg() {
  const tagline = document.querySelector<HTMLElement>('[data-easter="tagline"]');
  if (!tagline) return;
  tagline.addEventListener('click', () => {
    if (taglineTimer) return;
    const lang = document.documentElement.lang === 'sk' ? 'sk' : 'en';
    const alt = lang === 'sk' ? 'tvorím chyby pre web' : 'building bugs for the web';
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
  initLang();
  updateAge();
  updateYear();
  initTaglineEasterEgg();
  consoleArt();
  debugParam();
}

document.addEventListener('astro:before-swap', () => {
  clearTimeout(taglineTimer);
  taglineTimer = undefined;
});

document.addEventListener('astro:page-load', initPage);

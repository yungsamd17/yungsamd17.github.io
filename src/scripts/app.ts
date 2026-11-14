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
  document.querySelectorAll('[data-theme-toggle]').forEach((el) => el.setAttribute('aria-label', t('themeToggle', lang)));
  document.querySelectorAll('[data-lang-toggle]').forEach((el) => el.setAttribute('aria-label', t('langToggle', lang)));
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
    btn.setAttribute('aria-label', t('copyEmail', lang));
  });
}

function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    let copiedTimer: ReturnType<typeof setTimeout> | undefined;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        showToast(t('copiedEmail', currentLang()));
        // morph the icon into a check for two seconds
        btn.classList.add('copied');
        btn.setAttribute('aria-label', t('copiedEmail', currentLang()));
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', t('copyEmail', currentLang()));
          copiedTimer = undefined;
        }, 2000);
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

  // The classic header and the redesign toolbar each render a toggle, so bind
  // every instance instead of a single ID.
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((trigger) => {
    const panel = trigger.parentElement?.querySelector<HTMLElement>('.menu-panel') ?? null;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(panel);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-theme-value]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.dataset.themeValue as ThemeMode;
      if (mode === currentThemeMode()) {
        closeAllMenus();
        return;
      }
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

/* ── experimental: redesign ── */

function currentRedesign(): boolean {
  return document.documentElement.dataset.redesign === 'on';
}

function applyRedesign(on: boolean) {
  if (on) document.documentElement.dataset.redesign = 'on';
  else delete document.documentElement.dataset.redesign;
}

function initRedesign() {
  applyRedesign(getStorage('redesign') === 'on');
  history.scrollRestoration = currentRedesign() ? 'manual' : 'auto';
  const toggle = document.getElementById('redesign-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = currentRedesign();
  toggle.addEventListener('change', () => {
    applyRedesign(toggle.checked);
    history.scrollRestoration = toggle.checked ? 'manual' : 'auto';
    setStorage('redesign', toggle.checked ? 'on' : 'off');
    showToast(t(toggle.checked ? 'toastRedesignOn' : 'toastRedesignOff', currentLang()));
  });
}

/* ── experimental: page load text animations ── */

function textAnimDisabled(): boolean {
  return document.documentElement.dataset.textanim === 'off';
}

function applyTextAnim(disabled: boolean) {
  if (disabled) document.documentElement.dataset.textanim = 'off';
  else delete document.documentElement.dataset.textanim;
}

function initTextAnim() {
  applyTextAnim(getStorage('textanim') === 'off');
  const toggle = document.getElementById('textanim-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = !textAnimDisabled();
  toggle.addEventListener('change', () => {
    const disabled = !toggle.checked;
    applyTextAnim(disabled);
    setStorage('textanim', disabled ? 'off' : 'on');
    showToast(t(disabled ? 'toastTextAnimOff' : 'toastTextAnimOn', currentLang()));
  });
}

/* ── experimental: hide the snack bar ── */

function applyToastHidden(hidden: boolean) {
  if (hidden) document.documentElement.dataset.toast = 'off';
  else delete document.documentElement.dataset.toast;
}

function initToastToggle() {
  applyToastHidden(getStorage('toast') === 'off');
  const toggle = document.getElementById('toast-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = toastHidden();
  toggle.addEventListener('change', () => {
    applyToastHidden(toggle.checked);
    setStorage('toast', toggle.checked ? 'off' : 'on');
    // hidden toasts suppress their own confirmation by design
    showToast(t(toggle.checked ? 'toastToastOff' : 'toastToastOn', currentLang()));
  });
}

/* ── redesign: smooth scroll-to-top, contribution reveal ── */

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToTopSmooth() {
  if (window.scrollY <= 0) return;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Keep the outgoing scroll offset for a moment after the swap so the trip back
// to the top reads as a smooth scroll instead of an instant jump.
let navScrollY = 0;

function initContributions() {
  document.querySelectorAll<HTMLElement>('[data-contrib-grid]').forEach((grid) => {
    if (grid.dataset.shown) return;
    const reveal = () => {
      grid.dataset.shown = 'true';
    };
    // failsafe: never leave the graph invisible if the observer never fires
    window.setTimeout(reveal, 3000);
    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // one frame later so the transition from the hidden state actually runs
        requestAnimationFrame(reveal);
      },
      { threshold: 0.2, rootMargin: '0px 0px 120px 0px' }
    );
    observer.observe(grid);
  });
}

/* One shared, viewport-anchored tooltip for the contribution graph. Being
   fixed-position and clamped keeps it off the page edges (no sideways scroll)
   and its solid background never lets the cells show through. */
let contribTipAbort: AbortController | undefined;

function initContributionTooltip() {
  const tip = document.querySelector<HTMLElement>('[data-contrib-tip]');
  if (!tip) return;

  contribTipAbort?.abort();
  contribTipAbort = new AbortController();
  const { signal } = contribTipAbort;

  let visible = false;

  const cellFrom = (target: EventTarget | null) =>
    target instanceof Element
      ? (target.closest('.rd-contrib-cell:not([data-empty])') as HTMLElement | null)
      : null;

  const place = (cell: HTMLElement) => {
    const lang = currentLang();
    const text = (lang === 'sk' ? cell.dataset.tipSk : cell.dataset.tipEn) ?? cell.dataset.tipEn;
    if (!text) return;

    tip.textContent = text;
    tip.dataset.open = 'true';
    tip.style.visibility = 'hidden';
    tip.style.left = '0px';
    tip.style.top = '0px';

    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const rect = cell.getBoundingClientRect();
    const pad = 8;
    const center = rect.left + rect.width / 2;
    const left = Math.min(Math.max(center, pad + w / 2), window.innerWidth - pad - w / 2);
    const above = rect.top - h - 8;
    const top = above >= pad ? above : Math.min(rect.bottom + 8, window.innerHeight - pad - h);

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.style.visibility = '';
    visible = true;
  };

  const hide = () => {
    if (!visible) return;
    visible = false;
    delete tip.dataset.open;
    tip.textContent = '';
  };

  document.querySelectorAll<HTMLElement>('[data-contrib-grid]').forEach((grid) => {
    grid.addEventListener('pointerover', (event) => {
      const cell = cellFrom(event.target);
      if (cell) place(cell);
    });
    grid.addEventListener('pointerout', (event) => {
      if (event.pointerType === 'touch') return;
      const cell = cellFrom(event.target);
      if (!cell) return;
      // moving straight onto a neighbouring day should just update the tip
      if (cellFrom(event.relatedTarget)) return;
      hide();
    });
  });

  window.addEventListener('scroll', hide, { passive: true, signal });
  window.addEventListener('resize', hide, { signal });
  window.addEventListener('blur', hide, { signal });
  // tapping anywhere outside the graph dismisses the touch tooltip
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('[data-contrib-grid]')) hide();
    },
    { signal }
  );
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

// Android Chrome can drop the tab favicon when returning with the system back
// gesture (history/bfcache restore does not always repaint it). Re-pointing the
// icon links forces the browser to re-read and display them again.
let iconBust = false;
let iconRefreshTimer: ReturnType<typeof setTimeout> | undefined;

function refreshFavicon() {
  iconBust = !iconBust;
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
    const base = link.dataset.baseHref ?? link.getAttribute('href');
    if (!base) return;
    link.dataset.baseHref = base;
    const url = new URL(base, location.href);
    if (iconBust) url.searchParams.set('r', '2');
    link.setAttribute('href', url.href);
  });
}

function scheduleFaviconRefresh() {
  if (iconRefreshTimer) return;
  iconRefreshTimer = setTimeout(() => {
    iconRefreshTimer = undefined;
    refreshFavicon();
  }, 150);
}

window.addEventListener('popstate', scheduleFaviconRefresh);
window.addEventListener('pageshow', (e) => {
  if (e.persisted) scheduleFaviconRefresh();
});

const TAGLINES: Record<'en' | 'sk', [string, string]> = {
  en: ['building tools for the web', 'Perpetual side-project starter'],
  sk: ['tvorím nástroje pre web', 'neustále začínam vedľajšie projekty'],
};

const TAGLINE_INTERVAL_MS = 8000;
const TAGLINE_FADE_MS = 480;

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
    }, TAGLINE_INTERVAL_MS - TAGLINE_FADE_MS);
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
    }, TAGLINE_INTERVAL_MS);
  } else {
    taglineInterval = setInterval(() => {
      taglineIndex = (taglineIndex + 1) % 2;
      taglineAnimate = true;
      updateTagline();
    }, TAGLINE_INTERVAL_MS) as any;
  }
}

function initTagline() {
  taglineIndex = 0;
  taglineAnimate = false;
  firstRotation = true;
  updateTagline();
  startTaglineRotation();
}

let langSwitchTimer: ReturnType<typeof setTimeout> | undefined;

function initLang() {
  document.querySelectorAll<HTMLElement>('[data-lang-toggle]').forEach((trigger) => {
    const panel = trigger.parentElement?.querySelector<HTMLElement>('.menu-panel') ?? null;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(panel);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-lang-value]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = btn.dataset.langValue as 'en' | 'sk';
      if (next !== currentLang() && !langSwitchTimer) {
        const root = document.documentElement;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const doSwitch = () => {
          root.lang = next;
          setStorage('lang', next);
          updateToggleLabels();
          taglineIndex = 0;
          // leave the tagline un-animated so it is already visible while the
          // page fades back in; rotation restarts with the first cycle
          taglineAnimate = false;
          firstRotation = true;
          updateTagline();
          startTaglineRotation();
        };
        if (reduce) {
          doSwitch();
        } else {
          root.classList.add('lang-switching');
          langSwitchTimer = setTimeout(() => {
            doSwitch();
            requestAnimationFrame(() => {
              root.classList.remove('lang-switching');
              langSwitchTimer = undefined;
            });
          }, 180);
        }
        showToast(t(next === 'sk' ? 'toastLangSk' : 'toastLangEn', next));
      }
      closeAllMenus();
    });
  });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function toastHidden(): boolean {
  return document.documentElement.dataset.toast === 'off';
}

function showToast(message: string) {
  if (toastHidden()) return;
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
  initRedesign();
  initTextAnim();
  initToastToggle();
  // The redesign always lands at the top of a page, including history
  // navigations, so the browser's own scroll restoration is turned off.
  if (currentRedesign()) history.scrollRestoration = 'manual';
  initLang();
  updateToggleLabels();
  initCopyButtons();
  updateAge();
  initTagline();
  initContributions();
  initContributionTooltip();
  if (currentRedesign()) window.setTimeout(scrollToTopSmooth, 0);
  consoleArt();
  debugParam();
}

document.addEventListener('astro:before-swap', (event) => {
  navScrollY = window.scrollY;
  clearTimeout(langSwitchTimer);
  langSwitchTimer = undefined;
  document.documentElement.classList.remove('lang-switching');
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
  if (currentRedesign()) newDocument.documentElement.dataset.redesign = 'on';
  else delete newDocument.documentElement.dataset.redesign;
  if (textAnimDisabled()) newDocument.documentElement.dataset.textanim = 'off';
  else delete newDocument.documentElement.dataset.textanim;
  if (toastHidden()) newDocument.documentElement.dataset.toast = 'off';
  else delete newDocument.documentElement.dataset.toast;
});

document.addEventListener('astro:after-swap', () => {
  const y = navScrollY;
  navScrollY = 0;
  if (y <= 0 || !currentRedesign()) return;
  if (prefersReducedMotion()) {
    window.scrollTo(0, 0);
    return;
  }
  // put the new page back where the old one was, then glide to the top
  window.scrollTo(0, y);
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

document.addEventListener('astro:page-load', initPage);
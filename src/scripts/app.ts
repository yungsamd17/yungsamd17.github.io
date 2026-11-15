import { t } from '../i18n/ui';
import { SITE } from '../data/site';
import { contributionSignature, fetchContributions, type ContributionsData } from '../lib/contributions';

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

/**
 * Copy text to the clipboard.
 *
 * The async Clipboard API only exists in secure contexts and can still reject
 * (denied permission, no user activation, unfocused document), so fall back to
 * a hidden textarea + execCommand('copy') — that keeps the button working on
 * http previews and older browsers.
 */
async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.width = '1px';
  area.style.height = '1px';
  area.style.padding = '0';
  area.style.border = 'none';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';
  document.body.appendChild(area);

  let copied = false;
  try {
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    area.remove();
    active?.focus({ preventScroll: true });
  }

  return copied;
}

function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    let copiedTimer: ReturnType<typeof setTimeout> | undefined;
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy ?? '');
      if (!ok) {
        showToast(t('copyFailed', currentLang()));
        return;
      }
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
  applyRedesign(getStorage('redesign') !== 'off');
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
  applyTextAnim(getStorage('textanim') !== 'on');
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

/* ── experimental: page accent glow on the viewport ── */

function pageGlowDisabled(): boolean {
  return document.documentElement.dataset.pageglow === 'off';
}

function applyPageGlowDisabled(disabled: boolean) {
  if (disabled) document.documentElement.dataset.pageglow = 'off';
  else delete document.documentElement.dataset.pageglow;
}

function initPageGlow() {
  applyPageGlowDisabled(getStorage('pageglow') !== 'on');
  const toggle = document.getElementById('pageglow-toggle') as HTMLInputElement | null;
  if (!toggle) return;
  toggle.checked = pageGlowDisabled();
  toggle.addEventListener('change', () => {
    applyPageGlowDisabled(toggle.checked);
    setStorage('pageglow', toggle.checked ? 'off' : 'on');
    showToast(t(toggle.checked ? 'toastPageGlowOff' : 'toastPageGlowOn', currentLang()));
  });
}

/* ── experimental: hide the snack bar ── */

function applyToastHidden(hidden: boolean) {
  if (hidden) document.documentElement.dataset.toast = 'off';
  else delete document.documentElement.dataset.toast;
}

function initToastToggle() {
  applyToastHidden(getStorage('toast') !== 'on');
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

/* ── redesign: scroll memory, contribution reveal ── */

// Every navigation is instant: no animated scroll-to-top and no animated
// scroll restore. The outgoing page records where it was left, and the
// incoming page jumps straight to its remembered offset (or the top).
// The path is read from the swap event because on a history traversal the
// URL has already changed by the time the events fire.
let navToPath = '';
let reloadRestored = false;

const SCROLL_STORE = 'scroll-positions';

function pageKey(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function readScrollMap(): Record<string, number> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SCROLL_STORE) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function rememberScroll(path: string, y: number) {
  try {
    const map = readScrollMap();
    map[pageKey(path)] = Math.max(0, Math.round(y));
    sessionStorage.setItem(SCROLL_STORE, JSON.stringify(map));
  } catch {}
}

function rememberedScroll(path: string): number {
  const y = readScrollMap()[pageKey(path)];
  return typeof y === 'number' && Number.isFinite(y) ? y : 0;
}

/* ── contributions: cached calendar + change-only animation ──
   The calendar is rendered at build time, so the first paint already has it.
   A fingerprint of the last calendar that was shown is cached in localStorage:
   when the page loads with the same fingerprint the cells appear instantly;
   only new data (new build, or a fresh fetch that differs) animates in. */

const CONTRIB_CACHE_KEY = 'contrib-cache';
const CONTRIB_CACHE_TTL = 10 * 60 * 1000;
const CONTRIB_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// One entry per calendar key, so a refresh never invalidates another
// calendar's cache.
type ContribEntry = { at: number; sig: string };
type ContribCache = Record<string, ContribEntry>;

function readContribCache(): ContribCache {
  try {
    const raw = localStorage.getItem(CONTRIB_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    // migrate the first, single-graph shape { at, sig }
    if (typeof parsed.sig === 'string' && typeof parsed.at === 'number') {
      return { home: { at: parsed.at, sig: parsed.sig } };
    }
    const cache: ContribCache = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const entry = value as Partial<ContribEntry>;
      if (typeof entry?.at === 'number' && typeof entry?.sig === 'string') {
        cache[key] = { at: entry.at, sig: entry.sig };
      }
    });
    return cache;
  } catch {
    return {};
  }
}

function writeContribCache(key: string, sig: string) {
  try {
    const cache = readContribCache();
    cache[key] = { at: Date.now(), sig };
    localStorage.setItem(CONTRIB_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

// `instant` disables the per-cell transition, so a cached calendar lands in its
// final state without replaying the staggered reveal.
function revealContrib(grid: HTMLElement, animate: boolean) {
  if (!animate) {
    grid.setAttribute('data-instant', '');
    grid.dataset.shown = 'true';
    requestAnimationFrame(() => grid.removeAttribute('data-instant'));
    return;
  }
  grid.removeAttribute('data-shown');
  // next frame so the hidden -> shown transition actually runs
  requestAnimationFrame(() => {
    grid.dataset.shown = 'true';
  });
}

function revealWhenVisible(grid: HTMLElement, animate: boolean) {
  if (!animate) {
    revealContrib(grid, false);
    return;
  }
  let revealed = false;
  const fire = () => {
    if (revealed) return;
    revealed = true;
    revealContrib(grid, true);
  };
  // failsafe: never leave the graph invisible if the observer never fires
  window.setTimeout(fire, 3000);
  if (!('IntersectionObserver' in window)) {
    fire();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      fire();
    },
    { threshold: 0.2, rootMargin: '0px 0px 120px 0px' }
  );
  observer.observe(grid);
}

const shortContribDate = (iso: string) => {
  const [, month, day] = iso.split('-');
  return `${CONTRIB_MONTHS[Number(month) - 1]} ${Number(day)}`;
};

/** Rebuild the calendar in place from fresh data (same markup as the build). */
function applyContributions(grid: HTMLElement, data: ContributionsData) {
  const { weeks } = data;
  const recentFrom = Math.max(0, weeks.length - 26);
  const visibleCount = Math.min(26, weeks.length);
  const monthsEl = grid.parentElement?.querySelector<HTMLElement>('.rd-contrib-months') ?? null;
  const totalEl = grid.closest('.rd-contrib-section')?.querySelector<HTMLElement>('.rd-head-total') ?? null;
  const chartEl = grid.closest<HTMLElement>('.rd-contrib');

  if (monthsEl) {
    const months = document.createDocumentFragment();
    data.months.forEach((month) => {
      const el = document.createElement('span');
      el.style.setProperty('--p', `${(month.col / weeks.length) * 100}%`);
      el.style.setProperty('--mp', `${((month.col - recentFrom) / visibleCount) * 100}%`);
      if (month.col < recentFrom) el.setAttribute('data-old', '');
      el.textContent = month.label;
      months.appendChild(el);
    });
    monthsEl.replaceChildren(months);
  }

  const cells = document.createDocumentFragment();
  weeks.forEach((week, col) => {
    week.forEach((day) => {
      const cell = document.createElement('span');
      cell.className = 'rd-contrib-cell';
      cell.setAttribute('aria-hidden', 'true');
      if (col < recentFrom) cell.setAttribute('data-old', '');
      if (!day) {
        cell.setAttribute('data-empty', '');
      } else {
        cell.dataset.level = String(day.level);
        cell.dataset.date = day.date;
        cell.style.setProperty('--d', `${(weeks.length - 1 - col) * 6}ms`);
        const dateLabel = shortContribDate(day.date);
        cell.dataset.tipEn = `${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${dateLabel}`;
        cell.dataset.tipSk = `${day.count} ${day.count === 1 ? 'príspevok' : 'príspevkov'} · ${dateLabel}`;
      }
      cells.appendChild(cell);
    });
  });
  grid.removeAttribute('data-shown');
  grid.replaceChildren(cells);

  if (totalEl) totalEl.textContent = data.total.toLocaleString('en-US');
  chartEl?.setAttribute('aria-label', `GitHub contributions, ${data.from} to ${data.to}`);
  dimFutureAndPastEmptyContribDays();
}

function dimFutureAndPastEmptyContribDays() {
  document.querySelectorAll<HTMLElement>('.rd-contrib-grid').forEach((grid) => {
    const cells = Array.from(grid.querySelectorAll<HTMLElement>('.rd-contrib-cell'));
    // find index of last cell that has a real date
    let lastDateIdx = -1;
    cells.forEach((cell, i) => { if (cell.dataset.date) lastDateIdx = i; });
    cells.forEach((cell, i) => {
      if (!cell.hasAttribute('data-empty')) return;
      // leading / already-passed empty padding cells
      if (i < (cells.findIndex((c) => c.dataset.date) || 0)) {
        cell.setAttribute('data-past-empty', '');
        cell.removeAttribute('data-future');
        return;
      }
      // trailing empty cells = future days
      if (i > lastDateIdx) {
        // the first trailing empty is tomorrow -> stays bright
        const trailingIndex = i - lastDateIdx; // 1 = tomorrow
        if (trailingIndex === 1) {
          cell.removeAttribute('data-future');
          cell.removeAttribute('data-past-empty');
        } else {
          cell.setAttribute('data-future', '');
          cell.removeAttribute('data-past-empty');
        }
        return;
      }
      cell.removeAttribute('data-future');
      cell.removeAttribute('data-past-empty');
    });
  });

  // also handle dated future cells (none currently, but keep for safety)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 2);
  document.querySelectorAll<HTMLElement>('.rd-contrib-cell[data-date]').forEach((cell) => {
    const d = cell.dataset.date;
    if (!d) return;
    const date = new Date(`${d}T00:00:00`);
    if (date.getTime() >= cutoff.getTime()) cell.setAttribute('data-future', '');
    else cell.removeAttribute('data-future');
  });
}

async function refreshContributions(grid: HTMLElement, key: string, currentSig: string) {
  if (grid.dataset.contribFetching) return;
  grid.dataset.contribFetching = 'true';
  const year = key.startsWith('year-') ? key.slice(5) : 'last';
  const data = await fetchContributions(SITE.handle, year);
  delete grid.dataset.contribFetching;
  if (!data) return;

  const nextSig = contributionSignature(data);
  // Refresh the cache timestamp even when nothing changed, so the next page
  // load can skip the network call entirely.
  writeContribCache(key, nextSig);
  if (nextSig === currentSig) return;

  // Real new data: swap the calendar in and animate it once.
  grid.dataset.contribSig = nextSig;
  applyContributions(grid, data);
  revealContrib(grid, true);
}

function initContributions() {
  document.querySelectorAll<HTMLElement>('[data-contrib-grid]').forEach((grid) => {
    if (grid.dataset.contribInit) return;
    grid.dataset.contribInit = 'true';

    const key = grid.dataset.contribKey || 'home';
    const sig = grid.dataset.contribSig ?? '';
    const entry = readContribCache()[key];
    // Already saw this exact calendar on a previous visit: show it instantly.
    const unchanged = !!sig && entry?.sig === sig;
    revealWhenVisible(grid, !unchanged);
    if (!unchanged) writeContribCache(key, sig);

    // Only hit the API when the cache is missing or old; a fresh cache means
    // this page load already knows the calendar and nothing has to load.
    const fresh = entry !== undefined && Date.now() - entry.at <= CONTRIB_CACHE_TTL;
    if (!fresh) void refreshContributions(grid, key, sig);
  });
  dimFutureAndPastEmptyContribDays();
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
  let tipClearTimer: ReturnType<typeof setTimeout> | undefined;

  const cellFrom = (target: EventTarget | null) =>
    target instanceof Element
      ? (target.closest('.rd-contrib-cell:not([data-empty])') as HTMLElement | null)
      : null;

  const place = (cell: HTMLElement) => {
    const lang = currentLang();
    const text = (lang === 'sk' ? cell.dataset.tipSk : cell.dataset.tipEn) ?? cell.dataset.tipEn;
    if (!text) return;

    const wasVisible = visible;
    clearTimeout(tipClearTimer);
    tipClearTimer = undefined;
    tip.textContent = text;

    // the closed tip keeps its layout box, so it can be measured while hidden
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const rect = cell.getBoundingClientRect();
    const pad = 8;
    const center = rect.left + rect.width / 2;
    const left = Math.min(Math.max(center, pad + w / 2), window.innerWidth - pad - w / 2);
    const above = rect.top - h - 8;
    const top = above >= pad ? above : Math.min(rect.bottom + 8, window.innerHeight - pad - h);

    if (!wasVisible) {
      // land on the first date without gliding in from the previous spot
      tip.style.transition = 'none';
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      void tip.offsetWidth;
      tip.style.transition = '';
      tip.dataset.open = 'true';
      visible = true;
      return;
    }

    // already open: the offsets transition, so the tip glides to the next date
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };

  const hide = () => {
    if (!visible) return;
    visible = false;
    delete tip.dataset.open;
    // keep the text while it fades out, then release it
    clearTimeout(tipClearTimer);
    tipClearTimer = setTimeout(() => {
      tipClearTimer = undefined;
      if (!visible) tip.textContent = '';
    }, 240);
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
  en: ['building tools for the web', 'perpetual side-project starter'],
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
  const now = new Date();
  let age = now.getFullYear() - SITE.birthDate.getFullYear();
  const hadBirthday =
    now.getMonth() > SITE.birthDate.getMonth() ||
    (now.getMonth() === SITE.birthDate.getMonth() && now.getDate() >= SITE.birthDate.getDate());
  if (!hadBirthday) age--;
  // The markup already carries build-time values, so these writes only fire
  // when a cached page has gone stale — never on a normal load, no pop-in.
  document.querySelectorAll('.age').forEach((el) => {
    const next = String(age);
    if (el.textContent !== next) el.textContent = next;
  });
  const year = String(now.getFullYear());
  document.querySelectorAll('.year').forEach((el) => {
    if (el.textContent !== year) el.textContent = year;
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

const STAR_FILLED_PATH =
  'M 11.47 3.08 Q 12.00 2.00 12.53 3.08 L 14.56 7.18 Q 15.09 8.26 16.28 8.43 L 20.81 9.10 Q 22.00 9.27 21.14 10.11 L 17.86 13.30 Q 17.00 14.14 17.20 15.32 L 17.98 19.97 Q 18.18 21.15 17.13 20.57 L 13.05 18.35 Q 12.00 17.77 10.94 18.33 L 6.88 20.46 Q 5.82 21.02 6.02 19.84 L 6.80 15.32 Q 7.00 14.14 6.14 13.30 L 2.86 10.11 Q 2.00 9.27 3.19 9.10 L 7.72 8.43 Q 8.91 8.26 9.44 7.18 Z';

const STARS_CACHE_KEY = 'stars-cache';
const STARS_TTL = 6 * 60 * 60 * 1000;

function readStarsCache(): Record<string, { at: number; stars: number }> {
  try {
    const raw = localStorage.getItem(STARS_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStarsCache(cache: Record<string, { at: number; stars: number }>) {
  try {
    localStorage.setItem(STARS_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function setStatStars(stat: HTMLElement, stars: number) {
  stat.title = `${stars.toLocaleString('en-US')} GitHub stars`;
  stat.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${STAR_FILLED_PATH}"/></svg>${stars.toLocaleString('en-US')}<span class="sr-only"> GitHub stars</span>`;
}

async function initProjectStars() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.proj-item[data-repo]'));
  if (!cards.length) return;
  const cache = readStarsCache();
  const now = Date.now();
  await Promise.all(
    cards.map(async (card) => {
      const repo = card.dataset.repo;
      if (!repo) return;
      const entry = cache[repo];
      const fresh = !!entry && typeof entry.stars === 'number' && now - entry.at <= STARS_TTL;

      let stars: number | null = null;
      if (fresh) {
        stars = entry.stars;
      } else {
        try {
          const res = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: { Accept: 'application/vnd.github+json' },
          });
          if (!res.ok) {
            // fall back to stale cache if the network/rate limit fails
            if (entry) stars = entry.stars;
            else return;
          } else {
            const data = await res.json();
            stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
            cache[repo] = { at: now, stars };
            writeStarsCache(cache);
          }
        } catch {
          if (entry) stars = entry.stars;
          else return;
        }
      }

      if (stars == null || stars < 3) {
        // remove a stale stat if the count dropped below the gate
        card.querySelector('.proj-stat')?.remove();
        return;
      }

      const title = card.querySelector<HTMLElement>('.proj-title');
      if (!title) return;
      const existing = card.querySelector<HTMLElement>('.proj-stat');
      if (existing) {
        // update only if the value actually changed
        const current = parseInt(existing.textContent?.replace(/[^0-9]/g, '') || '0', 10);
        if (current !== stars) setStatStars(existing, stars);
      } else {
        const stat = document.createElement('span');
        stat.className = 'proj-stat';
        setStatStars(stat, stars);
        title.appendChild(stat);
      }
    })
  );
}

let avatarRainStop: (() => void) | undefined;

function initAvatarRain() {
  const avatar = document.querySelector<HTMLElement>('[data-avatar]');
  if (!avatar) return;
  let active = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  const MIN_SIZE = 28;
  const MAX_SIZE = 48;
  const MAX_DROPS = 40;

  const spawn = () => {
    if (document.querySelectorAll('.avatar-drop').length >= MAX_DROPS) return;
    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    const left = Math.random() * Math.max(0, window.innerWidth - size);
    const duration = 2600 + Math.random() * 2600;
    const rotation = Math.round(Math.random() * 60 - 30);
    const img = document.createElement('img');
    img.src = '/avatar.jpg';
    img.alt = '';
    img.className = 'avatar-drop';
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.left = `${left}px`;
    img.style.setProperty('--rot', `${rotation}deg`);
    img.style.animationDuration = `${duration}ms`;
    img.addEventListener(
      'animationend',
      (event) => {
        if ((event as AnimationEvent).animationName === 'avatar-fall') img.remove();
      },
      { once: false }
    );
    document.body.appendChild(img);
  };

  const start = () => {
    active = true;
    document.documentElement.dataset.avatarRain = 'on';
    spawn();
    timer = setInterval(spawn, 220);
  };

  const stop = () => {
    active = false;
    delete document.documentElement.dataset.avatarRain;
    if (timer) clearInterval(timer);
    timer = undefined;
    document.querySelectorAll('.avatar-drop').forEach((el) => el.remove());
  };

  avatarRainStop = stop;
  avatar.addEventListener('click', () => (active ? stop() : start()));
}

function initPage() {
  initTheme();
  initAnim();
  initRedesign();
  initTextAnim();
  initPageGlow();
  initToastToggle();
  // The redesign always lands at the top of a page, including history
  // navigations, so the browser's own scroll restoration is turned off.
  if (currentRedesign()) history.scrollRestoration = 'manual';
  // A reload (mobile pull-to-refresh included) restores the last recorded
  // offset instantly; a pull while already at the top records 0, so the page
  // stays at the top instead of animating back to a stale position.
  if (!reloadRestored) {
    reloadRestored = true;
    if (currentRedesign()) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === 'reload') {
        const target = pageKey(location.pathname) === '/' ? rememberedScroll(location.pathname) : 0;
        window.scrollTo({ top: target, left: 0, behavior: 'instant' });
      }
    }
  }
  // Reveal the page now that the scroll position is correct.
  document.documentElement.style.visibility = '';
  initLang();
  updateToggleLabels();
  initCopyButtons();
  updateAge();
  initTagline();
  initContributions();
  initContributionTooltip();
  void initProjectStars();
  initAvatarRain();
  // Navigation scroll is handled in the swap handlers: instantly, no animation.
  consoleArt();
  debugParam();
}

document.addEventListener('astro:before-swap', (event) => {
  const swap = event as CustomEvent & {
    from?: URL;
    to?: URL;
    navigationType?: 'push' | 'replace' | 'traverse';
    newDocument: Document;
  };
  // On a history traversal the URL has already changed by now, so take the
  // paths from the event instead of location.
  const fromPath = swap.from?.pathname ?? location.pathname;
  const toPath = swap.to?.pathname ?? location.pathname;
  navToPath = pageKey(toPath);
  // the falling-avatar easter egg never survives a navigation
  avatarRainStop?.();
  avatarRainStop = undefined;
  // Only the homepage remembers its scroll position; other pages open at top.
  if (currentRedesign() && pageKey(fromPath) === '/') rememberScroll(fromPath, window.scrollY);
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
  const { newDocument } = swap;
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
  if (pageGlowDisabled()) newDocument.documentElement.dataset.pageglow = 'off';
  else delete newDocument.documentElement.dataset.pageglow;
  if (toastHidden()) newDocument.documentElement.dataset.toast = 'off';
  else delete newDocument.documentElement.dataset.toast;
});

document.addEventListener('astro:after-swap', () => {
  const toPath = navToPath || pageKey(location.pathname);
  navToPath = '';
  if (!currentRedesign()) return;

  // The homepage restores its remembered offset; every other page opens at
  // the top. `instant` makes sure no animated scroll ever starts.
  const target = pageKey(toPath) === '/' ? rememberedScroll(toPath) : 0;
  window.scrollTo({ top: target, left: 0, behavior: 'instant' });
});

document.addEventListener('astro:page-load', initPage);

// Keep the homepage's remembered scroll position fresh on reload.
window.addEventListener('pagehide', () => {
  if (currentRedesign() && pageKey(location.pathname) === '/') rememberScroll(location.pathname, window.scrollY);
});
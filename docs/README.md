# Website Documentation

Documentation for [yungsamd17.github.io](https://yungsamd17.github.io) - Sam's personal website.

## Table of Contents
- [Project Structure](#project-structure)
- [Links Page](#links-page)
- [Adding a New Language](#adding-a-new-language)
- [Downloader Tool](#downloader-tool)
- [Easter Eggs](#easter-eggs)
- [Commit Message Types](#commit-message-types)
- [Theme System](#theme-system)
- [Translation System](#translation-system)

---

## Links Page

A simple, clean page that displays all your social links and profiles in one place.

**Live page:** [yungsamd17.github.io/links](https://yungsamd17.github.io/links)<br>
**Documentation:** [links/README.md](https://github.com/yungsamd17/yungsamd17.github.io/blob/main/links/README.md)

---

## Project Structure

```
yungsamd17.github.io/
├── index.html              # Main HTML file (single-page app)
├── README.md               # Main repo README
├── LICENSE                 # MIT License
├── robots.txt              # SEO robots file
├── sitemap.xml             # SEO sitemap
├── .github/               # GitHub config (workflows, etc.)
├── docs/                  # Documentation (this directory)
│   └── README.md         # This file
├── src/                   # Source files
│   ├── style.css          # Styles (CSS variables, themes, responsive)
│   ├── main.js           # Main JavaScript (navigation, theme, lang, easter eggs)
│   ├── translations.js    # Translation strings (en, sk)
│   └── assets/            # Images and favicon
│       ├── favicon.ico
│       └── logo.jpg
├── downloader/            # BetterDiscord plugin/theme downloader tool
│   ├── index.html
│   ├── main.js
│   ├── downloader.js
│   └── README.md
└── links/                 # Social links page
    ├── index.html          # Links page (uses ../src/style.css)
    └── README.md          # Links page documentation
```

---

## Adding a New Language

The website supports multiple languages using a simple translation system. Currently supports **English (en)** and **Slovak (sk)**.

### Steps to Add a New Language:

1. **Add translations to `src/translations.js`:**

```javascript
var translations = {
    en: {
        // ... existing English translations
    },
    sk: {
        // ... existing Slovak translations
    },
    // Add your new language here:
    fr: {  // ISO 639-1 language code
        tagline: "construire des outils pour le web",
        taglineAlt: "construire des bugs pour le web",
        navProjects: "Autres projets",
        navAbout: "À propos",
        back: "retour",
        projectsTitle: "Autres projets",
        projUserScripts: "UserScripts",
        projUserScriptsDesc: "Scripts utilisateur pour Twitch, X et plus...",
        // ... add all other keys from the en/sk objects
    }
};
```

2. **Update `src/main.js` - Add the language code to the array:**

```javascript
var languages = ['en', 'sk', 'fr']; // Add 'fr' (or your language code)
```

3. **Required translation keys (copy from 'en' object):**
   - `tagline`, `taglineAlt`
   - `navProjects`, `navAbout`
   - `back`
   - `projectsTitle`
   - `projUserScripts`, `projUserScriptsDesc`
   - `projTools`, `projToolsDesc`
   - `projVolume`, `projVolumeDesc`
   - `projBDAddons`, `projBDAddonsDesc`
   - `viewAll`
   - `aboutTitle`
   - `aboutText1`, `aboutText2`, `aboutText3`

4. **Test it:** Change `localStorage.setItem('lang', 'fr')` in console, or add a new toggle option.

---

## Downloader Tool

The `/downloader/` directory contains a tool for downloading BetterDiscord plugins and themes directly from GitHub.

### How it Works:

1. **URL Structure:** `https://yungsamd17.github.io/downloader/?plugin=PluginName` or `?theme=ThemeName`
2. **Files:**
   - `index.html` - Minimal HTML shell
   - `downloader.js` - API for constructing GitHub raw URLs
   - `main.js` - Handles the download logic on page load

### Example URLs:
```
https://yungsamd17.github.io/downloader/?plugin=SomePlugin
https://yungsamd17.github.io/downloader/?theme=SomeTheme
https://yungsamd17.github.io/downloader/?url=https://raw.githubusercontent.com/user/repo/main/file.js
```

### `downloader.js` API:

```javascript
window.DownloadApi = {
    converter: {
        plugin: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Plugins/${arg}/${arg}.plugin.js`,
        theme: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Themes/${arg}/${arg}.theme.css`,
        url: arg => /* handles full URLs */
    },
    convert: (parameterString, error) => { /* conversion logic */ },
    download: (url, error) => { /* XHR download logic */ }
};
```

---

## Easter Eggs

The website has a few hidden features for fun:

### 1. Tagline Click
- **Action:** Click the "building tools for the web" tagline
- **Result:** Text temporarily changes to "building bugs for the web" (or Slovak equivalent)
- **Duration:** 2 seconds, then returns to original language-appropriate text
- **Code:** `src/main.js` → `window.toggleTagline()`

### 2. Console Art
- **Action:** Open browser DevTools (F12)
- **Result:** See welcome message and contact info in console
- **Code:** `src/main.js` → Console.log statements

### 3. Query Parameters
- **`?debug=true`** - Adds a green border around the page body (debug mode indicator)
- **Code:** `src/main.js` → Query param easter eggs section

### 4. Secret Hash Page
- **Action:** Visit `https://yungsamd17.github.io/#secret`
- **Result:** Shows a "Found it!" page with a fun message
- **Code:** `src/main.js` → `showSecretPage()`

---

## Commit Message Types

Recommended commit message format for this project:

### Types:
- **feat** - New features (easter eggs, new pages, etc.)
- **fix** - Bug fixes (typos, broken functionality)
- **style** - UI/UX changes (CSS updates, layout changes)
- **refactor** - Code cleanup without changing functionality
- **docs** - Documentation updates (README, comments)
- **perf** - Performance improvements
- **chore** - Maintenance (updating deps, configs)

### Examples:
```
feat: add rainbow theme easter egg
fix: correct translation typo in Slovak about text
style: update project card hover effects
refactor: remove unused rainbow theme code
docs: add documentation for language system
chore: update year in footer automatically
```

---

## Theme System

The website supports **dark** and **light** themes with system preference detection.

### How it Works:

1. **CSS Variables:** Defined in `:root` (dark) and `[data-theme="light"]`
2. **Theme Toggle:** Button in header calls `toggleTheme()`
3. **System Detection:** Uses `prefers-color-scheme` media query on first visit
4. **Persistence:** Saved to `localStorage` as `'theme'` (`'light'` or `'dark'`)

### Adding a New Theme:

1. **Add CSS variables:**
```css
[data-theme="your-theme"] {
    --bg: #your-bg;
    --accent: #your-accent;
    --hi: #your-text;
    /* ... other variables */
}
```

2. **Update JavaScript:**
```javascript
var themes = ['light', 'dark', 'your-theme']; // Add to array

// Update icon mapping
var icons = { light: 'fa-moon', dark: 'fa-sun', your-theme: 'fa-icon' };
```

---

## Translation System

Uses `data-i18n` attributes and a global `translations` object.

### How it Works:

1. **HTML:** Elements have `data-i18n="keyName"` attribute
2. **JS:** `updateContent(lang)` replaces `innerHTML` with `translations[lang][key]`
3. **Language Toggle:** Cycles through `languages` array, saves to `localStorage`

### Adding Translation Keys:

```html
<!-- In HTML -->
<p data-i18n="myKey">Fallback text</p>
```

```javascript
// In translations.js
en: {
    myKey: "English text here",
    // ...
},
sk: {
    myKey: "Slovenský text tu",
    // ...
}
```

### Special Cases:
- **HTML in translations:** Use `'string with <strong>HTML</strong>'` (single quotes)
- **Dynamic content:** Age and year are updated via JavaScript functions
- **Tagline alt text:** Separate `taglineAlt` key for easter egg

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last updated:** May 2026

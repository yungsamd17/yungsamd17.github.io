// Navigation
function nav(page) {
    location.hash = (page === 'home') ? '' : page;
}

let isInitialLoad = true;

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('pg-' + page);
    if (target) {
        // Only add animation class if not initial load
        if (!isInitialLoad) {
            target.classList.add('animate');
        }
        target.classList.add('active');
        window.scrollTo(0, 0);
        updateLiveRegion(page);
    }
    if (page === 'secret') {
        showSecretPage();
    }
}

function showSecretPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const existing = document.getElementById('pg-secret');
    if (existing) existing.remove();
    const footer = document.querySelector('.footer');
    const secretHTML = `
        <div class="page active animate" id="pg-secret">
            <button class="back" onclick="nav('home')"><i class="fa-solid fa-arrow-left"></i> back</button>
            <h2 style="margin-top:40px">🎉 You found the secret page!</h2>
            <p style="margin-top:20px">Now go back to doing something useful.</p>
        </div>
    `;
    if (footer) {
        footer.insertAdjacentHTML('beforebegin', secretHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', secretHTML);
    }
}

function updateLiveRegion(page) {
    const live = document.getElementById('page-live');
    if (!live) return;
    const names = { home: 'Home', projects: 'Projects', about: 'About' };
    live.textContent = 'Navigated to ' + (names[page] || page) + ' page';
}

function getPageFromHash() {
    const hash = location.hash.replace('#', '').trim();
    const valid = ['projects', 'about', 'secret'];
    return valid.includes(hash) ? hash : 'home';
}

window.addEventListener('hashchange', function () {
    isInitialLoad = false;
    showPage(getPageFromHash());
});

showPage(getPageFromHash());
isInitialLoad = false;

// Util
function updateAge() {
    const birth = new Date(2003, 7, 1);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), 7, 1)) age--;
    const el = document.getElementById('age');
    if (el) el.textContent = age;
}

function updateYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

updateAge();
updateYear();

// Language toggle
var languages = ['en', 'sk'];
var currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    updateContent(lang);
    updateAge();
}

function updateContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
}

function toggleLang() {
    var currentIndex = languages.indexOf(currentLang);
    currentLang = languages[(currentIndex + 1) % languages.length];
    localStorage.setItem('lang', currentLang);
    applyLang(currentLang);
}

// Theme toggle
var themes = ['light', 'dark'];

function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

var savedTheme = localStorage.getItem('theme');
var currentTheme = savedTheme || getSystemTheme();

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-toggle i');
    if (!icon) return;
    var icons = { light: 'fa-moon', dark: 'fa-sun' };
    icon.className = 'fa-solid ' + icons[currentTheme];
}

function toggleTheme() {
    var currentIndex = themes.indexOf(currentTheme);
    currentTheme = themes[(currentIndex + 1) % themes.length];
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

applyTheme(currentTheme);
applyLang(currentLang);

// Easter Eggs

// 1. Click tagline - Change text temporarily
window.toggleTagline = function() {
    const tagline = document.querySelector('.tagline');
    if (!tagline) return;

    if (tagline.getAttribute('data-toggled') === 'true') return;

    const lang = currentLang === 'sk' ? 'sk' : 'en';
    const altText = (translations[lang] && translations[lang]['taglineAlt']) ? translations[lang]['taglineAlt'] : 'building bugs for the web';
    const originalText = tagline.getAttribute('data-original') || tagline.textContent;

    tagline.setAttribute('data-original', originalText);
    tagline.textContent = altText;
    tagline.setAttribute('data-toggled', 'true');

    setTimeout(() => {
        tagline.textContent = translations[lang]['tagline'];
        tagline.setAttribute('data-toggled', 'false');
    }, 2000);
}

// 2. Console art
console.log('%c🛠️ Welcome to my website!', 'font-size: 20px; font-weight: bold; color: #ff8a80;');
console.log('%cThanks for checking out my code.', 'font-size: 14px; color: #6a6a72;');
console.log('%cFeel free to reach out: yungsamd@proton.me', 'font-size: 12px; color: #a0a0a8;');

// 3. Query param easter eggs
(function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
        console.log('%c🐛 Debug mode activated!', 'font-size: 16px; color: #4caf50;');
        document.body.style.border = '3px solid #4caf50';
    }
})();

// Navigation
function nav(page) {
    location.hash = (page === 'home') ? '' : page;
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('pg-' + page);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function getPageFromHash() {
    const hash = location.hash.replace('#', '').trim();
    const valid = ['projects', 'about'];
    return valid.includes(hash) ? hash : 'home';
}

window.addEventListener('hashchange', function () {
    showPage(getPageFromHash());
});

showPage(getPageFromHash());

function updateAge() {
    const birth = new Date(2003, 7, 1);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), 7, 1)) age--;
    const el = document.getElementById('age');
    if (el) el.textContent = age;
}
updateAge();

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
var currentTheme = localStorage.getItem('theme') || 'dark';

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

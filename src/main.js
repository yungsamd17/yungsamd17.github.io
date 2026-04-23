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

// Handle hash changes
window.addEventListener('hashchange', function () {
    showPage(getPageFromHash());
});

// Handle initial load
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

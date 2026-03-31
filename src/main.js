function nav(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pg-' + page).classList.add('active');
    window.scrollTo(0, 0);
}

// back button support
history.pushState({ page: 'home' }, '');
window.addEventListener('popstate', function () {
    const current = document.querySelector('.page.active');
    if (current && current.id !== 'pg-home') {
        nav('home');
        history.pushState({ page: 'home' }, '');
    }
});

function updateAge() {
    const birth = new Date(2003, 7, 1);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), 7, 1)) age--;
    const el = document.getElementById('age');
    if (el) el.textContent = age;
}
updateAge();

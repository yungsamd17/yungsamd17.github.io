const I18N = {
    en: {
        subtitlePrefix: "Download plugins and themes from",
        empty: "Nothing to download found.",
        hint: "/downloader/?plugin=PluginName or /downloader/?theme=ThemeName (combine several with &)",
        starting: "Downloading…",
        ok: "Done",
        notfound: "Not found",
        error: "Failed"
    },
    sk: {
        subtitlePrefix: "Sťahuj pluginy a témy z",
        empty: "Nič na stiahnutie.",
        hint: "/downloader/?plugin=NazovPluginu alebo /downloader/?theme=NazovTemy (kombinuj viac cez &)",
        starting: "Sťahuje sa…",
        ok: "Hotovo",
        notfound: "Nenájdené",
        error: "Chyba"
    }
};

const ICONS = {
    spinner: '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    cross: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18|M6 6l12 12"/></svg>'
};

window.onload = function() {
    const lang = (navigator.languages || [navigator.language]).some(l => l && l.toLowerCase().startsWith("sk")) ? "sk" : "en";
    document.documentElement.lang = lang;
    const text = I18N[lang];

    const jobs = document.getElementById("jobs");
    const subtitle = document.getElementById("subtitle");

    // Subtitle: "Download plugins and themes from <link>repo</link>"
    subtitle.append(text.subtitlePrefix + " ");
    const repoLink = document.createElement("a");
    repoLink.href = "https://github.com/yungsamd17/BetterDiscordAddons";
    repoLink.target = "_blank";
    repoLink.rel = "noopener";
    repoLink.textContent = "yungsamd17/BetterDiscordAddons";
    subtitle.append(repoLink, ".");

    const urls = window.DownloadApi.parse(window.location.search);

    if (!urls.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = text.empty;
        const hint = document.createElement("code");
        hint.textContent = text.hint;
        empty.appendChild(hint);
        jobs.replaceChildren(empty);
        document.title = "Downloader — " + text.empty;
        return;
    }

    let completed = 0;
    let succeeded = 0;

    function setTitle() {
        if (completed < urls.length) document.title = `Downloading ${completed + 1}/${urls.length}…`;
        else document.title = `${succeeded}/${urls.length} downloaded`;
    }

    // Builds one job row; returns its state updater
    function createRow(url) {
        const row = document.createElement("div");
        row.className = "job starting";
        const icon = document.createElement("span");
        icon.className = "icon";
        icon.innerHTML = ICONS.spinner;
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = url.split("/").pop();
        const status = document.createElement("span");
        status.className = "status";
        status.textContent = text.starting;
        row.append(icon, name, status);
        jobs.appendChild(row);

        return result => {
            row.classList.remove("starting", "ok", "notfound", "error");
            row.classList.add(result);
            icon.innerHTML = result === "ok" ? ICONS.check : result === "starting" ? ICONS.spinner : ICONS.cross;
            status.textContent = text[result];
        };
    }

    async function run() {
        setTitle();
        for (let i = 0; i < urls.length; i++) {
            const update = createRow(urls[i]);
            const result = await window.DownloadApi.download(urls[i]);
            completed++;
            if (result === "ok") succeeded++;
            update(result);
            setTitle();

            // Small gap so browsers group multiple download prompts
            if (i < urls.length - 1) await new Promise(r => setTimeout(r, 800));
        }
    }

    run();
};

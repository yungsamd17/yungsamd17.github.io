window.DownloadApi = {
    converter: {
        plugin: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Plugins/${arg}/${arg}.plugin.js`,
        theme: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Themes/${arg}/${arg}.theme.css`,
        url: arg => arg.startsWith("https://") || arg.startsWith("http://") ? arg : `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/${arg}`
    },

    // A URL is only downloadable if it is http(s) and points at the known hosts,
    // so javascript:/data: schemes can never become clickable or fetchable.
    validate: url =>
        /^https?:\/\//i.test(url) &&
        (url.indexOf("raw.githubusercontent.com") !== -1 || url.indexOf("github.io") !== -1),

    // Parse "?plugin=A&theme=B&url=C" (also single "?plugin=A") into an ordered,
    // deduped list of URLs
    parse: parameterString => {
        const urls = [];
        const seen = new Set();
        if (typeof parameterString != "string") return urls;
        for (const parameter in window.DownloadApi.converter) {
            const parts = parameterString.split(new RegExp(`[?&]${parameter}=`));
            for (let i = 1; i < parts.length; i++) {
                const arg = parts[i].split(/[?&]/)[0] || "";
                if (!arg) continue;
                const url = window.DownloadApi.converter[parameter](arg);
                if (!seen.has(url)) { seen.add(url); urls.push(url); }
            }
            if (new RegExp(`[?&]${parameter}$`).test(parameterString)) {
                const url = window.DownloadApi.converter[parameter]();
                if (!seen.has(url)) { seen.add(url); urls.push(url); }
            }
        }
        return urls;
    },

    // Fetch and trigger a single browser download.
    // Resolves "ok" | "notfound" | "error".
    download: url =>
        new Promise(resolve => {
            if (!window.DownloadApi.validate(url)) return resolve("error");
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                if (this.status == 200) {
                    const tempLink = document.createElement("a");
                    tempLink.href = window.URL.createObjectURL(new Blob([this.response], { type: `text/${url.split(".").pop()}` }));
                    tempLink.download = url.split("/").pop();
                    tempLink.click();
                    setTimeout(() => window.URL.revokeObjectURL(tempLink.href), 10000);
                    resolve("ok");
                } else {
                    resolve(this.status == 404 ? "notfound" : "error");
                }
            };
            xhttp.onerror = () => resolve("error");
            xhttp.open("GET", url, true);
            xhttp.send();
        })
};

window.DownloadApi = {
    // Builds "<prefix?><a>url</a> <suffix>" safely; href is only set for http(s)
    // so javascript:/data: URLs can never become clickable links.
    linkMessage: (url, suffix, prefix) => {
        const fragment = document.createDocumentFragment();
        if (prefix) fragment.append(prefix + " ");
        const link = document.createElement("a");
        if (/^https?:\/\//i.test(url)) link.href = url;
        link.textContent = url;
        fragment.append(link, " " + suffix);
        return fragment;
    },
    converter: {
        plugin: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Plugins/${arg}/${arg}.plugin.js`,
        theme: arg => `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/Themes/${arg}/${arg}.theme.css`,
        url: arg => arg = arg.startsWith("https://") || arg.startsWith("http://") ? arg : `https://raw.githubusercontent.com/yungsamd17/BetterDiscordAddons/main/${arg}`
    },
    convert: (parameterString, error) => {
        if (typeof parameterString == "string")
            for (let parameter in window.DownloadApi.converter) {
                let arg = (parameterString.split(`?${parameter}=`)[1] || "").split("?")[0] || "";
                if (arg) {
                    window.DownloadApi.download(window.DownloadApi.converter[parameter](arg), error);
                    break;
                } else if (parameterString.endsWith(`?${parameter}`)) {
                    window.DownloadApi.download(window.DownloadApi.converter[parameter](), error);
                    break;
                }
            }
    },
    download: (url, error) => {
        if (!url) return error && error("No URL!");
        if (!/^https?:\/\//i.test(url) || (url.indexOf("raw.githubusercontent.com") == -1 && url.indexOf("github.io") == -1))
            return error && error(window.DownloadApi.linkMessage(url, "not a valid GitHub File URL!"));
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            if (this.status == 200) {
                const tempLink = document.createElement("a");
                tempLink.href = window.URL.createObjectURL(new Blob([this.response], { type: `text/${url.split(".").pop()}` }));
                tempLink.download = url.split("/").pop();
                tempLink.click();

                // Downloaded HTML feedback
                const downloadMessage = document.createElement("div");
                downloadMessage.style.margin = "20px";
                const icon = document.createElement("i");
                icon.className = "fa-solid fa-check";
                const label = document.createElement("span");
                label.style.fontFamily = "Arial";
                label.style.fontWeight = "bold";
                label.textContent = " Downloaded ";
                const fileName = document.createElement("span");
                fileName.textContent = url.split("/").pop().split(".")[0];
                downloadMessage.append(icon, label, fileName);
                document.body.appendChild(downloadMessage);

                // Update the title
                document.title = `Downloaded ${fileName.textContent}`;
            }
            if (this.status == 404) error && error(window.DownloadApi.linkMessage(url, "does not exist!", "GitHub File"));
        };
        xhttp.onerror = function() { error && error(window.DownloadApi.linkMessage(url, "does not exist!", "GitHub File")); };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
};

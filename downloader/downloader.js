window.DownloadApi = {
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
        if (url.indexOf("raw.githubusercontent.com") == -1 && url.indexOf("github.io") == -1) return error && error(`<a href="${url}">${url}</a> not a valid GitHub File URL!`);
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            if (this.status == 200) {
                const tempLink = document.createElement("a");
                tempLink.href = window.URL.createObjectURL(new Blob([this.response], { type: `text/${url.split(".").pop()}` }));
                tempLink.download = url.split("/").pop();
                tempLink.click();

                // Downloaded HTML feedback
                const downloadMessage = document.createElement("div");
                const arg = url.split("/").pop().split(".")[0]; // Extracting the argument from the URL
                downloadMessage.innerHTML = `<div style="margin: 20px"><i class="fa-solid fa-check"></i><span style="font-family: Arial; font-weight: bold"> Downloaded </span><span>${arg}</span></div>`;
                document.body.appendChild(downloadMessage);

                // Update the title
                document.title = `Downloaded ${arg}`;
            }
            if (this.status == 404) error && error(`GitHub File <a href="${url}">${url}</a> does not exist!`);
        };
        xhttp.onerror = function() { error && error(`GitHub File <a href="${url}">${url}</a> does not exist!`); };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
};
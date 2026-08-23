window.onload = function() {
    const error = content => {
        document.title = "Downloader Failed";
        if (typeof content == "string") {
            document.body.textContent = content;
        } else {
            document.body.replaceChildren(content);
        }
    };
    if (!window.location.search) error("Nothing to Download found");
    else window.DownloadApi.convert(window.location.search, error);
};
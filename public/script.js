function openLinkInNewTabWithClass(className) {
  const links = document.getElementsByClassName(className);
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      window.open(links[i].href, '_blank');
    });
  }
}
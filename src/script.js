// Define searchMods function
function searchMods(searchTerm) {
  var modCards = document.getElementsByClassName("card2");
  for (var i = 0; i < modCards.length; i++) {
    var links = modCards[i].getElementsByTagName("a");
    var isMatch = false;
    for (var j = 0; j < links.length; j++) {
      var linkText = links[j].textContent;
      // Use a regular expression to match the search term with any word boundary and ignore case
      var regex = new RegExp("\\b" + searchTerm, "gi");
      if (linkText.match(regex)) {
        // Highlight all occurrences of the search term in the link text
        var highlightedLink = linkText.replace(regex, "<mark>$&</mark>");
        links[j].innerHTML = highlightedLink;
        isMatch = true;
      } else {
        links[j].innerHTML = linkText;
      }
    }
    if (isMatch) {
      if (modCards[i] !== null) {
        modCards[i].style.display = "";
    }
    }
  }
}
// Add an event listener to the search input
var searchInput = document.getElementById("search");
searchInput.addEventListener("input", function() {
  var searchTerm = searchInput.value.trim();
  if (searchTerm.length > 1) {
    searchMods(searchTerm);
  } else if (searchTerm.length === 0) {
    searchMods("");
  }
});
searchInput.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    var searchTerm = searchInput.value.trim();
    if (searchTerm.length > 1) {
      var firstMatch = searchMods(searchTerm);
      searchMods(searchTerm);
    } else if (searchTerm.length === 0) {
      searchMods("");
    }
    event.preventDefault();
  }
});
// Open Mods in new tab
function openLinkInNewTabWithClass(className) {
  const links = document.getElementsByClassName(className);
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      window.open(links[i].href, '_blank');
    });
  }
}
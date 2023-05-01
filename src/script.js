// Define searchMods function
function searchMods(searchTerm) {
  var modCards = document.getElementsByClassName("card2");
  for (var i = 0; i < modCards.length; i++) {
    var elements = modCards[i].querySelectorAll("a, p");
    var isMatch = false;
    for (var j = 0; j < elements.length; j++) {
      var elementText = elements[j].textContent;
      // Use a regular expression to match the search term with any word boundary and ignore case
      var regex = new RegExp("\\b" + searchTerm, "gi");
      if (elementText.match(regex)) {
        // Highlight all occurrences of the search term in the element text
        var highlightedElement = elementText.replace(regex, "<mark>$&</mark>");
        elements[j].innerHTML = highlightedElement;
        isMatch = true;
      } else {
        elements[j].innerHTML = elementText;
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
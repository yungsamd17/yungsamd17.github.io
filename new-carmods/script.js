// Search
function myFunction() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  var ulList = document.querySelectorAll("ul#modList"); // Select all <ul> elements with id="modList"

  ulList.forEach(function (ul) {
    var children = ul.querySelectorAll("li");
    children.forEach(function (child) {
      child.style.display = "none";
    });

    li = ul.querySelectorAll("li");
    li.forEach(function (li) {
      a = li.getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li.style.display = "";
      }
    });
  });

  var otherElements = document.querySelectorAll("h2, h3, a:not([id='searchInput'])");
  otherElements.forEach(function (element) {
    var parentUL = element.closest("ul#modList");
    var isExcluded = false;

    // Check if element is excluded from hiding
    if (element.tagName === "A") {
      var ancestorH1 = element.closest("h1");
      var ancestorHeader = element.closest("header");
      var ancestorP = element.closest("p");

      if (ancestorH1 || ancestorHeader || (ancestorP && ancestorP.contains(element))) {
        isExcluded = true;
      }
    }

    // Exclude elements in the rightcolumn div class
    if (element.closest(".rightcolumn")) {
      isExcluded = true;
    }
    // Exclude elements in the footer div class
    if (element.closest(".footer")) {
      isExcluded = true;
    }

    if (!parentUL && !isExcluded) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });

  var searchResultsCount = document.querySelectorAll("ul#modList li:not([style='display: none;'])").length;
  var messageElement = document.getElementById("searchResultsMessage");
  messageElement.textContent = "Found " + searchResultsCount + " matching search result(s).";
}

function handleKeyPress(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    performSearch();
  }
}

function performSearch() {
  var input, filter, searchQuery;
  input = document.getElementById("searchInput");
  filter = input.value.trim();
  searchQuery = encodeURIComponent(filter);

  // Update URL with search query
  var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "?search=" + searchQuery;
  window.location.href = newURL;
}

function clearSearchInput() {
  var input = document.getElementById("searchInput");
  input.value = "";
  performSearch(); // Trigger the search functionality with an empty query
}

function loadSearchResults() {
  var urlParams = new URLSearchParams(window.location.search);
  var searchQuery = urlParams.get("search");
  if (searchQuery) {
    var input = document.getElementById("searchInput");
    input.value = decodeURIComponent(searchQuery);
    myFunction(); // Trigger search functionality
  }
}

// Call loadSearchResults on page load
window.onload = function () {
  loadSearchResults();
  var input = document.getElementById("searchInput");
  input.addEventListener("keypress", handleKeyPress);
};

// Open links in new tab
function openLinksInNewTab(elementId) {
  const ulElements = document.querySelectorAll(`ul#${elementId}`);
  ulElements.forEach(function (ulElement) {
    const links = ulElement.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (event) {
        event.preventDefault();
        if (links[i].hasAttribute('href') && links[i].getAttribute('href') !== '') {
          window.open(links[i].href, '_blank');
        }
      });
    }
  });
}

// Call the function with the element ID
openLinksInNewTab("modList");

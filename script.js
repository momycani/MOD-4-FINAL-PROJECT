function openMenu(){
    document.body.classList.add("menu--open");
}
function closeMenu(){
    document.body.classList.remove('menu--open');
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const spinner = document.getElementById("spinner");
  const searchIcon = document.getElementById("searchIcon");

  const searchNormal = document.getElementById("searchNormal");
  const searchError = document.getElementById("searchError");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const resetBtnHeader = document.getElementById("resetFilterBtnHeader");

  if (!searchBtn || !searchInput || !searchNormal || !searchError) return;

  function showLoading(isLoading) {
    searchIcon?.classList.toggle("is-visible", !isLoading);
    spinner?.classList.toggle("is-visible", isLoading);
    searchBtn.disabled = isLoading;
  }

  function showSearchError() {
    searchNormal.classList.add("hidden");
    searchError.classList.remove("hidden");
  }

  function hideSearchError() {
    searchError.classList.add("hidden");
    searchNormal.classList.remove("hidden");
    searchInput.focus();
  }

function normalizeQuery(q) {
  const x = q.toLowerCase().trim();
    if (["holiday", "holidays", "christmas", "xmas"].includes(x)) return "holiday";
    if (["family", "families"].includes(x)) return "family";
    if (["action", "actions"].includes(x)) return "action";
        return "other";
}

  async function runSearch() {
    const rawQuery = searchInput.value.trim();
    const type = normalizeQuery(rawQuery);

    if (type === "other") {
      showSearchError();
      localStorage.removeItem("movieQuery");
      localStorage.removeItem("movieCategory");
      return;
    }

    localStorage.setItem("movieCategory", type);

    const queryForApi = type === "holiday" ? "christmas" :
      type === "family" ? "family" :
      type === "action" ? "action" : "";

      // inside runSearch(), after you validate holiday/family/action
    localStorage.setItem("moviesMode", "search");
    localStorage.setItem("movieQuery", queryForApi); // christmas/family/action
    window.open("movies.html", "_blank");


    localStorage.setItem("movieQuery", queryForApi);
    
    showLoading(true);
    try {
      window.open("movies.html", "_blank");
    } finally {
      showLoading(false);
    }
  }

  searchBtn.addEventListener("click", runSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  });

  searchInput.addEventListener("input", hideSearchError);
  tryAgainBtn?.addEventListener("click", hideSearchError);

    resetBtnHeader?.addEventListener("click", () => {
      localStorage.removeItem("movieQuery");
      searchInput.value = "";
      hideSearchError();
    });
  });

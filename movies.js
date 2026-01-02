const API_KEY = 'fca438ff';

let allMoviesData = null; 
let currentMovies = [];
let searchBtn;
let searchInput;
let spinner;
let searchIcon;
let noResults;
let resetBtn;
let moviesContainer;

document.addEventListener("DOMContentLoaded", () => {
  const isHomePage = !!document.getElementById("searchBtn");
  const isMoviesPage = !!document.getElementById("moviesList");

  // MOVIES PAGE: render results here
  if (isMoviesPage) {
    moviesContainer = document.getElementById("moviesList");
    initializeMovies();
    return;
  }

  // HOME PAGE: only save category + open new tab
  if (isHomePage) {
    moviesContainer = document.getElementById("moviesResults"); // only used to show/hide "no results" if you want
    setupHomeSearch();
  }
}); 

  function setupHomeSearch() {
  searchBtn = document.getElementById("searchBtn");
  searchInput = document.querySelector(".header__search--input");
  // spinner = document.getElementById("spinner");
  // searchIcon = document.getElementById("searchIcon");  
  // noResults = document.getElementById("noResults");
  // resetBtn = document.getElementById("resetFilterBtn");

  // if (!searchBtn || !searchInput || !moviesContainer) return;

  // function showNoResults() {
  //   noResults?.classList.remove("hidden");
  //   moviesContainer.classList.add("hidden");
  // }

  // function hideNoResults() {
  //   noResults?.classList.add("hidden");
  //   moviesContainer.classList.remove("hidden");
  // }
  
  function normalizeQuery(q) {
    const x = q.toLowerCase().trim();
    if (["holiday", "holidays", "christmas", "xmas"].includes(x)) return "holiday";
    if (["family", "families"].includes(x)) return "family";
    if (["action", "actions"].includes(x)) return "action";
    return "other";
  }

  // function showLoading(isLoading) {
  //   if (!spinner || !searchIcon) return;
  //   searchIcon.classList.toggle("is-visible", !isLoading);
  //   spinner.classList.toggle("is-visible", isLoading);
  //   searchBtn.disabled = isLoading;
  // }

  async function runSearch() {        
    const type = normalizeQuery(searchInput.value);

    localStorage.setItem("movieCategory", type);
   
    window.open('movies.html', '_blank');

    if (type === "other") {
      showNoResults();
      return;
    }

    hideNoResults();
    showLoading(true);    
    
    try {
      if (!allMoviesData) {
        allMoviesData = await fetchMovies();           
      }

      // if (type === "holiday") renderMovies(allMoviesData.christmasMovies);
      // if (type === "family") renderMovies(allMoviesData.familyMovies);
      // if (type === "action") renderMovies(allMoviesData.actionMovies);
      
      // document.getElementById("browseMoviesLink").click();

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
  
  resetBtn?.addEventListener("click", async () => {
    searchInput.value = "";
    hideNoResults();

  if (!allMoviesData) allMoviesData = await fetchMovies(); 
    
    currentMovies = [
      ...allMoviesData.christmasMovies,
      ...allMoviesData.familyMovies,
      ...allMoviesData.actionMovies
    ];
     renderMovies(currentMovies);
  });

  moviesContainer.addEventListener("click", (event) => {
    const movieElement = event.target.closest(".movie"); 
    if (!movieElement) return;

    const imdbID = movieElement.getAttribute("data-imdbid"); 
    openMovieModal(imdbID);
  });
}; 

/* end DOM */




async function fetchMovies() {
    const urls = [
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=christmas`,
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=family`,
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=action`
    ];
    const response = await Promise.all(
        urls.map(url => fetch(url))
    );

    const data = await Promise.all(
        response.map(res => res.json())
    );
    const allMovies = {
        christmasMovies: data[0].Search || [],
        familyMovies: data[1].Search || [],
        actionMovies: data[2].Search || []
    };

    return allMovies;
}

const DEFAULT_PRICE_GROUP = "MEDIUM";

const PRICE_GROUPS = {
  LOW:    { rent: "3.95", purchase: "18.95" },
  MEDIUM: { rent: "4.95", purchase: "19.95" },
  HIGH:   { rent: "5.95", purchase: "20.95" },
  PREMIUM:{ rent: "6.95", purchase: "21.95" }
};

const movieMeta = {
  tt0107688: { priceGroup: "MEDIUM" },
  tt1711525: { priceGroup: "MEDIUM" },
  tt8623904: { priceGroup: "MEDIUM" },
  tt2990140: { priceGroup: "HIGH" },
  tt0097958: { priceGroup: "PREMIUM" },
  tt1268799: { priceGroup: "LOW" },
  tt0170016: { priceGroup: "LOW" },
  tt0085334: { priceGroup: "LOW" },
  tt0104940: { priceGroup: "LOW" },
  tt1067106: { priceGroup: "LOW" },

  tt1442437: { priceGroup: "PREMIUM" },
  tt9544034: { priceGroup: "MEDIUM" },
  tt7401588: { priceGroup: "MEDIUM" },
  tt0356680: { priceGroup: "MEDIUM" },
  tt0182576: { priceGroup: "MEDIUM" },
  tt6513120: { priceGroup: "LOW" },
  tt2404311: { priceGroup: "HIGH" },
  tt0218967: { priceGroup: "HIGH" },
  tt0106220: { priceGroup: "HIGH" },
  tt0101272: { priceGroup: "HIGH" },

  tt0107362: { priceGroup: "HIGH" },
  tt13423846: { priceGroup: "PREMIUM" },
  tt21191806: { priceGroup: "MEDIUM" },
  tt15600222: { priceGroup: "MEDIUM" },
  tt6495770: { priceGroup: "MEDIUM" },
  tt0087727: { priceGroup: "LOW" },
  tt0089604: { priceGroup: "LOW" },
  tt0094612: { priceGroup: "LOW" },
  tt0120633: { priceGroup: "LOW" },
  tt0318155: { priceGroup: "LOW" }
};

function renderMovies(movies) {
  if (!moviesContainer) return;

  moviesContainer.innerHTML = movies
    .map(movie => {
      const meta = movieMeta[movie.imdbID] || {};
      const group = meta.priceGroup || DEFAULT_PRICE_GROUP;
      const prices = PRICE_GROUPS[group] || PRICE_GROUPS[DEFAULT_PRICE_GROUP];

      const poster =
        movie.Poster && movie.Poster !== "N/A"
          ? movie.Poster
          : "assets/no-image.png";

      return `
        <div class="movie" data-imdbid="${movie.imdbID}">
          <figure class="movie__img--wrapper">
            <img class="movie__img" src="${poster}" alt="${movie.Title}" />
          </figure>
          <h3 class="movie__title">${movie.Title}</h3>
          <div class="movie__prices">
            <span class="movie__price--purchase">Purchase: $${prices.purchase}</span>
            <span>Rent: $${prices.rent}</span>
          </div>
        </div>
      `;
    })
    .join("");
}


async function openMovieModal(imdbID) {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
  );
  const movie = await res.json();
}

async function init() {
  allMoviesData = await fetchMovies();
  initializeMovies();  
}



async function initializeMovies() {
    if (!allMoviesData) allMoviesData = await fetchMovies();

  const type = localStorage.getItem("movieCategory") || "all";

  if (type === "holiday") currentMovies = allMoviesData.christmasMovies;
  else if (type === "family") currentMovies = allMoviesData.familyMovies;
  else if (type === "action") currentMovies = allMoviesData.actionMovies;
  else currentMovies = [
    ...allMoviesData.christmasMovies,
    ...allMoviesData.familyMovies,
    ...allMoviesData.actionMovies
  ];

    renderMovies(currentMovies);    
  }

function filterMovies(event) {
  const value = event.target.value;
  initializeMovies(value);

  if (value === "LOW_TO_HIGH" || value === "HIGH_TO_LOW") {
    sortByPrice(value);
    return;
  }

  if (value === "A_to_Z") {
    sortAZ();
    return;
  }
}


function priceHTML(purchasePrice, rentPrice) {
  if (!rentPrice) {
    return `$${purchasePrice.toFixed(2)}`;
  } else {
    return `<span class="movie__price--purchase">$${purchasePrice.toFixed(2)}</span>$${rentPrice.toFixed(2)}`;
  }
}

function sortByPrice(order) {
  const sorted = [...currentMovies].sort((a, b) => {
    const metaA = movieMeta[a.imdbID] || {};
    const metaB = movieMeta[b.imdbID] || {};

    const priceA = Number(PRICE_GROUPS[metaA.priceGroup]?.purchase);
    const priceB = Number(PRICE_GROUPS[metaB.priceGroup]?.purchase);

    return order === "LOW_TO_HIGH"
      ? priceA - priceB
      : priceB - priceA;
  });

  renderMovies(sorted);
}

function sortAZ() {
  const sorted = [...currentMovies].sort((a, b) =>
    a.Title.localeCompare(b.Title)
  );

  renderMovies(sorted);
}



/* CHRISTMAS */

//  https://www.omdbapi.com/?i=tt3896198&apikey=fca438ff&s=christmas
//  https://www.omdbapi.com/?i=tt3896198&apikey=fca438ff&s=family
//  https://www.omdbapi.com/?i=tt3896198&apikey=fca438ff&s=action

const christmasMovies = [
    
// {
// "Title": "The Nightmare Before Christmas",
// "Year": "1993",
// "imdbID": "tt0107688",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNmYxOTAzZWYtOGI3Yi00ODc3LTk5ZjYtZTY0MzVkZTg3YmRiXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "How the Grinch Stole Christmas",
// "Year": "2000",
// "imdbID": "tt0170016",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNDAwMjFhYTEtNzYyMS00YmY2LTg3MGEtZTRkNWNiMDI4MDRkXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "National Lampoon's Christmas Vacation",
// "Year": "1989",
// "imdbID": "tt0097958",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZDgxYzI2YWItNmUyNS00ZWE4LWEzZDctYTk1M2VkYjhkOWVmXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "A Christmas Story",
// "Year": "1983",
// "imdbID": "tt0085334",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZWZhYzI1YjktYzJjYy00NjIwLWE0MGItNWM4YWM2ZjFkNGM0XkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "A Christmas Carol",
// "Year": "2009",
// "imdbID": "tt1067106",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMTM1MTI5ODU4MV5BMl5BanBnXkFtZTcwNTYyNTU4Mg@@._V1_SX300.jpg"
// },
// {
// "Title": "Last Christmas",
// "Year": "2019",
// "imdbID": "tt8623904",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BY2NlNTMwYzgtZjI2Ny00ZWExLWE2NDUtNzFlYTQyMmY1NjkwXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Office Christmas Party",
// "Year": "2016",
// "imdbID": "tt1711525",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMDhiMjg4ODMtYjgyNi00YjZkLWE0ZGItNjU0NGVlMzViZjdlXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Christmas Chronicles",
// "Year": "2018",
// "imdbID": "tt2990140",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNTA3NjU3OTM2MV5BMl5BanBnXkFtZTgwNjQ2MzE1NjM@._V1_SX300.jpg"
// },
// {
// "Title": "The Muppet Christmas Carol",
// "Year": "1992",
// "imdbID": "tt0104940",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNTIwOTAyMDgtNTY1Zi00ZWMyLWFjMjAtNjI5YWIyOTE2NDJhXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "A Very Harold & Kumar Christmas",
// "Year": "2011",
// "imdbID": "tt1268799",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMzA1NTQzMjAyOV5BMl5BanBnXkFtZTcwNDcyMjY2Ng@@._V1_SX300.jpg"
// }
];

/* FAMILY */

const familyMovies = [
// {
// "Title": "Modern Family",
// "Year": "2009–2020",
// "imdbID": "tt1442437",
// "Type": "series",
// "Poster": "https://m.media-amazon.com/images/M/MV5BYzFlOWFjNzQtODViNC00NzgzLThhZmItZTc1N2VlZDgwODUwXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Family Guy",
// "Year": "1999–",
// "imdbID": "tt0182576",
// "Type": "series",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNTZlMGQ1YjEtMzVlNC00ZmMxLTk0MzgtZjdkYTU1NmUxNTQ0XkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Addams Family",
// "Year": "1991",
// "imdbID": "tt0101272",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZWY0MzVlNGEtYzM1MC00OTI4LWE3ZTQtNWJjYzk2Y2MyNjVkXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Instant Family",
// "Year": "2018",
// "imdbID": "tt7401588",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZjM3NTYzYWItMzY0YS00NjliLTg3MzktYzZkM2Q5YTA5MDExXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Family Man",
// "Year": "2000",
// "imdbID": "tt0218967",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BN2I4ODE3YzQtMzZhMy00YjhlLWE1MmMtYTA0MjkxNTJmMTZlXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Family",
// "Year": "2013",
// "imdbID": "tt2404311",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMjE2MzI0MzkyNV5BMl5BanBnXkFtZTcwMjQ2MDM2OQ@@._V1_SX300.jpg"
// },
// {
// "Title": "Addams Family Values",
// "Year": "1993",
// "imdbID": "tt0106220",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BYWY3Y2ZkYjktZWYxMC00ZmZmLTgxNjYtYmMwYmU5OWJjMThjXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Family Man",
// "Year": "2019–",
// "imdbID": "tt9544034",
// "Type": "series",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMDc3NWMwNGMtYjc3Mi00NzU5LWFiYjgtMTJjZGE3ZmFiNzRjXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Fighting with My Family",
// "Year": "2019",
// "imdbID": "tt6513120",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BYjliMDY3N2YtOTI2NS00MjQ0LWFjOGItMjQ1MzYyZGVlMDJiXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "The Family Stone",
// "Year": "2005",
// "imdbID": "tt0356680",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BOWRjNzY1MmItNDUwNS00MGMzLWFkN2UtMTEzYjU4MmE2ZDAxXkEyXkFqcGc@._V1_SX300.jpg"
// }
];

// /* ACTION */

const actionMovies = [
// {
// "Title": "Last Action Hero",
// "Year": "1993",
// "imdbID": "tt0107362",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZGU2NWQyY2ItY2JiZS00ZDJhLWI0NDQtNjMyNWU3MDA1NTgzXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Back in Action",
// "Year": "2025",
// "imdbID": "tt21191806",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMWQ4YWYxYTAtZTlhNC00Nzc3LWE3OWUtZjY5MThlNWNiYTBiXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Looney Tunes: Back in Action",
// "Year": "2003",
// "imdbID": "tt0318155",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNDU2NmU2YzktNWFlMC00MDk1LWFhZjQtYjUxZThiMjZhNjQ2XkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "An Action Hero",
// "Year": "2022",
// "imdbID": "tt15600222",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BNWUzNzljNjMtYTdiZS00MWQ2LWFkZWItYTM0MzVmZGFhYzNjXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "A Civil Action",
// "Year": "1998",
// "imdbID": "tt0120633",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMDgyNDNkYTMtYmU0NC00YjliLWFhNjgtMmFhOTQ1MmE4NzNmXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Missing in Action",
// "Year": "1984",
// "imdbID": "tt0087727",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZGE2NmNlODYtMzMyNS00YTM0LThlMzMtNjg1YTBhMTRkNjJhXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Action Jackson",
// "Year": "1988",
// "imdbID": "tt0094612",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMzY1N2NjMjYtM2U3OS00OTMzLTk4OGEtMWI1YjUwMWRjODQ1XkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Action Point",
// "Year": "2018",
// "imdbID": "tt6495770",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BMjEyMTU5MTk1N15BMl5BanBnXkFtZTgwMzIzMzczNTM@._V1_SX300.jpg"
// },
// {
// "Title": "321 Action",
// "Year": "2020",
// "imdbID": "tt13423846",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BODdlNmZiYmItYTkyZC00NDNhLWEzMDctZjJhMDNjZWJkNTRlXkEyXkFqcGc@._V1_SX300.jpg"
// },
// {
// "Title": "Missing in Action 2: The Beginning",
// "Year": "1985",
// "imdbID": "tt0089604",
// "Type": "movie",
// "Poster": "https://m.media-amazon.com/images/M/MV5BZjQwNjUxZjUtYmUxOS00YmRjLTljZTgtMTc0OTFlZDllZjM5XkEyXkFqcGc@._V1_SX300.jpg"
// }
];

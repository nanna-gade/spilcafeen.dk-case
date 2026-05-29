"use strict"; // Gør JavaScript mere sikkert og hjælper med at undgå fejl

// ===== GLOBALE VARIABLER OG KONSTANTER =====

// URL til JSON-fil med alle brætspil
const GAMES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/master/data/games.json";

// Array der skal gemme alle spillene
let allGames = [];


// ===== DOM-ELEMENTER =====

// Finder HTML-elementerne så JavaScript kan arbejde med dem

const gameList = document.querySelector("#game-list"); // Container til alle spilkort
const genreSelect = document.querySelector("#genre-select"); // Genre dropdown
const searchInput = document.querySelector("#search-input"); // Søgefelt
const sortSelect = document.querySelector("#sort-select"); // Sortering dropdown
const gameCount = document.querySelector("#game-count"); // Tekst der viser antal spil


// ===== HENT DATA FRA API =====

// Kalder funktionen med det samme
fetchGames();


// Async funktion bruges fordi vi henter data online
async function fetchGames() {

  try {
    
    // Henter data fra URL
    const response = await fetch(GAMES_URL);

    // Konverterer data til JavaScript objekt
    const data = await response.json();

    // Gemmer alle spil i arrayet
    allGames = data;

    // Fylder genre dropdown ud
    populateGenreSelect();

    // Viser spillene
    applyFiltersAndSort();

  } catch (error) {

    // Hvis der sker fejl
    console.error("Fejl ved hentning:", error);
  }
}


// ===== UDFYLD GENRE DROPDOWN =====

function populateGenreSelect() {

  // Set bruges for at undgå dubletter
  const genres = new Set();

  // Går igennem alle spil
  for (const game of allGames) {

    // Tjekker om genre er et array
    if (Array.isArray(game.genre)) {

      // Går igennem hver genre
      for (const g of game.genre) {
        genres.add(g); // Tilføjer genre til Set
      }

    } else {

      // Hvis genre kun er én tekst
      genres.add(game.genre);
    }
  }

  // Sorterer genrer alfabetisk
  const sortedGenres = [...genres].sort((a, b) =>
    a.localeCompare(b)
  );

  // Opretter option elementer i dropdown
  for (const genre of sortedGenres) {

    genreSelect.insertAdjacentHTML(
      "beforeend",

      // Dynamisk HTML
      `<option value="${genre}">${genre}</option>`
    );
  }
}


// ===== FILTRERING OG SORTERING =====

function applyFiltersAndSort() {

  // Henter værdier fra brugerinput
  const selectedGenre = genreSelect.value;
  const searchValue = searchInput.value.trim().toLowerCase();
  const sortOption = sortSelect.value;

  // Filtrerer spillene
  let filteredGames = allGames.filter((game) => {

    // Sørger for at genre altid er et array
    const genres = Array.isArray(game.genre)
      ? game.genre
      : [game.genre];

    // Tjekker om genre matcher
    const matchesGenre =
      selectedGenre === "all" || genres.includes(selectedGenre);

    // Tjekker om søgning matcher titel
    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchValue);

    // Returnerer kun spil der matcher begge
    return matchesGenre && matchesSearch;
  });

  // Sortering efter titel
  if (sortOption === "title") {

    filteredGames.sort((a, b) =>
      a.title.localeCompare(b.title)
    );

  // Sortering efter årstal
  } else if (sortOption === "year") {

    filteredGames.sort((a, b) => b.year - a.year);
  }

  // Viser de filtrerede spil
  showGames(filteredGames);
}


// ===== VISNING AF SPIL (LISTE) =====

function showGames(games) {

  // Tømmer listen først
  gameList.innerHTML = "";

  // Viser antal spil
  gameCount.textContent =
    `Viser ${games.length} ud af ${allGames.length} spil`;

  // Hvis ingen spil matcher
  if (games.length === 0) {

    gameList.innerHTML =
      '<p class="empty">Ingen spil matcher din søgning.</p>';

    return;
  }

  // Går igennem alle spil
  for (const game of games) {

    // Viser ét spilkort ad gangen
    showGame(game);
  }
}


// ===== OPRET SPILKORT =====

function showGame(game) {

  // Hvis genre er array -> samles med komma
  const genres = Array.isArray(game.genre)
    ? game.genre.join(", ")
    : game.genre;

  // Viser antal spillere
  const players = game.players
    ? `${game.players.min}-${game.players.max} spillere`
    : "Ukendt";

  // Dynamisk HTML til spilkort
  const html = `
    <article class="game-card" tabindex="0">

      <!-- Billede -->
      <img src="${game.image}" alt="${game.title}" class="game-poster" />

      <!-- Info -->
      <div class="game-info">
        <h2>${game.title}</h2>
        <p class="players">${players}</p>
        <p class="genre">${genres}</p>
      </div>

    </article>
  `;

  // Indsætter HTML i gameList
  gameList.insertAdjacentHTML("beforeend", html);

  // Finder det nyeste kort
  const newCard = gameList.lastElementChild;

  // Når man klikker på kortet
  newCard.addEventListener("click", () => showGameDialog(game));

  // Tastatur accessibility
  newCard.addEventListener("keydown", (event) => {

    // Hvis Enter trykkes
    if (event.key === "Enter") {

      // Åbn popup
      showGameDialog(game);
    }
  });
}


// ===== DIALOG / POPUP MED SPILINFO =====

function showGameDialog(game) {

  // Finder dialog element
  const dialog = document.querySelector("#game-dialog");

  // Finder indholdet
  const content = document.querySelector("#dialog-content");

  // Genre tekst
  const genres = Array.isArray(game.genre)
    ? game.genre.join(", ")
    : game.genre;

  // Spillere tekst
  const players = game.players
    ? `${game.players.min}-${game.players.max} spillere`
    : "Ukendt";

  // Dynamisk HTML i popup
  content.innerHTML = `
<div class="popup-left">

  <!-- Billede -->
  <img src="${game.image}" style="width:100%; max-height:300px; object-fit:contain; border-radius:8px;" />

  <!-- Like knap -->
  <button type="button" class="like-button" id="like-btn" title="Gem dette spil">
    <i class="fa-regular fa-bookmark"></i>
  </button>

  <!-- Spilleregler -->
  <a href="#" class="rules-btn">
    Spilleregler
  </a>

</div>

<div class="popup-right">

  <h2>${game.title}</h2>

<!-- Information -->
<div class="game-details">

  <div class="detail-card">
    <strong>Genre</strong>
    <span>${genres}</span>
  </div>

  <div class="detail-card">
    <strong>Spillere</strong>
    <span>${players}</span>
  </div>

  <div class="detail-card">
    <strong>Alder</strong>
    <span>${game.age}+</span>
  </div>

  <div class="detail-card">
    <strong>Spilletid</strong>
    <span>${game.playtime} min</span>
  </div>

  <div class="detail-card">
    <strong>Sprog</strong>
    <span>${game.language}</span>
  </div>

  <div class="detail-card">
    <strong>Sværhedsgrad</strong>
    <span>${game.difficulty}</span>
  </div>

  <div class="detail-card">
    <strong>Rating</strong>
    <span>${game.rating}</span>
  </div>

  <div class="detail-card">
    <strong>Lokation</strong>
    <span>${game.location}</span>
  </div>

  <div class="detail-card">
    <strong>Hylde</strong>
    <span>${game.shelf}</span>
  </div>

</div>

<div class="description">
  <p>${game.description}</p>
</div>
  `;

  // ===== LIKE-KNAP =====

  // Finder like-knappen
  const likeBtn = content.querySelector("#like-btn");

  // Når man klikker
likeBtn.addEventListener("click", () => {

  const icon = likeBtn.querySelector("i");

  icon.classList.toggle("fa-regular");
  icon.classList.toggle("fa-solid");

  likeBtn.classList.toggle("liked");
});

// Åbner popup
dialog.showModal();

}

// ===== LUK DIALOG =====

// Finder lukkeknap
document
  .querySelector("#close-dialog")

  // Når der klikkes
  .addEventListener("click", () => {

    // Luk popup
    document.querySelector("#game-dialog").close();
  });


// ===== EVENT LISTENERS =====

// Når genre ændres
genreSelect.addEventListener("change", applyFiltersAndSort);

// Når brugeren skriver
searchInput.addEventListener("input", applyFiltersAndSort);

// Når sortering ændres
sortSelect.addEventListener("change", applyFiltersAndSort);
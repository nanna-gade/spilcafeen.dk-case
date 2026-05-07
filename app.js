"use strict";

// ===== GLOBALE VARIABLER OG KONSTANTER =====
const GAMES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/master/data/games.json";

let allGames = [];

// ===== DOM-ELEMENTER =====
const gameList = document.querySelector("#game-list");
const genreSelect = document.querySelector("#genre-select");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const gameCount = document.querySelector("#game-count");

// ===== HENT DATA FRA API =====
fetchGames();

async function fetchGames() {
  try {
    const response = await fetch(GAMES_URL);
    const data = await response.json();

    allGames = data;

    populateGenreSelect();
    applyFiltersAndSort();
  } catch (error) {
    console.error("Fejl ved hentning:", error);
  }
}

// ===== UDFYLD GENRE DROPDOWN =====
function populateGenreSelect() {
  const genres = new Set();

  for (const game of allGames) {
    if (Array.isArray(game.genre)) {
      for (const g of game.genre) {
        genres.add(g);
      }
    } else {
      genres.add(game.genre);
    }
  }

  const sortedGenres = [...genres].sort((a, b) =>
    a.localeCompare(b)
  );

  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}

// ===== FILTRERING OG SORTERING =====
function applyFiltersAndSort() {
  const selectedGenre = genreSelect.value;
  const searchValue = searchInput.value.trim().toLowerCase();
  const sortOption = sortSelect.value;

  let filteredGames = allGames.filter((game) => {
    const genres = Array.isArray(game.genre)
      ? game.genre
      : [game.genre];

    const matchesGenre =
      selectedGenre === "all" || genres.includes(selectedGenre);

    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchValue);

    return matchesGenre && matchesSearch;
  });

  if (sortOption === "title") {
    filteredGames.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortOption === "year") {
    filteredGames.sort((a, b) => b.year - a.year);
  }

  showGames(filteredGames);
}

// ===== VISNING AF SPIL (LISTE) =====
function showGames(games) {
  gameList.innerHTML = "";

  gameCount.textContent = `Viser ${games.length} ud af ${allGames.length} spil`;

  if (games.length === 0) {
    gameList.innerHTML =
      '<p class="empty">Ingen spil matcher din søgning.</p>';
    return;
  }

  for (const game of games) {
    showGame(game);
  }
}

// ===== OPRET SPILKORT =====
function showGame(game) {
  const genres = Array.isArray(game.genre)
    ? game.genre.join(", ")
    : game.genre;

  const players = game.players
    ? `${game.players.min}-${game.players.max} spillere`
    : "Ukendt";

  const html = `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" alt="${game.title}" class="game-poster" />
      <div class="game-info">
        <h2>${game.title}</h2>
        <p class="players">${players}</p>
        <p class="genre">${genres}</p>
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", html);

  const newCard = gameList.lastElementChild;

  newCard.addEventListener("click", () => showGameDialog(game));

  newCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      showGameDialog(game);
    }
  });
}

// ===== DIALOG / POPUP MED SPILINFO =====
function showGameDialog(game) {
  const dialog = document.querySelector("#game-dialog");
  const content = document.querySelector("#dialog-content");

  const genres = Array.isArray(game.genre) ? game.genre.join(", ") : game.genre;
  const players = game.players ? `${game.players.min}-${game.players.max} spillere` : "Ukendt";

  content.innerHTML = `
    <h2>${game.title}</h2>
    
    <button type="button" class="like-button" id="like-btn" title="Like dette spil">❤</button>

    <img src="${game.image}" style="width:100%; max-height: 300px; object-fit: contain; margin-bottom:10px; border-radius: 8px;" />

    <div class="game-details">
        <p><strong>Genre:</strong> ${genres}</p>
        <p><strong>Spillere:</strong> ${players}</p>
        <p><strong>Alder:</strong> ${game.age}+</p>
        <p><strong>Spilletid:</strong> ${game.playtime} min</p>
        <p><strong>Sprog:</strong> ${game.language}</p>
        <p><strong>Sværhedsgrad:</strong> ${game.difficulty}</p>
        <p><strong>Rating:</strong> ${game.rating}</p>
        <p><strong>Lokation:</strong> ${game.location}</p>
        <p><strong>Hylde:</strong> ${game.shelf}</p>
        <p><strong>Beskrivelse:</strong> ${game.description}</p>
    </div>
  `;

  // ===== LIKE-KNAP FUNKTION =====
  const likeBtn = content.querySelector("#like-btn");
  likeBtn.addEventListener("click", () => {
    likeBtn.classList.toggle("liked");
  });

  dialog.showModal();
}

// ===== LUK DIALOG =====
document
  .querySelector("#close-dialog")
  .addEventListener("click", () => {
    document.querySelector("#game-dialog").close();
  });

// ===== EVENT LISTENERS (BRUGERINPUT) =====
genreSelect.addEventListener("change", applyFiltersAndSort);
searchInput.addEventListener("input", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);
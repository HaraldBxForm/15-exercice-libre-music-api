// ==============================
// 🌱 SÉLECTION DES ÉLÉMENTS DU DOM
// ==============================

// Inputs utilisateur
const inputArtist = document.querySelector(`.input-artist`);
const inputTitle = document.querySelector(`.input-title`);

// Conteneurs d'affichage
const lyricsContainer = document.querySelector(`.lyrics-container`);
const musciBoxContainer = document.querySelector(`.music-box`);
const songContent = document.querySelector(`.song-content`);
const recoContainer = document.querySelector(`.reco-wrapper`);
const welcomeMessageContainer = document.querySelector(`.welcome-message-container`);

// Bouton de recherche
const searchButton = document.querySelector(`.search-button`);


// ==============================
// 🎊 FONCTIONNALITÉS PRINCIPALES
// ==============================

/**
 * 🔡 Récupère les paroles d'une chanson depuis l'API Lyrics.ovh
 */
async function getMusicLyrics(artist, title) {
  try {
    const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    const data = await response.json();
    return data.lyrics;
  } catch (error) {
    console.error("Erreur :", error);
  }
}

/**
 * 🔊 Récupère les infos audio depuis l'API iTunes
 */
async function getMusicAudio(artist, title) {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + title)}&media=music&limit=1`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur :", error);
  }
}

/**
 * 📃 Affiche les paroles dans le DOM
 */
async function displayLyrics(artist, title) {
  const lyrics = await getMusicLyrics(artist, title);

  songContent.classList.add(`active`);
  lyricsContainer.classList.add(`active`);

  // Si paroles absentes ou vides, afficher message d'erreur
  if (!lyrics || lyrics.trim() === "") {
    lyricsContainer.innerHTML = `<h2 class="section-title lyrics-title">${title}</h2><div class="lyrics-box not-found-message"><i class="fa-solid fa-music"></i>  Lyrics not found  <i class="fa-solid fa-music"></i></div>`;
  } else {
    lyricsContainer.innerHTML = `<h2 class="section-title lyrics-title">${title}</h2><div class="lyrics-box">${lyrics}</div>`;
  }
}

/**
 * 🎼 Affiche le morceau principal avec lecteur audio
 */
async function displaySong(artist, title) {
  const song = await getMusicAudio(artist, title);
  if (!song.results || song.results.length === 0) return;
  const result = song.results[0];

  // 🖼️ Affichage des infos chanson
  musciBoxContainer.innerHTML = `
    <div class="music-box-content">
      <a href="${result.artistViewUrl}" target="_blank"><h2 class="artist">${result.artistName}</h2></a>
      <a href="${result.trackViewUrl}" target="_blank"><h1 class="title">${result.trackName}</h1></a>
      <a href="${result.collectionViewUrl}" target="_blank"><h2 class="album">${result.collectionName}</h2></a>
      <a href="${result.collectionViewUrl}" class="img-container" target="_blank">
        <img src="${result.artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg')}" alt="">
      </a>
      <div class="spotify-player audio-container">
        <button id="playPause"><i class="fa fa-play"></i></button>
        <input type="range" id="progress" value="0">
        <span id="current">0:00</span> / <span id="duration">0:00</span>
        <audio id="audio" src="${result.previewUrl}"></audio>
      </div>
    </div>`;

  // 🎛️ Gestion du lecteur audio
  const audio = document.getElementById("audio");
  const playPause = document.getElementById("playPause");
  const progress = document.getElementById("progress");
  const current = document.getElementById("current");
  const duration = document.getElementById("duration");

  playPause.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPause.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
      audio.pause();
      playPause.innerHTML = '<i class="fa fa-play"></i>';
    }
  });

  audio.addEventListener("timeupdate", () => {
    progress.value = (audio.currentTime / audio.duration) * 100;
    current.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
  });

  progress.addEventListener("input", () => {
    audio.currentTime = (progress.value / 100) * audio.duration;
  });

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}


/**
 * 💡 Appelle l’API Last.fm pour obtenir les morceaux populaires
 */
async function getReco() {
  try {
    const response = await fetch('https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=9e7cab0511a7d5c1b5c4546f975a834c&format=json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur :", error);
  }
}


/**
 * 🔁 Affiche un morceau recommandé (vignette + lecteur)
 */
async function displaySongReco(artist, title) {
  const song = await getMusicAudio(artist, title);
  if (!song.results || song.results.length === 0) return;

  const result = song.results[0];
  const div = document.createElement("div");
  div.classList.add("music-box-reco");
  div.innerHTML = `
      <a href="${result.artistViewUrl}" target="_blank"><h2 class="artist">${result.artistName}</h2></a>
      <a href="${result.trackViewUrl}" target="_blank"><h1 class="title">${result.trackName}</h1></a>
      <a href="${result.collectionViewUrl}" target="_blank"><h2 class="album">${result.collectionName}</h2></a>
      <a href="${result.collectionViewUrl}" class="img-container" target="_blank">
        <img src="${result.artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg')}" alt="">
      </a>
      <div class="spotify-player audio-container">
        <button class="playPause"><i class="fa fa-play"></i></button>
        <input type="range" class="progress" value="0">
        <audio class="audio" src="${result.previewUrl}"></audio>
      </div>`;

  recoContainer.appendChild(div);

  // 🎧 Gestion audio pour les reco
  const audio = div.querySelector(".audio");
  const playPause = div.querySelector(".playPause");
  const progress = div.querySelector(".progress");
  const current = div.querySelector(".current");
  const duration = div.querySelector(".duration");

  playPause.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPause.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
      audio.pause();
      playPause.innerHTML = '<i class="fa fa-play"></i>';
    }
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    current.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
  });

  progress.addEventListener("input", () => {
    audio.currentTime = (progress.value / 100) * audio.duration;
  });

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

/**
 * 📀 Affiche une liste de recommandations (top 20)
 */
async function displayReco() {
  const recos = await getReco();
  const recosList = recos.tracks.track.slice(0, 20); // Limite à 20 morceaux
  recoContainer.innerHTML = "";

  const promises = recosList.map(async (track) => {
    const artist = track.artist.name;
    const title = track.name;
    const song = await getMusicAudio(artist, title);
    if (song.results && song.results.length > 0) {
      await displaySongReco(artist, title);
      return true;
    }
    return false;
  });

  const results = await Promise.all(promises);
  const count = results.filter(Boolean).length;
  console.log(`Morceaux affichés : ${count}`);
}


// ==============================
// 🧲 GESTION DES ÉVÉNEMENTS
// ==============================

/**
 * 🔍 Recherche manuelle via bouton
 */
searchButton.addEventListener(`click`, async (e) => {
  e.preventDefault();

  if (!inputArtist.value && !inputTitle.value) {
    inputArtist.focus();
  } else {
    welcomeMessageContainer.classList.add(`hidden`);
    await displayLyrics(inputArtist.value, inputTitle.value);
    await displaySong(inputArtist.value, inputTitle.value);
  }
});

/**
 * 🚀 Affichage automatique des reco au chargement
 */
document.addEventListener("DOMContentLoaded", () => {
  displayReco();
});

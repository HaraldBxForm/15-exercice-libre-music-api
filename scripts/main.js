// ==============================
// 🌱 Sélection des éléments
// ==============================

// Inputs
const inputArtist = document.querySelector(`.input-artist`);
const inputTitle = document.querySelector(`.input-title`);

// Display
const lyricsContainer = document.querySelector(`.lyrics-container`);
const musciBoxContainer = document.querySelector(`.music-box`);

// Button
const searchButton = document.querySelector(`.search-button`);
// ==============================
// 🎊 Fonctionnalités
// ==============================

// Appel API's
async function getMusicLyrics(artist, title) {
    try {
      const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
  
      const data = await response.json();
      console.log(data);
  
      return data.lyrics;
      
        
    } catch (error) {
      console.error("Erreur :", error);
    }
  }

//   Test
async function getMusicAudio(artist, title) {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + title)}&media=music&limit=1`);
  
      const data = await response.json();
      console.log(data);
  
      return data;
      
        
    } catch (error) {
      console.error("Erreur :", error);
    }
  }

// Display Lyrics
async function displayLyrics(artist, title) {
    const lyrics = await getMusicLyrics(artist, title);

    lyricsContainer.innerHTML = ``;
    lyricsContainer.innerHTML += `<div class="lyrics-box">${lyrics}</div>`
    
};


// Display Song
async function displaySong(artist, title) {
    const song = await getMusicAudio(artist, title);

    musciBoxContainer.innerHTML = `
    <a href="${song.results[0].artistViewUrl}" target="_blank"><h2 class="artist">${song.results[0].artistName}</h2></a>
    <a href="${song.results[0].trackViewUrl}" target="_blank"><h1 class="title">${song.results[0].trackName}</h1></a>
    <a href="${song.results[0].collectionViewUrl}" target="_blank"><h2 class="album">${song.results[0].collectionName}</h2></a>
    <a href="${song.results[0].collectionViewUrl}" class="img-container" target="_blank">
        <img src="${song.results[0].artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg')}" alt="">
    </a>
    <div class="spotify-player audio-container">
        <button id="playPause"><i class="fa fa-play"></i></button>
        <input type="range" id="progress" value="0">
        <span id="current">0:00</span> / <span id="duration">0:00</span>
        <audio id="audio" src="${song.results[0].previewUrl}"></audio>
    </div>`;

    // 🎧 Ajout dynamique des écouteurs après l'injection
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



// ==============================
// 🧲 Événements
// ==============================

searchButton.addEventListener(`click`, async(e) => {
    e.preventDefault();

    displayLyrics(inputArtist.value, inputTitle.value);
    getMusicAudio(inputArtist.value, inputTitle.value);
    displaySong(inputArtist.value, inputTitle.value);
})



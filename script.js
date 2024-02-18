console.log("Hello brother");
let songs;
let currentSong = new Audio();
let currfolder;

function secondsTominutesSeconds(s) {
  if (isNaN(s) || s < 0) {
    return "00:00";
  }

  const min = Math.floor(s / 60);
  const remains = Math.floor(s % 60);

  const formattedmin = String(min).padStart(2, "0");
  const formateds = String(remains).padStart(2, "0");
  return `${formattedmin}:${formateds}`;
}

async function getSongs(folder) {
  currfolder = folder;

  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the song in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";

  for (const song of songs) {
    // Use template literals for better readability
    songUL.innerHTML += `
      <li>
        <img class="invert" src="IMG/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")} </div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="IMG/play.svg" alt="">
        </div>
      </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = function (track, pause = false) {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "IMG/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`/song/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
 
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors)
   
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/song/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0];
    
      let a = await fetch(`/song/${folder}/info.json`);

      let response = await a.json();
      console.log(response);

      // Use += to append HTML instead of overwriting
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ">
                  <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 
                  7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574
                  5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 
                  5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 
                  12.2916 18.8906 12.846Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" fill="black"/>
              </svg>       
          </div>
          <img src="/song/${folder}/cover.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  // Load the playlist when a card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let song = await getSongs(`song/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}

async function main() {
  // get the list of all songs
  songs = await getSongs(`song/English_Songs`);
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums()

  // Attach event listeners to play, next, and previous buttons
  play.addEventListener("click", function () {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "IMG/pause.svg";
    } else {
      currentSong.pause();
      play.src = "IMG/play.svg";
    }
  });

  // Listen for the timeupdate event
  currentSong.addEventListener("timeupdate", function () {
    document.querySelector(".songtime").innerHTML = `${secondsTominutesSeconds(currentSong.currentTime)}/${secondsTominutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", function (e) {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listeners for the hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add event listeners for previous and next buttons
  previous.addEventListener("click", function () {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", function () {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event listener for the volume range
  let previousVolume = 100; // Initial volume value

  const volume = function(e) {
    currentSong.volume = parseInt(e.target.value) / 100;
  }
  
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", volume);
  
  // Add event listener to mute/unmute the track
  document.querySelector(".volume>img").addEventListener("click", e => {
    const rangeInput = document.querySelector(".range").getElementsByTagName("input")[0];
    
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      previousVolume = parseInt(rangeInput.value);
      currentSong.volume = 0;
      rangeInput.value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = previousVolume / 100; // Restore previous volume
      rangeInput.value = previousVolume;
    }
  });
}

// Start the main function
main();

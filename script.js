// Create falling stars background
function createStars() {
  const pageShell = document.querySelector('.page-shell');
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  pageShell.prepend(starsContainer);

  function createStar() {
    const star = document.createElement('div');
    star.className = 'falling-star';
    
    const size = Math.random() * 2.5 + 0.8;
    const left = Math.random() * 100;
    const duration = Math.random() * 3 + 2.5;
    const delay = Math.random() * 3;
    const opacity = Math.random() * 0.8 + 0.4;
    
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = left + '%';
    star.style.animation = `starFall ${duration}s linear ${delay}s infinite`;
    star.style.opacity = opacity;
    
    starsContainer.appendChild(star);
  }

  for (let i = 0; i < 300; i++) {
    createStar();
  }
}

// Splash screen handler
const splashScreen = document.getElementById('splash-screen');
const pageShell = document.querySelector('.page-shell');

if (splashScreen && pageShell) {
  splashScreen.addEventListener('click', () => {
    splashScreen.classList.add('hidden');
    pageShell.style.display = 'grid';
    createStars();
    requestAnimationFrame(() => {
      pageShell.classList.add('visible');
    });

    if (audio) {
      audio.play().catch(e => console.log('Play error:', e));
    }
  });
}

const panel = document.querySelector('.profile-panel');
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const progressFill = document.querySelector('.progress-fill');
const currentTimeEl = document.querySelector('.time.current');
const totalTimeEl = document.querySelector('.time.total');
const discordStatusEl = document.getElementById('discord-status');
const nlTimeEl = document.getElementById('nl-time');

const LANYARD_API_URL = 'https://api.lanyard.rest/v1/users/545564157026631701';

const DISCORD_STATUS_LABELS = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline'
};

// Discord Status
function setDiscordStatus(status) {
  if (!discordStatusEl) return;
  const knownStatus = DISCORD_STATUS_LABELS[status] ? status : 'offline';

  discordStatusEl.textContent = '';
  const dot = document.createElement('span');
  dot.className = `status-dot status-${knownStatus}`;
  discordStatusEl.appendChild(dot);
  discordStatusEl.appendChild(document.createTextNode(DISCORD_STATUS_LABELS[knownStatus]));
}

async function fetchDiscordStatus() {
  try {
    const response = await fetch(LANYARD_API_URL);

    if (!response.ok) {
      console.warn(`Lanyard API returned ${response.status}`);
      setDiscordStatus('offline');
      return;
    }

    const { success, data } = await response.json();
    if (!success) throw new Error('Lanyard API returned success: false');

    setDiscordStatus(data.discord_status);
  } catch (error) {
    console.warn('Discord status fetch failed:', error.message);
    setDiscordStatus('offline');
  }
}

async function updateDiscordStatus() {
  await fetchDiscordStatus();
}

// Netherlands local time
function updateNlTime() {
  if (!nlTimeEl) return;

  const now = new Date();
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    day: '2-digit',
    month: 'short'
  }).format(now);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);

  nlTimeEl.textContent = `${time} · ${date}`;
}

// START LOADING IMMEDIATELY (don't wait for splash click)
updateDiscordStatus();
updateNlTime();

// Refresh Discord status every 30 seconds
setInterval(updateDiscordStatus, 30000);

// Refresh NL time every second
setInterval(updateNlTime, 1000);

if (panel && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    const { innerWidth, innerHeight } = window;
    
    // Calculate position as -1 to 1
    const xPercent = (event.clientX / innerWidth - 0.5) * 2;
    const yPercent = (event.clientY / innerHeight - 0.5) * 2;

    // Translate with stronger movement
    const translateX = xPercent * 25;
    const translateY = yPercent * 25;
    
    // 3D rotation based on cursor position
    const rotateY = xPercent * 15;  // Right = tilt back, Left = tilt forward
    const rotateX = -yPercent * 15; // Down = tilt back, Up = tilt forward

    panel.style.transform = `perspective(1200px) translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    panel.style.transition = 'transform 120ms ease-out';
  });

  window.addEventListener('pointerleave', () => {
    panel.style.transform = 'perspective(1200px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
    panel.style.transition = 'transform 300ms ease-out';
  });
}

// Custom cursor
const customCursor = document.getElementById('custom-cursor');
if (customCursor) {
  window.addEventListener('pointermove', (event) => {
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
    customCursor.classList.add('visible');
  });

  window.addEventListener('pointerleave', () => {
    customCursor.classList.remove('visible');
  });
}

// Format time helper
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Playlist
const TRACKS = [
  { title: 'Bye Bye . - fakemink', src: 'Song/ByeBye.mp3', cover: 'Song/ByeByeCover.png' },
  { title: '2023 Summer - Feng', src: 'Song/2023Summer.mp3', cover: 'Song/2023SummerCover.jpg' },
  { title: 'StruggleGang - xaviersobased', src: 'Song/StruggleGang.mp3', cover: 'Song/StruggleGangCover.jpg' },
  { title: 'Shampoodle - fakemink', src: 'Song/Shampoodle.mp3', cover: 'Song/ShampoodleCover.jpg' },
  { title: 'F*CK CANCER', src: 'Song/FCKCANCER.mp3', cover: 'Song/FCKCANCERCover.jpg' }
];

let currentTrackIndex = 0;

const trackArtImg = document.getElementById('track-art-img');
const trackTitleEl = document.getElementById('track-title');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const playlistBtn = document.getElementById('playlist-btn');
const playlistBackBtn = document.getElementById('playlist-back-btn');
const playlistListEl = document.getElementById('playlist-list');
const playerInner = document.getElementById('player-inner');

function renderPlaylist() {
  if (!playlistListEl) return;

  playlistListEl.textContent = '';
  TRACKS.forEach((track, index) => {
    const li = document.createElement('li');
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'playlist-item' + (index === currentTrackIndex ? ' active' : '');

    const thumb = document.createElement('img');
    thumb.src = track.cover;
    thumb.alt = '';

    const label = document.createElement('span');
    label.textContent = track.title;

    item.appendChild(thumb);
    item.appendChild(label);
    item.addEventListener('click', () => {
      loadTrack(index, true);
      if (playerInner) playerInner.classList.remove('flipped');
    });

    li.appendChild(item);
    playlistListEl.appendChild(li);
  });
}

function loadTrack(index, autoplay) {
  if (!audio || TRACKS.length === 0) return;

  currentTrackIndex = (index + TRACKS.length) % TRACKS.length;
  const track = TRACKS[currentTrackIndex];

  audio.src = track.src;
  if (trackArtImg) trackArtImg.src = track.cover;
  if (trackTitleEl) trackTitleEl.textContent = track.title;
  if (progressFill) progressFill.style.width = '0%';
  if (currentTimeEl) currentTimeEl.textContent = '0:00';

  renderPlaylist();

  if (autoplay) {
    audio.play();
    if (playBtn) playBtn.textContent = '⏸';
  } else if (playBtn) {
    playBtn.textContent = audio.paused ? '▶' : '⏸';
  }
}

// Audio player controls
if (audio && playBtn) {
  // Set volume to 10%
  audio.volume = 0.05;

  renderPlaylist();

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      loadTrack(currentTrackIndex - 1, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      loadTrack(currentTrackIndex + 1, true);
    });
  }

  // Auto-advance to the next track, wrapping around at the end
  audio.addEventListener('ended', () => {
    loadTrack(currentTrackIndex + 1, true);
  });

  audio.addEventListener('timeupdate', () => {
    if (progressFill) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + '%';
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (totalTimeEl) {
      totalTimeEl.textContent = formatTime(audio.duration);
    }
    // Ensure progress bar starts at 0%
    if (progressFill) {
      progressFill.style.width = '0%';
    }
  });

  // Click on progress bar to seek
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * audio.duration;
    });
  }
}

// Playlist flip
if (playerInner && playlistBtn && playlistBackBtn) {
  playlistBtn.addEventListener('click', () => {
    playerInner.classList.add('flipped');
  });

  playlistBackBtn.addEventListener('click', () => {
    playerInner.classList.remove('flipped');
  });
}

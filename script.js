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
const viewCountEl = document.getElementById('view-count');
const discordStatusEl = document.getElementById('discord-status');

const VIEW_API_URL = 'https://d4an-lol.onrender.com/api/view';
const DISCORD_API_URL = 'https://d4an-lol.onrender.com/api/discord-status';
const DEFAULT_TOTAL_VIEWS = 54226;

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function syncViewCount(total) {
  if (viewCountEl) {
    viewCountEl.textContent = formatNumber(total);
  }
}

async function fetchLiveViewCount() {
  try {
    const response = await fetch(VIEW_API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`View API returned ${response.status}`);
      return DEFAULT_TOTAL_VIEWS;
    }

    const data = await response.json();
    if (typeof data?.total === 'number') {
      console.log('View count updated:', data.total);
      return data.total;
    }
  } catch (error) {
    console.warn('Live view API request failed:', error.message);
  }

  return DEFAULT_TOTAL_VIEWS;
}

async function updateViewCount() {
  if (!viewCountEl) return;

  try {
    const total = await fetchLiveViewCount();
    syncViewCount(total);
  } catch (error) {
    console.warn('View tracking unavailable:', error);
    syncViewCount(DEFAULT_TOTAL_VIEWS);
  }
}

// Discord Status
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'online now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

async function fetchDiscordStatus() {
  try {
    const response = await fetch(DISCORD_API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`Discord API returned ${response.status}`);
      if (discordStatusEl) discordStatusEl.textContent = 'Last online: unknown';
      return;
    }

    const data = await response.json();
    if (data.last_online) {
      const lastOnline = new Date(data.last_online);
      const timeAgo = getTimeAgo(lastOnline);
      if (discordStatusEl) {
        discordStatusEl.textContent = `Last online: ${timeAgo}`;
      }
    } else if (data.status === 'online') {
      if (discordStatusEl) discordStatusEl.textContent = 'online now';
    }
  } catch (error) {
    console.warn('Discord status fetch failed:', error.message);
    if (discordStatusEl) discordStatusEl.textContent = 'Last online: unknown';
  }
}

async function updateDiscordStatus() {
  await fetchDiscordStatus();
}

// START LOADING IMMEDIATELY (don't wait for splash click)
updateViewCount();
updateDiscordStatus();

// Refresh Discord status every 30 seconds
setInterval(updateDiscordStatus, 30000);

if (panel) {
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

// Format time helper
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Audio player controls
if (audio && playBtn) {
  // Set volume to 30%
  audio.volume = 0.3;
  
  // Reset audio to start
  audio.currentTime = 0;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
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

// Splash screen handler
const splashScreen = document.getElementById('splash-screen');
const pageShell = document.querySelector('.page-shell');

if (splashScreen && pageShell) {
  splashScreen.addEventListener('click', () => {
    splashScreen.classList.add('hidden');
    pageShell.style.display = 'grid';
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

const VIEW_API_URL = 'https://d4an-lol.onrender.com/api/view';
const DEFAULT_TOTAL_VIEWS = 54226;

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function syncViewCount(total) {
  if (viewCountEl) {
    viewCountEl.textContent = formatNumber(total);
    viewCountEl.style.opacity = '1';
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

if (viewCountEl) {
  updateViewCount();
}

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

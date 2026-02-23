// =======================================
// BIO LINKS WEBSITE - ItsNotKayra
// =======================================

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// =======================================
// PROFILE DATA
// =======================================

function setupProfileData() {
  const profileData = {
    name: 'ItsNotKayra',
    bio: 'Freelance Developer | Content Creator',
    status: 'Currently working on new projects!',
    avatar: 'https://cdn.discordapp.com/avatars/676857166363361291/fb6acc51d074434a1868ee0db8f88521.png?size=1024'
  };

  const nameEl = document.querySelector('.profile-name');
  const bioEl = document.querySelector('.profile-bio');
  const statusEl = document.querySelector('.profile-status');
  const avatarEl = document.querySelector('.avatar');

  if (nameEl) {
    nameEl.textContent = profileData.name;
    nameEl.setAttribute('data-text', profileData.name);
  }
  if (bioEl) bioEl.textContent = profileData.bio;

  if (statusEl) {
    const textNode = Array.from(statusEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = ' ' + profileData.status;
    } else {
      statusEl.appendChild(document.createTextNode(' ' + profileData.status));
    }
  }

  if (avatarEl) {
    avatarEl.style.backgroundImage = "url('" + profileData.avatar + "')";
  }
}

// =======================================
// SPLASH + VIDEO + AUDIO
// =======================================

function setupSplashAndVideo() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  const introVideo = document.getElementById('introVideo');
  const volumeSlider = document.getElementById('volumeSlider');

  if (!introVideo || !splashScreen) return;

  // Keep video muted and pre-buffering silently
  introVideo.muted = true;
  introVideo.volume = 0;

  // Start buffering the video immediately (muted = autoplay allowed)
  introVideo.load();
  introVideo.play().catch(() => {
    // Autoplay blocked — will try again on user click
  });

  function getVolume() {
    return volumeSlider ? Number(volumeSlider.value) / 100 : 0.1;
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      introVideo.volume = getVolume();
    });
  }

  splashScreen.addEventListener('click', async () => {
    // 1. Unlock Web Audio API
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
    } catch (_) {}

    // 2. Unmute and set volume BEFORE calling play
    introVideo.muted = false;
    introVideo.volume = getVolume();

    // 3. Ensure video is playing (it may already be buffered from silent autoplay)
    try {
      await introVideo.play();
    } catch (err) {
      // If play fails, retry muted as fallback
      introVideo.muted = true;
      introVideo.volume = 0;
      await introVideo.play().catch(() => {});
    }

    // 4. Show video layer
    introVideo.classList.add('playing');

    // 5. Hide splash with fade
    splashScreen.style.opacity = '0';
    splashScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 600);

    // 6. Show main content
    if (mainContent) {
      mainContent.classList.add('visible');
    }

    // 7. Init parallax after content is visible
    setupParallax();

  }, { once: true });
}

// =======================================
// MOUSE PARALLAX EFFECTS
// =======================================

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let parallaxRunning = false;

function setupParallax() {
  if (parallaxRunning) return;
  parallaxRunning = true;

  const profileSection = document.querySelector('.profile-section');
  const linksSection = document.querySelector('.links-section');
  const avatarWrapper = document.querySelector('.avatar-wrapper');

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function animateParallax() {
    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;

    const xOffset = (mouseX - window.innerWidth / 2) * 0.02;
    const yOffset = (mouseY - window.innerHeight / 2) * 0.02;

    if (profileSection) {
      profileSection.style.transform = 'translate(' + (xOffset * 0.5) + 'px, ' + (yOffset * 0.5) + 'px)';
    }
    if (avatarWrapper) {
      const rotX = (mouseY - window.innerHeight / 2) * 0.01;
      const rotY = (mouseX - window.innerWidth / 2) * 0.01;
      avatarWrapper.style.transform = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    }
    if (linksSection) {
      linksSection.style.transform = 'translate(' + (xOffset * 0.3) + 'px, ' + (yOffset * 0.3) + 'px)';
    }

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
}

// =======================================
// SOUND EFFECTS
// =======================================

function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (_) {}
}

function playHoverSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (_) {}
}

function setupSoundEffects() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('mouseenter', () => playHoverSound());
  });
}

// =======================================
// LINKS + RIPPLE
// =======================================

// Ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes expandRipple { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(4); opacity: 0; } }';
document.head.appendChild(rippleStyle);

function initializeLinks() {
  document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      playClickSound();

      // Ripple
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.style.cssText = [
        'position:absolute',
        'left:' + (e.clientX - rect.left) + 'px',
        'top:' + (e.clientY - rect.top) + 'px',
        'width:10px',
        'height:10px',
        'background:rgba(255,51,51,0.8)',
        'border-radius:50%',
        'pointer-events:none',
        'animation:expandRipple 0.6s ease-out forwards'
      ].join(';');
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Navigate
      const link = card.getAttribute('data-link');
      if (link) {
        setTimeout(() => window.open(link, '_blank'), 150);
      }
    });
  });
}

// =======================================
// INIT
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  setupProfileData();
  initializeLinks();
  setupSoundEffects();
  setupSplashAndVideo();
});

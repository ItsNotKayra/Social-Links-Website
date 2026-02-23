// =======================================
// BIO LINKS WEBSITE - GUNS.LOL STYLE
// =======================================

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Setup profile data
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
    // Keep the SVG, only replace text
    const textNode = Array.from(statusEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = ` ${profileData.status}`;
    } else {
      statusEl.appendChild(document.createTextNode(` ${profileData.status}`));
    }
  }

  if (avatarEl) {
    avatarEl.style.backgroundImage = `url('${profileData.avatar}')`;
  }
}

// =======================================
// SPLASH + VIDEO + VOLUME (single controller)
// =======================================

function setupSplashAndVideo() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  const introVideo = document.getElementById('introVideo');
  const volumeSlider = document.getElementById('volumeSlider');

  if (!introVideo) return;

  // Start silent (autoplay-friendly)
  introVideo.muted = true;
  introVideo.volume = 0;

  // Slider controls volume live
  function applyVolumeFromSlider() {
    const v = volumeSlider ? Number(volumeSlider.value) / 100 : 0.1;
    introVideo.volume = v;
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', applyVolumeFromSlider);
    volumeSlider.addEventListener('change', applyVolumeFromSlider);
  }

  // Loop video safely
  introVideo.addEventListener('ended', () => {
    introVideo.currentTime = 0;
    introVideo.play().catch(() => {});
  });

  if (!splashScreen) return;

  splashScreen.addEventListener('click', async () => {
    // Unlock audio for hover/click sounds
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
    } catch {}

    // Hide splash
    splashScreen.style.display = 'none';
    splashScreen.style.pointerEvents = 'none';

    // Show main content
    if (mainContent) mainContent.style.display = 'flex';

    // Show and play video with audio
    introVideo.classList.add('playing');
    introVideo.muted = false;
    applyVolumeFromSlider();

    introVideo.play().catch(() => {});
  }, { once: true });
}

// =======================================
// MOUSE PARALLAX EFFECTS
// =======================================

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

function setupParallax() {
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
      profileSection.style.transform = `translate(${xOffset * 0.5}px, ${yOffset * 0.5}px)`;
    }

    if (avatarWrapper) {
      const rotationX = (mouseY - window.innerHeight / 2) * 0.01;
      const rotationY = (mouseX - window.innerWidth / 2) * 0.01;
      avatarWrapper.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    if (linksSection) {
      linksSection.style.transform = `translate(${xOffset * 0.3}px, ${yOffset * 0.3}px)`;
    }

    const linkCards = document.querySelectorAll('.link-card');
    linkCards.forEach((card, idx) => {
      const offsetX = xOffset * (0.2 + idx * 0.05);
      const offsetY = yOffset * (0.2 + idx * 0.05);
      // NOTE: this overrides hover transform. If you want hover lift to work too,
      // we can switch to CSS variables instead.
      card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
}

// =======================================
// SOUND EFFECTS
// =======================================

function playClickSound() {
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
}

function playHoverSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.start(now);
  osc.stop(now + 0.08);
}

function setupSoundEffects() {
  if (window.matchMedia('(hover: none)').matches) return; // no hover sounds on mobile

  const cards = document.querySelectorAll('.link-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => playHoverSound());
  });
}

// =======================================
// LINKS FUNCTIONALITY
// =======================================

function initializeLinks() {
  const linkCards = document.querySelectorAll('.link-card');

  linkCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      playClickSound();

      const link = card.getAttribute('data-link');
      if (!link) return;

      card.style.transform = 'scale(0.95)';
      setTimeout(() => { card.style.transform = ''; }, 100);

      window.open(link, '_blank');
    });

    // Ripple effect on click
    card.addEventListener('click', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = '10px';
      ripple.style.height = '10px';
      ripple.style.background = 'rgba(255, 51, 51, 0.8)';
      ripple.style.borderRadius = '50%';
      ripple.style.pointerEvents = 'none';
      ripple.style.animation = 'expandRipple 0.6s ease-out forwards';

      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes expandRipple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(style);

// =======================================
// INIT
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  initializeLinks();
  setupSoundEffects();
  setupParallax();
  setupProfileData();
  setupSplashAndVideo();
});
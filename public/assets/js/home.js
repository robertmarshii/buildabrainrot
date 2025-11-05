/**
 * HOMEPAGE INTERACTIONS
 *
 * Fun animations and interactions for the homepage
 */

// Random phrases to display
const brainrotPhrases = [
  "Tralalero tralala! 🎵",
  "Bing bong blop! 🔔",
  "Yoinky sploinky! ✨",
  "Skibidi bop bop! 🎶",
  "Rizz rizz boom! 💥",
  "Goofy ahh vibes! 🤪",
  "Sheesh fr fr! 🔥"
];

// Get random phrase
function getRandomPhrase() {
  return brainrotPhrases[Math.floor(Math.random() * brainrotPhrases.length)];
}

// Mascot animations
function initMascotAnimations() {
  const mascot = document.getElementById('rotto-mascot');
  if (!mascot) return;

  mascot.addEventListener('click', () => {
    mascot.style.transform = 'rotate(360deg) scale(1.5)';
    setTimeout(() => {
      mascot.style.transform = '';
    }, 600);

    // Show random phrase
    showFloatingPhrase(getRandomPhrase());
  });

  mascot.style.transition = 'transform 0.6s ease';
}

// Show floating phrase
function showFloatingPhrase(phrase) {
  const floater = document.createElement('div');
  floater.className = 'floating-phrase';
  floater.textContent = phrase;
  floater.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2em;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    pointer-events: none;
    animation: floatUp 2s ease-out forwards;
    z-index: 1000;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -150%) scale(1.5);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(floater);

  setTimeout(() => {
    floater.remove();
    style.remove();
  }, 2000);
}

// Track CTA clicks
function initCTATracking() {
  const cta = document.getElementById('main-cta');
  if (cta) {
    cta.addEventListener('click', () => {
      console.log('Main CTA clicked!');
      // Track event if analytics available
      if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('homepage', 'cta_click', 'main');
      }
    });
  }

  // Track secondary CTAs
  document.querySelectorAll('.btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Secondary CTA clicked!');
      if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('homepage', 'cta_click', 'secondary');
      }
    });
  });

  // Track example clicks
  document.querySelectorAll('.example-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('homepage', 'example_click', `example_${index + 1}`);
      }
    });
  });
}

// Add hover effects to feature cards
function initFeatureCardEffects() {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.feature-icon');
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(5deg)';
        icon.style.transition = 'transform 0.3s';
      }
    });

    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.feature-icon');
      if (icon) {
        icon.style.transform = '';
      }
    });
  });
}

// Add scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections
  document.querySelectorAll('section:not(.hero)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s, transform 0.6s';
    observer.observe(section);
  });
}

// Easter egg: Konami code
function initKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;

      if (konamiIndex === konamiCode.length) {
        activatePartyMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

// Party mode easter egg
function activatePartyMode() {
  console.log('🎉 PARTY MODE ACTIVATED! 🎉');

  // Rainbow background animation
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.animation = 'rainbow 2s linear infinite';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes rainbow {
        0% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        20% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        40% { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        60% { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        80% { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      }
    `;
    document.head.appendChild(style);

    // Reset after 10 seconds
    setTimeout(() => {
      hero.style.animation = '';
      style.remove();
    }, 10000);
  }

  // Confetti
  createConfetti();
}

// Create confetti effect
function createConfetti() {
  const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: ${Math.random()};
      transform: rotate(${Math.random() * 360}deg);
      pointer-events: none;
      z-index: 9999;
      animation: fall ${2 + Math.random() * 3}s linear forwards;
    `;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 5000);
  }

  // Confetti animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      to {
        top: 100%;
        transform: translateY(100vh) rotate(720deg);
      }
    }
  `;
  document.head.appendChild(style);
  setTimeout(() => style.remove(), 5000);
}

// Initialize everything on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('%c🧠 BUILD A BRAINROT 🧠', 'font-size: 24px; color: #667eea; font-weight: bold;');
  console.log('%c' + getRandomPhrase(), 'font-size: 16px; color: #764ba2;');
  console.log('%cTry the Konami code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA', 'color: #999;');

  initMascotAnimations();
  initCTATracking();
  initFeatureCardEffects();
  initScrollAnimations();
  initKonamiCode();

  // Track page view
  if (typeof Analytics !== 'undefined') {
    Analytics.trackPageView('homepage');
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRandomPhrase,
    showFloatingPhrase,
    activatePartyMode
  };
}

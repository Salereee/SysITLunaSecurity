const header = document.querySelector('.header');
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
const menuLinks = mainMenu ? mainMenu.querySelectorAll('a') : [];
const revealItems = document.querySelectorAll('.reveal');
const productButtons = document.querySelectorAll('.product-wa');
const heroRevealItems = document.querySelectorAll('.hero .reveal');
const menuBreakpoint = 900;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined';

const whatsappBase = 'https://wa.me/5216643028600?text=';

function scrollToSection(hash) {
  if (!hash || hash === '#') {
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const headerOffset = header ? header.offsetHeight + 12 : 92;
  const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth',
  });
}

function updateHeaderState() {
  if (!header) {
    return;
  }
  header.classList.toggle('scrolled', window.scrollY > 16);
}

function toggleMenu(forceClose = false) {
  if (!mainMenu || !menuToggle) {
    return;
  }

  const shouldOpen = forceClose ? false : !mainMenu.classList.contains('open');
  mainMenu.classList.toggle('open', shouldOpen);
  menuToggle.classList.toggle('active', shouldOpen);
  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
}

if (menuToggle && mainMenu) {
  menuToggle.addEventListener('click', () => toggleMenu());
}

menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth < menuBreakpoint) {
      toggleMenu(true);
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href.length < 2) {
      return;
    }

    event.preventDefault();
    scrollToSection(href);
    if (window.innerWidth < menuBreakpoint) {
      toggleMenu(true);
    }
    history.replaceState(null, '', href);
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= menuBreakpoint) {
    toggleMenu(true);
  }
});

window.addEventListener('scroll', updateHeaderState);
updateHeaderState();

function applyRevealStagger() {
  const sectionCounter = new Map();

  revealItems.forEach((item) => {
    const parentSection = item.closest('section, footer') || document.body;
    const sectionKey = parentSection.id || parentSection.className || 'global';
    const current = sectionCounter.get(sectionKey) || 0;
    const delay = Math.min(current, 7) * 0.16;
    item.dataset.revealDelay = `${delay}`;
    sectionCounter.set(sectionKey, current + 1);
  });
}

function applyRevealVariants() {
  revealItems.forEach((item, index) => {
    if (item.classList.contains('hero-copy') || item.classList.contains('section-head')) {
      item.classList.add('reveal-up');
      return;
    }

    if (item.classList.contains('hero-visual')) {
      item.classList.add('reveal-zoom');
      return;
    }

    if (item.classList.contains('service-card') || item.classList.contains('product-card') || item.classList.contains('point-card')) {
      item.classList.add(index % 2 === 0 ? 'reveal-left' : 'reveal-right');
      return;
    }

    item.classList.add('reveal-up');
  });
}

function getRevealOffset(item) {
  const isSmallViewport = window.matchMedia('(max-width: 900px)').matches;

  if (item.classList.contains('reveal-left')) {
    return isSmallViewport
      ? { x: 0, y: 54, scale: 0.93 }
      : { x: -70, y: 28, scale: 0.93 };
  }

  if (item.classList.contains('reveal-right')) {
    return isSmallViewport
      ? { x: 0, y: 54, scale: 0.93 }
      : { x: 70, y: 28, scale: 0.93 };
  }

  if (item.classList.contains('reveal-zoom')) {
    return { x: 0, y: 26, scale: 0.84 };
  }

  return { x: 0, y: 60, scale: 0.93 };
}

function animateReveal(item, delay = 0) {
  if (item.dataset.animated === '1') {
    return;
  }

  item.dataset.animated = '1';
  const offset = getRevealOffset(item);

  if (!hasGsap || prefersReducedMotion) {
    item.classList.add('is-visible');
    item.style.opacity = '1';
    item.style.filter = 'blur(0)';
    item.style.transform = 'translate3d(0, 0, 0) scale(1)';
    return;
  }

  window.gsap.fromTo(
    item,
    {
      opacity: 0.001,
      filter: 'blur(4px)',
      x: offset.x,
      y: offset.y,
      scale: offset.scale,
    },
    {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.05,
      delay,
      ease: 'expo.out',
      onComplete: () => {
        item.classList.add('is-visible');
      },
    }
  );
}

function initGsapMicroInteractions() {
  if (!hasGsap || prefersReducedMotion) {
    return;
  }

  const hoverTargets = document.querySelectorAll('.btn, .service-card, .product-card, .point-card');
  const buttonTargets = document.querySelectorAll('.btn');

  hoverTargets.forEach((item) => {
    window.gsap.set(item, { transformOrigin: 'center center' });

    const hoverIn = () => {
      window.gsap.to(item, {
        y: -4,
        scale: 1.02,
        duration: 0.25,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const hoverOut = () => {
      window.gsap.to(item, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    item.addEventListener('pointerenter', hoverIn);
    item.addEventListener('pointerleave', hoverOut);
    item.addEventListener('focus', hoverIn);
    item.addEventListener('blur', hoverOut);
  });

  buttonTargets.forEach((button) => {
    const pressIn = () => {
      window.gsap.to(button, {
        scale: 0.98,
        duration: 0.12,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const pressOut = () => {
      window.gsap.to(button, {
        scale: 1,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    button.addEventListener('pointerdown', pressIn);
    button.addEventListener('pointerup', pressOut);
    button.addEventListener('pointerleave', pressOut);
  });
}

function initRevealAnimations() {
  if (!revealItems.length) {
    return;
  }

  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
      item.style.opacity = '1';
      item.style.filter = 'blur(0)';
      item.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
    return;
  }

  if (!hasGsap) {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
      item.style.opacity = '1';
      item.style.filter = 'blur(0)';
      item.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
    return;
  }

  applyRevealVariants();
  applyRevealStagger();

  revealItems.forEach((item) => {
    const offset = getRevealOffset(item);
    window.gsap.set(item, {
      opacity: 0.001,
      filter: 'blur(4px)',
      x: offset.x,
      y: offset.y,
      scale: offset.scale,
    });
  });

  // Entrada inicial del hero para dar impacto sin depender del scroll.
  heroRevealItems.forEach((item, index) => {
    const delay = 0.25 + index * 0.26;
    animateReveal(item, delay);
  });

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item, index) => {
      animateReveal(item, index * 0.12);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number.parseFloat(entry.target.dataset.revealDelay || '0') || 0;
          animateReveal(entry.target, delay);
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -5% 0px',
    }
  );

  revealItems.forEach((item) => {
    if (item.dataset.animated === '1') {
      return;
    }

    observer.observe(item);
  });
}

function initImageCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return false;
  }

  if (carousel.dataset.carouselReady === '1') {
    return true;
  }

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dotsContainer = carousel.querySelector('[data-carousel-dots]');

  if (!track || slides.length < 2 || !prevButton || !nextButton || !dotsContainer) {
    return false;
  }

  carousel.dataset.carouselReady = '1';

  let currentIndex = 0;
  let autoplayId = null;
  const autoplayDelay = 5000;
  let startX = 0;
  let isPointerDown = false;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === 0 ? 'carousel-dot is-active' : 'carousel-dot';
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => {
      goTo(index);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  slides.forEach((slide) => {
    const image = slide.querySelector('.carousel-image');
    if (!image) {
      return;
    }

    image.addEventListener('error', () => {
      image.src = 'white.jpg';
    }, { once: true });
  });

  function updateUI() {
    track.style.transform = `translate3d(${-currentIndex * 100}%, 0, 0)`;

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function goTo(index) {
    const total = slides.length;
    currentIndex = (index + total) % total;
    updateUI();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function stopAutoplay() {
    if (!autoplayId) {
      return;
    }
    window.clearInterval(autoplayId);
    autoplayId = null;
  }

  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    stopAutoplay();
    autoplayId = window.setInterval(next, autoplayDelay);
  }

  function restartAutoplay() {
    startAutoplay();
  }

  prevButton.addEventListener('click', () => {
    prev();
    restartAutoplay();
  });

  nextButton.addEventListener('click', () => {
    next();
    restartAutoplay();
  });

  carousel.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    startX = event.clientX;
    stopAutoplay();
  });

  carousel.addEventListener('pointerup', (event) => {
    if (!isPointerDown) {
      return;
    }

    const deltaX = event.clientX - startX;
    const threshold = 45;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        next();
      } else {
        prev();
      }
    }

    isPointerDown = false;
    restartAutoplay();
  });

  carousel.addEventListener('pointercancel', () => {
    isPointerDown = false;
    restartAutoplay();
  });

  carousel.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  carousel.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const threshold = 45;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        next();
      } else {
        prev();
      }
    }
    restartAutoplay();
  }, { passive: true });

  if (window.matchMedia('(hover: hover)').matches) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  updateUI();
  startAutoplay();
  return true;
}

let bootstrapped = false;

function initImageCarouselWithRetry(attempt = 0) {
  const initialized = initImageCarousel();
  if (initialized || attempt >= 8) {
    return;
  }

  window.setTimeout(() => {
    initImageCarouselWithRetry(attempt + 1);
  }, 140);
}

function bootstrapUI() {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;

  requestAnimationFrame(() => {
    initRevealAnimations();
    initGsapMicroInteractions();
    initImageCarouselWithRetry();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapUI, { once: true });
} else {
  bootstrapUI();
}

window.addEventListener('load', bootstrapUI, { once: true });

productButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const productName = button.dataset.product || 'producto';
    const message = `Hola, me interesa este producto de SysIT: ${productName}`;
    const url = `${whatsappBase}${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});

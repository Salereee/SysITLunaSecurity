/* ============================================================
   SysIT Luna Security — interacción y movimiento
   ============================================================ */

const header = document.querySelector('.header');
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
const menuLinks = mainMenu ? mainMenu.querySelectorAll('a') : [];
const productButtons = document.querySelectorAll('.product-wa');
const menuBreakpoint = 900;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const canAnimate = Boolean(gsap && ScrollTrigger) && !prefersReducedMotion;

const whatsappBase = 'https://wa.me/5216643028600?text=';

/* ------------------------------------------------------------
   Navegación
   ------------------------------------------------------------ */

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
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
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

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

/* ------------------------------------------------------------
   Titulares: cada palabra dentro de su propia máscara
   ------------------------------------------------------------ */

function splitHeading(el) {
  if (el.dataset.splitReady === '1') {
    return Array.from(el.querySelectorAll('.split-word'));
  }

  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';

  const fragment = document.createDocumentFragment();
  const words = text.split(' ');

  words.forEach((word, index) => {
    const mask = document.createElement('span');
    mask.className = 'split-mask';
    mask.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('span');
    inner.className = 'split-word';
    inner.textContent = word;

    mask.appendChild(inner);
    fragment.appendChild(mask);

    if (index < words.length - 1) {
      fragment.appendChild(document.createTextNode(' '));
    }
  });

  el.appendChild(fragment);
  el.dataset.splitReady = '1';
  return Array.from(el.querySelectorAll('.split-word'));
}

// Palabras de la misma línea entran juntas; cada línea arranca un poco después.
function buildLineStagger(words) {
  const tops = words.map((word) => Math.round(word.parentElement.offsetTop));
  const lines = [...new Set(tops)].sort((a, b) => a - b);
  const seen = new Map();
  const positionInLine = tops.map((top) => {
    const count = seen.get(top) || 0;
    seen.set(top, count + 1);
    return count;
  });

  return (index) => lines.indexOf(tops[index]) * 0.085 + positionInLine[index] * 0.03;
}

function prepareHeading(el) {
  const words = splitHeading(el);
  if (!words.length) {
    return null;
  }

  // `y: 0` es imprescindible: GSAP lee el transform inicial del CSS y lo
  // traduce a un `y` en px que, sin anularlo, deja las palabras desplazadas
  // una línea hacia abajo para siempre.
  gsap.set(words, { yPercent: 110, y: 0 });

  return { words, stagger: buildLineStagger(words) };
}

function animateHeading(el, options = {}) {
  const prepared = prepareHeading(el);
  if (!prepared) {
    return null;
  }

  return gsap.to(prepared.words, {
    yPercent: 0,
    duration: 1.15,
    ease: 'expo.out',
    stagger: prepared.stagger,
    ...options,
  });
}

/* ------------------------------------------------------------
   Sistema de reveals por scroll
   ------------------------------------------------------------ */

function disableMotion() {
  document.documentElement.classList.add('motion-off');
}

function initHeroEntrance(heroReveals, heroHeading) {
  const timeline = gsap.timeline({ delay: 0.1 });

  const prepared = heroHeading ? prepareHeading(heroHeading) : null;

  if (prepared) {
    timeline.to(
      prepared.words,
      {
        yPercent: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: prepared.stagger,
      },
      0
    );
  }

  if (heroReveals.length) {
    timeline.to(
      heroReveals,
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        ease: 'expo.out',
        stagger: 0.1,
      },
      0.12
    );
  }
}

function initScrollReveals(scrollReveals) {
  if (!scrollReveals.length) {
    return;
  }

  ScrollTrigger.batch(scrollReveals, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'expo.out',
        stagger: 0.09,
        overwrite: true,
      });
    },
  });
}

function initScrollHeadings(headings) {
  headings.forEach((heading) => {
    animateHeading(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

function initSectionMarkers() {
  document.querySelectorAll('[data-marker]').forEach((marker) => {
    const rule = marker.querySelector('.marker-rule');
    const labels = marker.querySelectorAll('.marker-num, .marker-label');
    const trigger = { trigger: marker, start: 'top 92%', once: true };

    if (labels.length) {
      gsap.fromTo(
        labels,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: trigger,
        }
      );
    }

    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.15,
          ease: 'expo.out',
          delay: 0.08,
          scrollTrigger: trigger,
        }
      );
    }
  });
}

function initParallax() {
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const strength = Number.parseFloat(el.dataset.parallax) || 8;
    const scope = el.closest('.carousel, figure, section') || el;

    gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      }
    );
  });
}

function initHeroScrub() {
  const heroInner = document.querySelector('[data-hero-parallax]');
  const hero = document.querySelector('.hero');

  if (!heroInner || !hero) {
    return;
  }

  gsap.to(heroInner, {
    yPercent: -7,
    opacity: 0.18,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.4,
    },
  });
}

function initScrollProgress() {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) {
    return;
  }

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.25,
    },
  });
}

/* ------------------------------------------------------------
   Micro-interacciones
   ------------------------------------------------------------ */

function initMicroInteractions() {
  const pressables = document.querySelectorAll('.btn, .fab');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // La respuesta va en pointerdown, no en el click. Se hace con GSAP porque
  // en cuanto GSAP escribe un transform inline, la regla CSS :active deja de
  // tener efecto en estos elementos.
  pressables.forEach((item) => {
    gsap.set(item, { transformOrigin: 'center center' });

    const press = () => gsap.to(item, { scale: 0.97, duration: 0.12, ease: 'power2.out' });
    const release = () => gsap.to(item, { scale: 1, duration: 0.28, ease: 'power3.out' });

    item.addEventListener('pointerdown', press);
    item.addEventListener('pointerup', release);
    item.addEventListener('pointercancel', release);
    item.addEventListener('pointerleave', release);
  });

  if (!canHover) {
    return;
  }

  pressables.forEach((item) => {
    const enter = () => gsap.to(item, { y: -3, duration: 0.3, ease: 'power3.out' });
    const leave = () => gsap.to(item, { y: 0, duration: 0.4, ease: 'power3.out' });

    item.addEventListener('pointerenter', enter);
    item.addEventListener('pointerleave', leave);
    item.addEventListener('focus', enter);
    item.addEventListener('blur', leave);
  });

  // Las filas editoriales se desplazan en lugar de levantarse.
  document.querySelectorAll('.point-card, .service-card').forEach((row) => {
    const enter = () => gsap.to(row, { x: 10, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    const leave = () => gsap.to(row, { x: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });

    row.addEventListener('pointerenter', enter);
    row.addEventListener('pointerleave', leave);
  });
}

/* ------------------------------------------------------------
   Arranque del motor de movimiento
   ------------------------------------------------------------ */

let motionStarted = false;

function initMotion() {
  if (motionStarted) {
    return;
  }

  motionStarted = true;

  if (!canAnimate) {
    disableMotion();
    return;
  }

  // Si el guardia del <head> ya mostró el contenido (CDN lento), volver a
  // ocultarlo para animarlo se vería como un parpadeo: mejor dejarlo visible.
  if (document.documentElement.classList.contains('motion-off')) {
    return;
  }

  // Marca al guardia del <head> que el motor sí arrancó.
  document.documentElement.classList.add('motion-ready');

  gsap.registerPlugin(ScrollTrigger);

  const heroSection = document.querySelector('.hero');
  const allReveals = Array.from(document.querySelectorAll('.reveal'));
  const allHeadings = Array.from(document.querySelectorAll('[data-split]'));

  const isInHero = (el) => Boolean(heroSection && heroSection.contains(el));
  const heroReveals = allReveals.filter(isInHero);
  const scrollReveals = allReveals.filter((el) => !isInHero(el));
  const heroHeading = allHeadings.find(isInHero) || null;
  const scrollHeadings = allHeadings.filter((el) => !isInHero(el));

  gsap.set(allReveals, { opacity: 0, y: 34, filter: 'blur(6px)' });

  try {
    initHeroEntrance(heroReveals, heroHeading);
    initScrollReveals(scrollReveals);
    initScrollHeadings(scrollHeadings);
    initSectionMarkers();
    initParallax();
    initHeroScrub();
    initScrollProgress();
    initMicroInteractions();
  } catch (error) {
    // Nada justifica dejar el contenido invisible: revertimos y mostramos todo.
    gsap.set(allReveals, { clearProps: 'all' });
    gsap.set(document.querySelectorAll('.split-word'), { clearProps: 'all' });
    disableMotion();
    return;
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* ------------------------------------------------------------
   Carrusel
   ------------------------------------------------------------ */

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
  const autoplayDelay = 5600;
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
    if (prefersReducedMotion) {
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

function initImageCarouselWithRetry(attempt = 0) {
  const initialized = initImageCarousel();
  if (initialized || attempt >= 8) {
    return;
  }

  window.setTimeout(() => {
    initImageCarouselWithRetry(attempt + 1);
  }, 140);
}

/* ------------------------------------------------------------
   Bootstrap
   ------------------------------------------------------------ */

let bootstrapped = false;

function bootstrapUI() {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;

  initImageCarouselWithRetry();

  // El corte por línea depende de la métrica final de la fuente: esperamos
  // a que cargue, con un tope para no dejar el contenido oculto si falla.
  // Sin requestAnimationFrame: en una pestaña en segundo plano no se dispara
  // y la página se quedaría en blanco hasta que el usuario la enfoque.
  const fontsReady = document.fonts
    ? Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ])
    : Promise.resolve();

  fontsReady.then(initMotion, initMotion);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapUI, { once: true });
} else {
  bootstrapUI();
}

window.addEventListener('load', bootstrapUI, { once: true });

// Red de seguridad: si nada arrancó el motor a tiempo, arrancarlo aquí.
window.setTimeout(initMotion, 2500);

/* ------------------------------------------------------------
   Productos (productos.html)
   ------------------------------------------------------------ */

productButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const productName = button.dataset.product || 'producto';
    const message = `Hola, me interesa este producto de SysIT: ${productName}`;
    const url = `${whatsappBase}${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});

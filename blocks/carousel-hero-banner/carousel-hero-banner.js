import { createOptimizedPicture } from '../../scripts/aem.js';

/* source carousel: data-autoplay="enabled" data-play-speed="6500" */
const AUTOPLAY_DELAY = 6500;

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero-banner');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-banner-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-banner-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('aria-current', true);
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-banner-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-banner-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let timer;
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const start = () => {
    stop();
    timer = setInterval(() => {
      if (document.hidden) return;
      showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
    }, AUTOPLAY_DELAY);
  };

  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', () => {
    if (!block.contains(document.activeElement)) start();
  });
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget) && !block.matches(':hover')) start();
  });
  start();
}

function bindEvents(block) {
  const controls = block.querySelector('.carousel-hero-banner-controls');
  if (!controls) return;

  controls.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    const activeSlide = parseInt(block.dataset.activeSlide || 0, 10);
    if (button.classList.contains('slide-prev')) {
      showSlide(block, activeSlide - 1);
    } else if (button.classList.contains('slide-next')) {
      showSlide(block, activeSlide + 1);
    } else {
      const indicator = button.closest('.carousel-hero-banner-slide-indicator');
      if (indicator) showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    }
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-banner-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  startAutoplay(block);
}

/* same-origin, non-SVG images go through the media bus; remote ones are used as-is */
function imageUrl(src, width) {
  const url = new URL(src, window.location.href);
  if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return url.href;
  return `${url.pathname}?width=${width}&format=webply&optimize=medium`;
}

/*
 * Image cell may hold [desktop] or [desktop, mobile] renditions.
 * With two, build one <picture>: mobile below 768px, desktop from 768px (source breakpoint).
 */
function buildResponsiveArt(column, eager) {
  const imgs = [...column.querySelectorAll('img')];
  if (imgs.length < 2) return false;

  const [desktop, mobile] = imgs;
  const picture = document.createElement('picture');
  const source = document.createElement('source');
  source.media = '(width >= 768px)';
  source.srcset = imageUrl(desktop.src, 2000);
  const img = document.createElement('img');
  img.src = imageUrl(mobile.src, 750);
  img.alt = desktop.alt || mobile.alt || '';
  if (eager) img.loading = 'eager';
  img.dataset.responsiveArt = 'true';
  picture.append(source, img);

  column.replaceChildren(picture);
  return true;
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-banner-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-banner-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-banner-slide-${colIdx === 0 ? 'image' : 'content'}`);
    if (colIdx === 0 && buildResponsiveArt(column, slideIndex === 0)) {
      slide.classList.add('carousel-hero-banner-slide-responsive-art');
    }
    slide.append(column);
  });

  /* the artwork is the link: stretch the first CTA over the whole slide */
  const link = slide.querySelector('.carousel-hero-banner-slide-content a[href]')
    || slide.querySelector('a[href]');
  if (link) {
    link.classList.add('carousel-hero-banner-slide-link');
    link.classList.remove('button', 'primary', 'secondary');
    slide.classList.add('carousel-hero-banner-slide-linked');
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-banner-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-banner-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-banner-slides');

  /* single control bar, like the source: prev | indicators | next */
  let slideIndicators;
  let controls;
  if (!isSingleSlide) {
    controls = document.createElement('div');
    controls.classList.add('carousel-hero-banner-controls');
    controls.innerHTML = `
      <div class="carousel-hero-banner-controls-container">
        <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
        <nav aria-label="Carousel Slide Controls">
          <ol class="carousel-hero-banner-slide-indicators"></ol>
        </nav>
        <button type="button" class="slide-next" aria-label="Next Slide"></button>
      </div>
    `;
    slideIndicators = controls.querySelector('.carousel-hero-banner-slide-indicators');
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-banner-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}">${idx + 1}</button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  if (controls) block.append(controls);

  if (block.querySelector('.carousel-hero-banner-slide-responsive-art')) {
    block.classList.add('carousel-hero-banner-mobile-art');
  }

  /* optimize same-origin, non-SVG single-rendition images */
  block.querySelectorAll('picture > img:not([data-responsive-art])').forEach((img, idx) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) {
      if (idx === 0) img.loading = 'eager';
      return;
    }
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, idx === 0, [{ width: '2000' }]));
  });

  if (!isSingleSlide) {
    bindEvents(block);
  }
}

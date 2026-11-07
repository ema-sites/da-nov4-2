import { createOptimizedPicture } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-winners');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-winners-slide');

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

  const indicators = block.querySelectorAll('.carousel-winners-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-winners-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-winners-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-winners-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-winners-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

const AMOUNT_PATTERN = /^\s*\$?\s*\d[\d,\s]*(\.\d+)?\s*\$?\s*$/;

/**
 * Renders a prize such as "$500,000" as one tile per digit group, keeping the
 * original text available to assistive technology.
 */
function decorateAmount(p) {
  const text = p.textContent.trim();
  const groups = text.replace(/[^\d,]/g, '').split(',').filter(Boolean);
  if (!groups.length) return;

  const label = document.createElement('span');
  label.className = 'carousel-winners-amount-label';
  label.textContent = text;

  const tiles = document.createElement('span');
  tiles.className = 'carousel-winners-amount-tiles';
  tiles.setAttribute('aria-hidden', 'true');
  groups.forEach((group, idx) => {
    const tile = document.createElement('span');
    tile.className = 'carousel-winners-amount-tile';
    if (idx === 0 && text.includes('$')) tile.classList.add('has-currency');
    tile.textContent = group;
    tiles.append(tile);
  });

  p.replaceChildren(label, tiles);
}

/**
 * Splits the details cell into an info column (name, location, link) and a
 * prize column (game logo, ribbon, amount). Authors may omit any of these.
 */
function decorateContent(cell, slide) {
  const info = document.createElement('div');
  info.className = 'carousel-winners-info';
  const prize = document.createElement('div');
  prize.className = 'carousel-winners-prize';
  const game = document.createElement('div');
  game.className = 'carousel-winners-game';

  const texts = [];
  [...cell.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      el.classList.add('carousel-winners-name');
      info.append(el);
    } else if (el.querySelector('picture, img')) {
      el.classList.add('carousel-winners-logo');
      game.append(el);
    } else if (el.querySelector('a')) {
      el.classList.add('carousel-winners-cta');
      info.append(el);
    } else if (AMOUNT_PATTERN.test(el.textContent) && el.textContent.trim()) {
      el.classList.add('carousel-winners-amount');
      decorateAmount(el);
      prize.append(el);
    } else if (el.textContent.trim()) {
      texts.push(el);
    } else {
      el.remove();
    }
  });

  // first remaining text is the location, the next one the ribbon label
  const [location, ribbon, ...rest] = texts;
  if (location) {
    location.classList.add('carousel-winners-location');
    const name = info.querySelector('.carousel-winners-name');
    if (name) name.after(location);
    else info.prepend(location);
    const province = location.textContent.trim().match(/\b([A-Z]{2})$/);
    if (province) [, slide.dataset.province] = province;
  }
  if (ribbon) {
    ribbon.classList.add('carousel-winners-ribbon');
    game.append(ribbon);
  }
  rest.forEach((el) => info.append(el));

  if (game.children.length) prize.prepend(game);
  cell.replaceChildren(info, prize);
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-winners-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-winners-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-winners-slide-${colIdx === 0 ? 'image' : 'content'}`);
    if (colIdx > 0) decorateContent(column, slide);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-winners-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-winners-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-winners-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-winners-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-winners-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-winners-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  /* optimize same-origin, non-SVG images */
  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  if (!isSingleSlide) {
    bindEvents(block);
  }
}

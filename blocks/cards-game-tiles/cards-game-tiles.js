import { createOptimizedPicture } from '../../scripts/aem.js';

const CLS = 'cards-game-tiles';
const MOBILE_QUERY = '(width < 768px)';

/**
 * Normalises the artwork cell: unwraps the picture from its paragraph and
 * turns any remaining text paragraph (e.g. "NEW") into a corner flag.
 */
function decorateImageCell(cell) {
  cell.className = `${CLS}-card-image`;
  const picture = cell.querySelector('picture');
  [...cell.children].forEach((child) => {
    if (child === picture) return;
    if (child.contains(picture)) {
      child.replaceWith(picture);
      return;
    }
    const text = child.textContent.trim();
    if (text) {
      const flag = document.createElement('span');
      flag.className = `${CLS}-flag`;
      flag.textContent = text;
      child.replaceWith(flag);
    } else {
      child.remove();
    }
  });
}

/**
 * Body cell: heading, description paragraphs (clamped), CTA link as a button.
 */
function decorateBodyCell(cell) {
  cell.className = `${CLS}-card-body`;
  const paragraphs = [...cell.querySelectorAll(':scope > p')];
  const cta = paragraphs.reverse().find((p) => {
    const links = p.querySelectorAll('a');
    return links.length === 1 && p.textContent.trim() === links[0].textContent.trim();
  });
  if (cta) {
    cta.className = `${CLS}-card-cta`;
    cta.querySelector('a').classList.add(`${CLS}-card-button`);
  }

  const description = document.createElement('div');
  description.className = `${CLS}-card-description`;
  [...cell.children].forEach((child) => {
    if (child === cta || /^H[1-6]$/.test(child.tagName)) return;
    description.append(child);
  });
  if (description.children.length) {
    const heading = cell.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
    if (heading) heading.after(description);
    else cell.prepend(description);
  }
}

function buildCarouselControls(block, track) {
  const slides = [...track.children];
  if (slides.length < 2) return;

  const controls = document.createElement('div');
  controls.className = `${CLS}-controls`;
  controls.innerHTML = `
    <button type="button" class="${CLS}-prev" aria-label="Previous tile"></button>
    <button type="button" class="${CLS}-next" aria-label="Next tile"></button>
    <div class="${CLS}-dots"></div>`;
  const dots = controls.querySelector(`.${CLS}-dots`);
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `${CLS}-dot`;
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Show tile ${i + 1} of ${slides.length}`);
    dots.append(dot);
  });

  let active = 0;
  const setActive = (index) => {
    active = index;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const goTo = (index) => {
    const target = (index + slides.length) % slides.length;
    track.scrollTo({ left: slides[target].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    setActive(target);
  };

  controls.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.classList.contains(`${CLS}-prev`)) goTo(active - 1);
    else if (button.classList.contains(`${CLS}-next`)) goTo(active + 1);
    else if (button.dataset.index) goTo(Number(button.dataset.index));
  });

  const observer = new IntersectionObserver((entries) => {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(slides.indexOf(entry.target));
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));

  setActive(0);
  block.append(controls);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    const cells = [...li.children];
    cells.forEach((cell) => {
      const hasImage = cell.querySelector('picture, img');
      const hasHeading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (hasImage && !hasHeading) decorateImageCell(cell);
      else decorateBodyCell(cell);
    });
    ul.append(li);
  });

  /* optimize same-origin, non-SVG images */
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
  buildCarouselControls(block, ul);
}

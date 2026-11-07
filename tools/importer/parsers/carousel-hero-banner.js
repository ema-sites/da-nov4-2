/* eslint-disable */
/* global WebImporter */
export default function parse(element, { document }) {
  const cells = [];
  const slides = element.querySelectorAll('li.slide');

  slides.forEach((slide) => {
    const article = slide.querySelector('article.fca-carousel-slide-promo');
    if (!article) return;

    // Extract the link href from the wrapping <a> tag
    const link = slide.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Extract the slide image - try multiple locations
    const img = slide.querySelector('.slide-content img, .picturefill-background img, article img');

    // Build image cell
    const imageCell = document.createElement('div');
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      if (img.alt) newImg.alt = img.alt;
      imageCell.appendChild(newImg);
    }

    // Build text cell with a CTA link reconstructed from the href
    const textCell = document.createElement('div');
    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = 'Learn More';
      textCell.appendChild(cta);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero-banner', cells });
  element.replaceWith(block);
}

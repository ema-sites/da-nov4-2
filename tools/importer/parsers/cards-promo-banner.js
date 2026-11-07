/* eslint-disable */
/* global WebImporter */
export default function parse(element, { document }) {
  const cells = [];

  // The promo banner contains a single clickable link with CSS background image.
  // The <a> wraps empty <span> elements used for picturefill responsive backgrounds.
  // The importer removes empty inline elements, so we reconstruct the link.
  const link = element.querySelector('a.html-promo-image-container');
  if (link) {
    const href = link.getAttribute('href') || '';

    // Build a single-column card row with the link
    const contentCell = document.createElement('div');
    const anchor = document.createElement('a');
    anchor.setAttribute('href', href);
    anchor.textContent = 'View Promo';
    contentCell.appendChild(anchor);

    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-banner', cells });
  element.replaceWith(block);
}

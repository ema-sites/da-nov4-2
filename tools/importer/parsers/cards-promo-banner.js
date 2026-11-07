/* eslint-disable */
/* global WebImporter */

// Right-rail column of linked promo images. The same column class also matches an empty ad slot.
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('.cmp-image a[href]').forEach((link) => {
    const sourceImg = link.querySelector('img');
    if (!sourceImg) return;
    const src = sourceImg.getAttribute('src') || sourceImg.getAttribute('data-src');
    if (!src) return;

    const anchor = document.createElement('a');
    anchor.setAttribute('href', link.getAttribute('href'));
    const img = document.createElement('img');
    img.src = src;
    img.alt = sourceImg.getAttribute('alt') || '';
    anchor.appendChild(img);

    const cell = document.createElement('div');
    cell.appendChild(anchor);
    cells.push([cell]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-banner', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
export default function parse(element, { document }) {
  const cells = [];
  const tiles = element.querySelectorAll('.game-tile.parbase');

  tiles.forEach((tile) => {
    const article = tile.querySelector('article.game-tile');
    if (!article) return;

    // Col 1: game tile image
    const imageCell = document.createElement('div');
    const img = article.querySelector('.game-tile-image-container > img');
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      imageCell.appendChild(newImg);
    }

    // Col 2: title, description, CTA
    const textCell = document.createElement('div');

    // Title
    const title = article.querySelector('h3.game-tile-title');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      textCell.appendChild(h3);
    }

    // Description
    const descEl = article.querySelector('.game-tile-description p');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim().replace(/\s+/g, ' ');
      textCell.appendChild(p);
    }

    // CTA link (the primary button)
    const cta = article.querySelector('a.button');
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href');
      link.textContent = cta.textContent.trim();
      textCell.appendChild(link);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-game-tiles', cells });
  element.replaceWith(block);
}

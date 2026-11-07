/* eslint-disable */
/* global WebImporter */
export default function parse(element, { document }) {
  const cells = [];

  // Select only non-cloned slides to avoid duplicates from Slick carousel
  const slides = element.querySelectorAll('.slick-slide:not(.slick-cloned)');

  slides.forEach((slide) => {
    const slideContent = slide.querySelector('.slide');
    if (!slideContent) return;

    // Col 1: background image from the slide
    const imageCell = document.createElement('div');
    const bgImg = slideContent.querySelector(':scope > img');
    if (bgImg) {
      const newImg = document.createElement('img');
      newImg.src = bgImg.src;
      if (bgImg.alt) newImg.alt = bgImg.alt;
      imageCell.appendChild(newImg);
    }

    // Col 2: winner info - name, location, game logo, prize, link
    const textCell = document.createElement('div');

    // Winner name (h3)
    const name = slide.querySelector('.winner-info h3');
    if (name) {
      const h3 = document.createElement('h3');
      h3.textContent = name.textContent.trim();
      textCell.appendChild(h3);
    }

    // Winner location (span.h2)
    const location = slide.querySelector('.winner-info .h2');
    if (location) {
      const p = document.createElement('p');
      p.textContent = location.textContent.trim();
      textCell.appendChild(p);
    }

    // Game logo image
    const gameLogo = slide.querySelector('img.winning-game-logo');
    if (gameLogo) {
      const logoImg = document.createElement('img');
      logoImg.src = gameLogo.src;
      logoImg.alt = gameLogo.alt || 'game logo';
      textCell.appendChild(logoImg);
    }

    // Winner badge/ribbon
    const ribbon = slide.querySelector('.winning-game-ribbon');
    if (ribbon && ribbon.textContent.trim()) {
      const badge = document.createElement('p');
      badge.textContent = ribbon.textContent.trim();
      textCell.appendChild(badge);
    }

    // Prize amount
    const prizeAmount = slide.querySelector('.prize-amount');
    if (prizeAmount) {
      const prize = document.createElement('p');
      const spans = prizeAmount.querySelectorAll('span');
      const prizeText = Array.from(spans).map((s) => s.textContent.trim()).filter(Boolean).join(',');
      prize.textContent = `$${prizeText}`;
      textCell.appendChild(prize);
    }

    // "See all winners" link
    const winnersLink = slide.querySelector('.winner-info a.all-winners');
    if (winnersLink) {
      const link = document.createElement('a');
      link.href = winnersLink.getAttribute('href');
      link.textContent = winnersLink.textContent.trim();
      textCell.appendChild(link);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-winners', cells });
  element.replaceWith(block);
}

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
    // Winner photo is a CSS background on .winner-image (filenames contain spaces).
    const imageCell = document.createElement('div');
    const photoHost = slide.querySelector('.winner-image');
    const photoStyle = photoHost ? (photoHost.getAttribute('style') || '') : '';
    const photoMatch = photoStyle.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    const photoSrc = photoMatch ? photoMatch[1] : slideContent.querySelector(':scope > img')?.getAttribute('src');
    if (photoSrc) {
      const newImg = document.createElement('img');
      newImg.src = encodeURI(decodeURI(photoSrc));
      newImg.alt = slide.querySelector('.winner-info h3')?.textContent.trim() || '';
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
    // Server HTML holds a raw number (e.g. 500000); client JS later splits it into spans.
    const prizeAmount = slide.querySelector('.prize-amount');
    const prizeDigits = prizeAmount ? prizeAmount.textContent.replace(/[^0-9]/g, '') : '';
    if (prizeDigits) {
      const prize = document.createElement('p');
      prize.textContent = `$${Number(prizeDigits).toLocaleString('en-US')}`;
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

/* eslint-disable */
/* global WebImporter */

// Slides use picturefill backgrounds: <span data-src data-media> per breakpoint, no <img>.
// Returns [desktop, mobile]; mobile is null when the source has a single rendition.
function pickPicturefillSrcs(container) {
  // The import script's onLoad copies the spans to data-picturefill-srcs before html2md strips them.
  let renditions = [...container.querySelectorAll('[data-src]')].map((s) => ({
    media: s.getAttribute('data-media') || '',
    src: s.getAttribute('data-src'),
  }));
  if (!renditions.length && container.hasAttribute('data-picturefill-srcs')) {
    try { renditions = JSON.parse(container.getAttribute('data-picturefill-srcs')); } catch (e) { renditions = []; }
  }
  if (renditions.length) {
    const minWidth = (r) => {
      const m = r.media.match(/min-width:\s*(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    };
    renditions.sort((a, b) => minWidth(b) - minWidth(a));
    const desktop = renditions[0].src;
    const mobile = renditions[renditions.length - 1].src;
    return [desktop, mobile !== desktop ? mobile : null];
  }
  const style = container.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
  return [m ? m[1] : null, null];
}

export default function parse(element, { document }) {
  const cells = [];
  const slides = element.querySelectorAll('li.slide');

  slides.forEach((slide) => {
    const article = slide.querySelector('article.fca-carousel-slide-promo');
    if (!article) return;

    const link = slide.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    const imageCell = document.createElement('div');
    const bgHost = slide.querySelector('.picturefill-background') || article;
    const [desktopSrc, mobileSrc] = pickPicturefillSrcs(bgHost);
    const src = desktopSrc || slide.querySelector('img')?.getAttribute('src');
    // Desktop rendition first, then the mobile rendition (the block swaps them by viewport).
    // One paragraph per image: two images in a single paragraph lose the second on conversion.
    [src, mobileSrc].filter(Boolean).forEach((s) => {
      const p = document.createElement('p');
      const img = document.createElement('img');
      img.src = encodeURI(decodeURI(s));
      img.alt = '';
      p.appendChild(img);
      imageCell.appendChild(p);
    });

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

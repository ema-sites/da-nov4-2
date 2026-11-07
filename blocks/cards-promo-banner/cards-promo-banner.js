import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-promo-banner-card-image';
      } else {
        div.className = 'cards-promo-banner-card-body';
      }
    });

    /* wrap the entire card in its link if one exists */
    const link = li.querySelector('a');
    if (link) {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.className = 'cards-promo-banner-card-link';
      while (li.firstChild) wrapper.append(li.firstChild);
      link.replaceWith(link.textContent);
      li.append(wrapper);
    }

    ul.append(li);
  });

  /* optimize same-origin, non-SVG images */
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}

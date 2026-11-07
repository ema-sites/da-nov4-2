import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Source promo images are AEM renditions: imageM (mobile), imageT (>= 768px)
 * and imageD (>= 1200px). Authored content only carries the mobile rendition,
 * so restore the art-directed sources (e.g. the tall desktop rail promo).
 */
const RENDITIONS = [
  { name: 'imageD', media: '(width >= 1200px)' },
  { name: 'imageT', media: '(width >= 768px)' },
];

function addRenditionSources(img) {
  const picture = img.closest('picture');
  const src = img.getAttribute('src');
  if (!picture || !/\/imageM\.img\./.test(src) || picture.querySelector('source')) return;
  RENDITIONS.forEach(({ name, media }) => {
    const source = document.createElement('source');
    source.media = media;
    source.srcset = src.replace('/imageM.img.', `/${name}.img.`);
    picture.insertBefore(source, img);
  });
}

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
      wrapper.href = link.getAttribute('href');
      wrapper.className = 'cards-promo-banner-card-link';
      while (li.firstChild) wrapper.append(li.firstChild);
      link.replaceWith(...link.childNodes);
      li.append(wrapper);
    }

    ul.append(li);
  });

  /* optimize same-origin, non-SVG images */
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin) {
      addRenditionSources(img);
      return;
    }
    if (/\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}

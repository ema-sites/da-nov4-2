/* eslint-disable */
/* global WebImporter */

function backgroundUrl(el) {
  const style = el ? (el.getAttribute('style') || '') : '';
  const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
  return m ? m[1] : null;
}

// Copy a description paragraph keeping inline links (e.g. "Read more"), dropping icon spans.
function cleanParagraph(source, document) {
  const p = document.createElement('p');
  source.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      p.append(node.textContent.replace(/\s+/g, ' '));
    } else if (node.nodeName === 'A' && node.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = node.getAttribute('href');
      a.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      if (a.textContent) {
        if (p.textContent && !/\s$/.test(p.textContent)) p.append(' ');
        p.append(a);
      }
    } else if (node.textContent && node.textContent.trim()) {
      p.append(node.textContent.replace(/\s+/g, ' '));
    }
  });
  p.innerHTML = p.innerHTML.trim();
  return p.textContent.trim() ? p : null;
}

export default function parse(element, { document }) {
  const cells = [];
  const tiles = element.querySelectorAll('.game-tile.parbase');

  tiles.forEach((tile) => {
    const article = tile.querySelector('article.game-tile');
    if (!article) return;

    const title = article.querySelector('h3.game-tile-title');
    const titleText = title ? title.textContent.trim() : '';

    // Tile artwork is an inline CSS background on .game-tile-image-container.
    const imageCell = document.createElement('div');
    const imgHost = article.querySelector('.game-tile-image-container');
    const src = backgroundUrl(imgHost) || imgHost?.querySelector('img')?.getAttribute('src');
    if (src) {
      const img = document.createElement('img');
      img.src = encodeURI(decodeURI(src));
      img.alt = titleText;
      imageCell.appendChild(img);
    }
    // "NEW" ribbon is a sprite whose only text is a placeholder token.
    if (article.querySelector('.game-flag.new')) {
      const flag = document.createElement('p');
      flag.textContent = 'NEW';
      imageCell.appendChild(flag);
    }

    const textCell = document.createElement('div');
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      textCell.appendChild(h3);
    }

    article.querySelectorAll('.game-tile-description p').forEach((descEl) => {
      const p = cleanParagraph(descEl, document);
      if (p) textCell.appendChild(p);
    });

    const cta = article.querySelector('a.button');
    if (cta) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cta.getAttribute('href');
      link.textContent = cta.textContent.trim();
      p.appendChild(link);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-game-tiles', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

import carouselHeroBannerParser from './parsers/carousel-hero-banner.js';
import carouselWinnersParser from './parsers/carousel-winners.js';
import cardsGameTilesParser from './parsers/cards-game-tiles.js';
import cardsPromoBannerParser from './parsers/cards-promo-banner.js';
import alcCleanupTransformer from './transformers/alc-cleanup.js';
import alcSectionsTransformer from './transformers/alc-sections.js';

const PAGE_TEMPLATE = {
  "name": "alc",
  "urls": [
    "https://www.alc.ca/content/alc/en.html"
  ],
  "representativeUrl": "https://www.alc.ca/content/alc/en.html",
  "description": "ALC homepage with hero carousel, recent winners, featured games and promotions",
  "blocks": [
    {
      "name": "carousel-hero-banner",
      "instances": [
        "div.carousel.list.parbase.hero"
      ]
    },
    {
      "name": "carousel-winners",
      "instances": [
        "div.winners_carousel.winners-carousel.carousel.panelcontainer"
      ]
    },
    {
      "name": "cards-game-tiles",
      "instances": [
        ".cmp-container--game-tiles"
      ]
    },
    {
      "name": "cards-promo-banner",
      "instances": [
        "div.html-promo.parbase"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-hero-carousel",
      "name": "Hero Carousel",
      "selector": [
        "div.carousel.list.parbase.hero"
      ],
      "style": null,
      "blocks": [
        "carousel-hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "section-recent-winners",
      "name": "Recent Winners",
      "selector": [
        "div.section-header.cmp-section-header--alc-blue"
      ],
      "style": "light-blue",
      "blocks": [
        "carousel-winners"
      ],
      "defaultContent": [
        "div.section-header.cmp-section-header--alc-blue"
      ]
    },
    {
      "id": "section-featured-games",
      "name": "Featured Games and Promotions",
      "selector": [
        "div.alc-container:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-game-tiles",
        "cards-promo-banner"
      ],
      "defaultContent": [
        "div.section-header.cmp-section-header--alc-green"
      ]
    }
  ]
};

const parsers = {
  'carousel-hero-banner': carouselHeroBannerParser,
  'carousel-winners': carouselWinnersParser,
  'cards-game-tiles': cardsGameTilesParser,
  'cards-promo-banner': cardsPromoBannerParser,
};

const transformers = [alcCleanupTransformer, alcSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};

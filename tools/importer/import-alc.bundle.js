/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-alc.js
  var import_alc_exports = {};
  __export(import_alc_exports, {
    default: () => import_alc_default
  });

  // tools/importer/parsers/carousel-hero-banner.js
  function pickPicturefillSrcs(container) {
    let renditions = [...container.querySelectorAll("[data-src]")].map((s) => ({
      media: s.getAttribute("data-media") || "",
      src: s.getAttribute("data-src")
    }));
    if (!renditions.length && container.hasAttribute("data-picturefill-srcs")) {
      try {
        renditions = JSON.parse(container.getAttribute("data-picturefill-srcs"));
      } catch (e) {
        renditions = [];
      }
    }
    if (renditions.length) {
      const minWidth = (r) => {
        const m2 = r.media.match(/min-width:\s*(\d+)/);
        return m2 ? parseInt(m2[1], 10) : 0;
      };
      renditions.sort((a, b) => minWidth(b) - minWidth(a));
      const desktop = renditions[0].src;
      const mobile = renditions[renditions.length - 1].src;
      return [desktop, mobile !== desktop ? mobile : null];
    }
    const style = container.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    return [m ? m[1] : null, null];
  }
  function parse(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll("li.slide");
    slides.forEach((slide) => {
      var _a;
      const article = slide.querySelector("article.fca-carousel-slide-promo");
      if (!article) return;
      const link = slide.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const imageCell = document.createElement("div");
      const bgHost = slide.querySelector(".picturefill-background") || article;
      const [desktopSrc, mobileSrc] = pickPicturefillSrcs(bgHost);
      const src = desktopSrc || ((_a = slide.querySelector("img")) == null ? void 0 : _a.getAttribute("src"));
      [src, mobileSrc].filter(Boolean).forEach((s) => {
        const p = document.createElement("p");
        const img = document.createElement("img");
        img.src = encodeURI(decodeURI(s));
        img.alt = "";
        p.appendChild(img);
        imageCell.appendChild(p);
      });
      const textCell = document.createElement("div");
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = "Learn More";
        textCell.appendChild(cta);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-winners.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".slick-slide:not(.slick-cloned)");
    slides.forEach((slide) => {
      var _a, _b;
      const slideContent = slide.querySelector(".slide");
      if (!slideContent) return;
      const imageCell = document.createElement("div");
      const photoHost = slide.querySelector(".winner-image");
      const photoStyle = photoHost ? photoHost.getAttribute("style") || "" : "";
      const photoMatch = photoStyle.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
      const photoSrc = photoMatch ? photoMatch[1] : (_a = slideContent.querySelector(":scope > img")) == null ? void 0 : _a.getAttribute("src");
      if (photoSrc) {
        const newImg = document.createElement("img");
        newImg.src = encodeURI(decodeURI(photoSrc));
        newImg.alt = ((_b = slide.querySelector(".winner-info h3")) == null ? void 0 : _b.textContent.trim()) || "";
        imageCell.appendChild(newImg);
      }
      const textCell = document.createElement("div");
      const name = slide.querySelector(".winner-info h3");
      if (name) {
        const h3 = document.createElement("h3");
        h3.textContent = name.textContent.trim();
        textCell.appendChild(h3);
      }
      const location = slide.querySelector(".winner-info .h2");
      if (location) {
        const p = document.createElement("p");
        p.textContent = location.textContent.trim();
        textCell.appendChild(p);
      }
      const gameLogo = slide.querySelector("img.winning-game-logo");
      if (gameLogo) {
        const logoImg = document.createElement("img");
        logoImg.src = gameLogo.src;
        logoImg.alt = gameLogo.alt || "game logo";
        textCell.appendChild(logoImg);
      }
      const ribbon = slide.querySelector(".winning-game-ribbon");
      if (ribbon && ribbon.textContent.trim()) {
        const badge = document.createElement("p");
        badge.textContent = ribbon.textContent.trim();
        textCell.appendChild(badge);
      }
      const prizeAmount = slide.querySelector(".prize-amount");
      const prizeDigits = prizeAmount ? prizeAmount.textContent.replace(/[^0-9]/g, "") : "";
      if (prizeDigits) {
        const prize = document.createElement("p");
        prize.textContent = `$${Number(prizeDigits).toLocaleString("en-US")}`;
        textCell.appendChild(prize);
      }
      const winnersLink = slide.querySelector(".winner-info a.all-winners");
      if (winnersLink) {
        const link = document.createElement("a");
        link.href = winnersLink.getAttribute("href");
        link.textContent = winnersLink.textContent.trim();
        textCell.appendChild(link);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-winners", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-game-tiles.js
  function backgroundUrl(el) {
    const style = el ? el.getAttribute("style") || "" : "";
    const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    return m ? m[1] : null;
  }
  function cleanParagraph(source, document) {
    const p = document.createElement("p");
    source.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        p.append(node.textContent.replace(/\s+/g, " "));
      } else if (node.nodeName === "A" && node.getAttribute("href")) {
        const a = document.createElement("a");
        a.href = node.getAttribute("href");
        a.textContent = node.textContent.replace(/\s+/g, " ").trim();
        if (a.textContent) {
          if (p.textContent && !/\s$/.test(p.textContent)) p.append(" ");
          p.append(a);
        }
      } else if (node.textContent && node.textContent.trim()) {
        p.append(node.textContent.replace(/\s+/g, " "));
      }
    });
    p.innerHTML = p.innerHTML.trim();
    return p.textContent.trim() ? p : null;
  }
  function parse3(element, { document }) {
    const cells = [];
    const tiles = element.querySelectorAll(".game-tile.parbase");
    tiles.forEach((tile) => {
      var _a;
      const article = tile.querySelector("article.game-tile");
      if (!article) return;
      const title = article.querySelector("h3.game-tile-title");
      const titleText = title ? title.textContent.trim() : "";
      const imageCell = document.createElement("div");
      const imgHost = article.querySelector(".game-tile-image-container");
      const src = backgroundUrl(imgHost) || ((_a = imgHost == null ? void 0 : imgHost.querySelector("img")) == null ? void 0 : _a.getAttribute("src"));
      if (src) {
        const img = document.createElement("img");
        img.src = encodeURI(decodeURI(src));
        img.alt = titleText;
        imageCell.appendChild(img);
      }
      if (article.querySelector(".game-flag.new")) {
        const flag = document.createElement("p");
        flag.textContent = "NEW";
        imageCell.appendChild(flag);
      }
      const textCell = document.createElement("div");
      if (titleText) {
        const h3 = document.createElement("h3");
        h3.textContent = titleText;
        textCell.appendChild(h3);
      }
      article.querySelectorAll(".game-tile-description p").forEach((descEl) => {
        const p = cleanParagraph(descEl, document);
        if (p) textCell.appendChild(p);
      });
      const cta = article.querySelector("a.button");
      if (cta) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = cta.getAttribute("href");
        link.textContent = cta.textContent.trim();
        p.appendChild(link);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-game-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo-banner.js
  function parse4(element, { document }) {
    const cells = [];
    element.querySelectorAll(".cmp-image a[href]").forEach((link) => {
      const sourceImg = link.querySelector("img");
      if (!sourceImg) return;
      const src = sourceImg.getAttribute("src") || sourceImg.getAttribute("data-src");
      if (!src) return;
      const anchor = document.createElement("a");
      anchor.setAttribute("href", link.getAttribute("href"));
      const img = document.createElement("img");
      img.src = src;
      img.alt = sourceImg.getAttribute("alt") || "";
      anchor.appendChild(img);
      const cell = document.createElement("div");
      cell.appendChild(anchor);
      cells.push([cell]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/alc-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const { document } = payload;
      document.querySelectorAll(".cmp-experiencefragment--header").forEach((el) => el.remove());
      document.querySelectorAll(".cmp-experiencefragment--footer").forEach((el) => el.remove());
      document.querySelectorAll(".cmp-page__skiptomaincontent").forEach((el) => el.remove());
      document.querySelectorAll(".common-modals").forEach((el) => el.remove());
      const qualtricsEl = document.getElementById("ZN_3Eu2u7P45FmpwJ5");
      if (qualtricsEl) qualtricsEl.remove();
      document.querySelectorAll("iframe").forEach((el) => el.remove());
      document.querySelectorAll(".html-promo.parbase.aem-GridColumn--default--hide").forEach((el) => {
        var _a;
        const link = el.querySelector("a[href]");
        const host = el.querySelector(".picturefill-background") || el;
        let renditions = [];
        try {
          renditions = JSON.parse(host.getAttribute("data-picturefill-srcs") || "[]");
        } catch (e) {
          renditions = [];
        }
        if (!renditions.length) {
          renditions = [...host.querySelectorAll("[data-src]")].map((s) => ({ media: s.getAttribute("data-media") || "", src: s.getAttribute("data-src") }));
        }
        const minWidth = (r) => parseInt((r.media.match(/min-width:\s*(\d+)/) || [0, 0])[1], 10);
        renditions.sort((a2, b) => minWidth(a2) - minWidth(b));
        const src = (_a = renditions[0]) == null ? void 0 : _a.src;
        if (!link || !src) {
          el.remove();
          return;
        }
        const wrapper = document.createElement("div");
        wrapper.className = "alc-mobile-promo";
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Winning Numbers";
        a.appendChild(img);
        p.appendChild(a);
        wrapper.appendChild(p);
        el.replaceWith(wrapper);
      });
      document.querySelectorAll(".alc-mobile-banner").forEach((el) => (el.closest(".banner") || el).remove());
    }
    if (hookName === "afterTransform") {
      const { document } = payload;
      document.querySelectorAll('script, style, noscript, link[href*=".css"]').forEach((el) => el.remove());
      document.querySelectorAll("[data-cmp-link-accessibility-enabled]").forEach((el) => {
        el.removeAttribute("data-cmp-link-accessibility-enabled");
      });
      document.querySelectorAll("[data-cmp-link-accessibility-text]").forEach((el) => {
        el.removeAttribute("data-cmp-link-accessibility-text");
      });
    }
  }

  // tools/importer/transformers/alc-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const { document, template } = payload;
      if (!template || !template.sections) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        let target = null;
        for (const sel of section.selector) {
          target = document.querySelector(sel);
          if (target) break;
        }
        if (!target) continue;
        if (i > 0) {
          const hr = document.createElement("hr");
          if (section.style) {
            hr.setAttribute("data-excat-section-id", section.id);
          }
          target.before(hr);
        } else if (section.style) {
          const hr = document.createElement("hr");
          hr.setAttribute("data-excat-section-id", section.id);
          hr.setAttribute("data-excat-first-section", "true");
          target.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      const { document, template } = payload;
      if (!template || !template.sections) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = document.querySelector(`hr[data-excat-section-id="${section.id}"]`);
        if (!marker) continue;
        const isFirstSection = marker.getAttribute("data-excat-first-section") === "true";
        let insertionPoint = null;
        if (i < sections.length - 1) {
          insertionPoint = [...document.querySelectorAll("hr")].find((hr) => hr !== marker && marker.compareDocumentPosition(hr) & Node.DOCUMENT_POSITION_FOLLOWING && hr.getAttribute("data-excat-section-id") !== section.id) || null;
        }
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (insertionPoint) {
          insertionPoint.before(sectionMetadata);
        } else {
          if (marker.parentNode) {
            marker.parentNode.appendChild(sectionMetadata);
          }
        }
        marker.removeAttribute("data-excat-section-id");
        if (isFirstSection) {
          marker.remove();
        }
      }
    }
  }

  // tools/importer/import-alc.js
  var PAGE_TEMPLATE = {
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
          ".alc-container.aem-GridColumn--sm--6.aem-GridColumn--md--6"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-mobile-promo",
        "name": "Mobile Winning Numbers Banner",
        "selector": [
          ".alc-mobile-promo"
        ],
        "style": "mobile-only",
        "blocks": [],
        "defaultContent": [
          ".alc-mobile-promo"
        ]
      },
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
        "style": "light-blue, blue-heading",
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
          "div.section-header.cmp-section-header--alc-green"
        ],
        "style": "green-heading, sidebar",
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
  var parsers = {
    "carousel-hero-banner": parse,
    "carousel-winners": parse2,
    "cards-game-tiles": parse3,
    "cards-promo-banner": parse4
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_alc_default = {
    // Picturefill renditions sit in empty <span data-src> elements, which html2md strips
    // before parsers run; copy them onto the container first.
    onLoad: ({ document }) => {
      document.querySelectorAll(".picturefill-background").forEach((el) => {
        const srcs = [...el.querySelectorAll("[data-src]")].map((s) => ({
          media: s.getAttribute("data-media") || "",
          src: s.getAttribute("data-src")
        }));
        if (srcs.length) el.setAttribute("data-picturefill-srcs", JSON.stringify(srcs));
      });
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_alc_exports);
})();

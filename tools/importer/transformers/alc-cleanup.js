/* eslint-disable */
/* global WebImporter */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    const { document } = payload;

    // Remove header experience fragment (desktop + mobile headers, nav, login modals)
    document.querySelectorAll('.cmp-experiencefragment--header').forEach((el) => el.remove());

    // Remove footer experience fragment
    document.querySelectorAll('.cmp-experiencefragment--footer').forEach((el) => el.remove());

    // Remove skip-to-main-content link
    document.querySelectorAll('.cmp-page__skiptomaincontent').forEach((el) => el.remove());

    // Remove common modals (browser upgrade, etc.)
    document.querySelectorAll('.common-modals').forEach((el) => el.remove());

    // Remove Qualtrics survey container
    const qualtricsEl = document.getElementById('ZN_3Eu2u7P45FmpwJ5');
    if (qualtricsEl) qualtricsEl.remove();

    // Remove tracking iframes (doubleclick, adsrvr, analytics)
    document.querySelectorAll('iframe').forEach((el) => el.remove());

    // Mobile-only promo above the hero (hidden >= 768px on the source): keep it as a linked
    // image using its mobile rendition; the sections transformer gives it a mobile-only section.
    document.querySelectorAll('.html-promo.parbase.aem-GridColumn--default--hide').forEach((el) => {
      const link = el.querySelector('a[href]');
      const host = el.querySelector('.picturefill-background') || el;
      let renditions = [];
      try { renditions = JSON.parse(host.getAttribute('data-picturefill-srcs') || '[]'); } catch (e) { renditions = []; }
      if (!renditions.length) {
        renditions = [...host.querySelectorAll('[data-src]')].map((s) => ({ media: s.getAttribute('data-media') || '', src: s.getAttribute('data-src') }));
      }
      const minWidth = (r) => parseInt((r.media.match(/min-width:\s*(\d+)/) || [0, 0])[1], 10);
      renditions.sort((a, b) => minWidth(a) - minWidth(b));
      const src = renditions[0]?.src;
      if (!link || !src) { el.remove(); return; }
      const wrapper = document.createElement('div');
      wrapper.className = 'alc-mobile-promo';
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Winning Numbers';
      a.appendChild(img);
      p.appendChild(a);
      wrapper.appendChild(p);
      el.replaceWith(wrapper);
    });

    // Remove the "Download our App" smart-banner (browser-detected overlay, not page content)
    document.querySelectorAll('.alc-mobile-banner').forEach((el) => (el.closest('.banner') || el).remove());
  }

  if (hookName === 'afterTransform') {
    const { document } = payload;

    // Remove any remaining script, style, noscript, and link[rel=stylesheet] tags
    document.querySelectorAll('script, style, noscript, link[href*=".css"]').forEach((el) => el.remove());

    // Remove tracking/data attributes that are not authorable
    document.querySelectorAll('[data-cmp-link-accessibility-enabled]').forEach((el) => {
      el.removeAttribute('data-cmp-link-accessibility-enabled');
    });
    document.querySelectorAll('[data-cmp-link-accessibility-text]').forEach((el) => {
      el.removeAttribute('data-cmp-link-accessibility-text');
    });
  }
}

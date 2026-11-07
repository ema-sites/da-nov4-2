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

    // Remove hidden promo banner above hero (display:none on desktop)
    document.querySelectorAll('.html-promo.parbase.aem-GridColumn--default--hide').forEach((el) => el.remove());
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

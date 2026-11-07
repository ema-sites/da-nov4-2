/* eslint-disable */
/* global WebImporter */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    const { document, template } = payload;
    if (!template || !template.sections) return;

    const sections = template.sections;

    // Walk sections in reverse to insert <hr> breaks before non-first sections
    // while parser target elements still exist in the DOM.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      let target = null;

      // Try each selector in order until one matches
      for (const sel of section.selector) {
        target = document.querySelector(sel);
        if (target) break;
      }

      if (!target) continue;

      if (i > 0) {
        // Non-first section: insert <hr> before it
        const hr = document.createElement('hr');
        if (section.style) {
          hr.setAttribute('data-excat-section-id', section.id);
        }
        target.before(hr);
      } else if (section.style) {
        // First section with a style: insert a temporary marked <hr> before it
        const hr = document.createElement('hr');
        hr.setAttribute('data-excat-section-id', section.id);
        hr.setAttribute('data-excat-first-section', 'true');
        target.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    const { document, template } = payload;
    if (!template || !template.sections) return;

    const sections = template.sections;

    // Walk sections in reverse and insert Section Metadata blocks for styled sections
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      // Find the marker <hr> for this section
      const marker = document.querySelector(`hr[data-excat-section-id="${section.id}"]`);
      if (!marker) continue;

      const isFirstSection = marker.getAttribute('data-excat-first-section') === 'true';

      // Find the insertion point: after the section content, before the next <hr> or end
      // For Section Metadata, we insert it after the last content element of this section
      let insertionPoint = null;

      if (i < sections.length - 1) {
        // Find the next section's <hr> (the break after this section's content)
        // Walk siblings from marker forward to find the next <hr>
        let sibling = marker.nextElementSibling;
        while (sibling) {
          if (sibling.tagName === 'HR' && !sibling.hasAttribute('data-excat-section-id')) {
            insertionPoint = sibling;
            break;
          }
          if (sibling.tagName === 'HR' && sibling.hasAttribute('data-excat-section-id')
            && sibling.getAttribute('data-excat-section-id') !== section.id) {
            insertionPoint = sibling;
            break;
          }
          sibling = sibling.nextElementSibling;
        }
      }

      // Create Section Metadata block
      const sectionMetadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (insertionPoint) {
        insertionPoint.before(sectionMetadata);
      } else {
        // Last section or no next break found: append to parent
        if (marker.parentNode) {
          marker.parentNode.appendChild(sectionMetadata);
        }
      }

      // Clean up the marker attribute
      marker.removeAttribute('data-excat-section-id');

      // Remove first section's temporary <hr> entirely
      if (isFirstSection) {
        marker.remove();
      }
    }
  }
}

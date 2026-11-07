export default function decorate(block) {
  const props = [...block.querySelectorAll(':scope > div')].map((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const val = row.children[1]?.textContent?.trim();
    return [key, val];
  });
  const section = block.closest('.section');
  if (section) {
    props.forEach(([key, val]) => {
      if (key === 'style') section.classList.add(...val.split(',').map((s) => s.trim()));
    });
  }
  block.closest('.section-metadata-wrapper')?.remove();
}

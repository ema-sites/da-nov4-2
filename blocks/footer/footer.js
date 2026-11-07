/* fragment images are authored relative to the fragment, not to the page rendering it */
function resolveImages(root, baseUrl) {
  root.querySelectorAll('img').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), baseUrl).href;
    img.loading = 'lazy';
  });
}

function markExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin && /^https?:$/.test(url.protocol)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

const isOnly = (p, tag) => p.children.length === 1
  && p.firstElementChild.tagName === tag
  && p.textContent.trim() === p.firstElementChild.textContent.trim();

/* section roles are inferred from content shape, so authors only manage plain content */
function sectionRole(section, linkGridsSeen) {
  const paras = [...section.querySelectorAll(':scope > p')];
  if (paras.some((p) => isOnly(p, 'EM')) && paras.some((p) => isOnly(p, 'STRONG'))) return 'signup';
  if (section.querySelector(':scope > h2') && section.querySelector(':scope > ul')) {
    return linkGridsSeen ? 'links-compact' : 'links';
  }
  if (section.querySelector(':scope > h3') && section.querySelector('a img')) return 'sites';
  if (paras.some((p) => p.querySelector('a img'))) return 'contact';
  return 'legal';
}

function buildSignup(section) {
  const paras = [...section.querySelectorAll(':scope > p')];
  const placeholderP = paras.find((p) => isOnly(p, 'EM'));
  const submitP = paras.find((p) => isOnly(p, 'STRONG'));
  const message = paras.find((p) => p !== placeholderP && p !== submitP);
  const placeholder = placeholderP.textContent.trim();

  const form = document.createElement('form');
  form.className = 'footer-signup-form';
  form.noValidate = true;
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.autocomplete = 'email';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  const button = document.createElement('button');
  button.type = 'submit';
  button.disabled = true;
  button.textContent = submitP.textContent.trim();
  form.append(input, button);

  input.addEventListener('input', () => {
    button.disabled = !input.validity.valid || !input.value.trim();
  });
  // the source subscribes through its own client script and terms dialog; no public endpoint
  form.addEventListener('submit', (e) => e.preventDefault());

  placeholderP.remove();
  submitP.remove();
  if (message) message.className = 'footer-signup-message';
  section.append(form);
}

function buildContact(section) {
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('a img')) p.className = 'footer-social';
    else if (p.querySelector('img')) p.className = 'footer-badge';
    else if (p.querySelector('a')) p.className = 'footer-contact-link';
    else p.className = 'footer-feedback';
  });
}

/* h2 + optional h3 + ul runs become columns (desktop) or accordion items (compact) */
function buildGroups(section, compact) {
  const groups = [];
  let current = null;
  [...section.children].forEach((el) => {
    if (el.tagName === 'H2') {
      current = document.createElement('div');
      current.className = 'footer-group';
      groups.push(current);
    }
    if (current) current.append(el);
  });
  section.replaceChildren(...groups);

  if (!compact) return;
  groups.forEach((group, i) => {
    const heading = group.querySelector('h2');
    const list = group.querySelector('ul');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-group-toggle';
    button.setAttribute('aria-expanded', 'false');
    list.id = `footer-group-${i}`;
    button.setAttribute('aria-controls', list.id);
    button.append(...heading.childNodes);
    heading.append(button);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      section.querySelectorAll('.footer-group-toggle[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
}

function buildLegal(section) {
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('img') && !p.textContent.trim()) p.className = 'footer-legal-badges';
    else if (p.querySelectorAll('a').length > 1) p.className = 'footer-legal-links';
    else p.className = 'footer-legal-note';
  });
}

export default async function decorate(block) {
  // metadata-independent: /content first (local preview), then the site root (DA/EDS)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const footer = document.createElement('div');
  footer.innerHTML = await resp.text();
  resolveImages(footer, resp.url);
  markExternalLinks(footer);

  let linkGridsSeen = false;
  [...footer.children].forEach((section) => {
    const role = sectionRole(section, linkGridsSeen);
    section.classList.add('footer-section', `footer-${role}`);
    if (role === 'signup') buildSignup(section);
    else if (role === 'contact') buildContact(section);
    else if (role === 'links' || role === 'links-compact') {
      buildGroups(section, role === 'links-compact');
      linkGridsSeen = true;
    } else if (role === 'legal') buildLegal(section);
  });

  block.textContent = '';
  block.append(footer);
}

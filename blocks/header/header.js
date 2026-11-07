const isDesktop = window.matchMedia('(width >= 900px)');

function toClassName(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* nav images are authored relative to the fragment, not to the page that renders it */
function resolveImages(root, baseUrl) {
  root.querySelectorAll('img').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), baseUrl).href;
  });
}

function closePanels(nav, except) {
  nav.querySelectorAll('.nav-drop > button[aria-expanded="true"]').forEach((button) => {
    if (button !== except) button.setAttribute('aria-expanded', 'false');
  });
}

function toggleMenu(nav, force) {
  const open = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger');
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) closePanels(nav);
}

/* a dropdown <li>: trigger link, a list with images (cards), optional heading <p>,
   optional plain list (more links) and an image-only <p> (decorative side image) */
function buildDropdown(li, index) {
  const trigger = li.querySelector(':scope > a');
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = `nav-panel-${index}`;

  const more = document.createElement('div');
  more.className = 'nav-panel-more';

  [...li.children].forEach((child) => {
    if (child === trigger) return;
    if (child.tagName === 'UL' && child.querySelector('img')) {
      child.className = 'nav-cards';
      child.querySelectorAll(':scope > li').forEach((card) => {
        const [imageLink, cta] = card.querySelectorAll('a');
        const img = imageLink?.querySelector('img');
        if (img) {
          const label = document.createElement('span');
          label.className = 'nav-card-label';
          label.textContent = img.alt;
          imageLink.classList.add('nav-card-image');
          imageLink.append(label);
        }
        if (cta) cta.classList.add('nav-card-cta');
      });
      panel.prepend(child);
    } else if (child.tagName === 'UL') {
      child.className = 'nav-more-list';
      more.append(child);
    } else if (child.tagName === 'P' && child.querySelector('img') && !child.textContent.trim()) {
      // decorative side art: painted as a background like the source, not an inline image
      more.style.backgroundImage = `url("${child.querySelector('img').src}")`;
    } else if (child.tagName === 'P') {
      child.className = 'nav-more-title';
      more.prepend(child);
    }
  });
  if (more.children.length) panel.append(more);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-drop-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panel.id);
  button.textContent = trigger.textContent.trim();

  li.classList.add('nav-drop');
  li.replaceChildren(button, panel);
  return button;
}

function buildSearch(link) {
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = link.getAttribute('href');
  const placeholder = link.textContent.trim();
  form.innerHTML = `<input type="search" name="q" maxlength="2048" autocomplete="off">
    <button type="submit" aria-label="Search"></button>`;
  const input = form.querySelector('input');
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  return form;
}

function cloneLink(link, className) {
  const copy = link.cloneNode(true);
  copy.className = className;
  return copy;
}

export default async function decorate(block) {
  // metadata-independent: /content first (local preview), then the site root (DA/EDS)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = await resp.text();
  resolveImages(fragment, resp.url);
  const [brandSection, sectionsSection, toolsSection] = fragment.children;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"><span></span></span><span class="nav-hamburger-label" aria-hidden="true">Menu</span>';
  hamburger.addEventListener('click', () => toggleMenu(nav));

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) brand.append(...brandSection.children);

  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';

  const sections = sectionsSection?.querySelector('ul');
  if (sections) {
    sections.className = 'nav-sections';
    [...sections.children].forEach((li, i) => {
      if (!li.querySelector(':scope > ul')) return;
      const button = buildDropdown(li, i);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        closePanels(nav, button);
        button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  const searchLink = toolsSection?.querySelector(':scope > p a[href*="search"]');
  const search = searchLink ? buildSearch(searchLink) : null;
  searchLink?.closest('p').remove();

  const tools = toolsSection?.querySelector(':scope > ul');
  const toolLinks = {};
  if (tools) {
    tools.className = 'nav-tools';
    tools.querySelectorAll('a').forEach((a) => {
      const name = toClassName(a.textContent);
      a.closest('li').classList.add(`nav-tool-${name}`);
      toolLinks[name] = a;
      if (a.getAttribute('href').startsWith('?')) {
        // language toggle shows its two-letter code in the compact bar (CSS attr(), no extra text)
        a.dataset.short = a.textContent.trim().slice(0, 2).toUpperCase();
      }
    });
  }

  const signInLink = toolsSection?.querySelector(':scope > p a');
  if (signInLink) signInLink.className = 'nav-signin';

  const account = document.createElement('div');
  account.className = 'nav-drawer-account';
  if (toolLinks['create-account']) account.append(cloneLink(toolLinks['create-account'], 'nav-drawer-create'));
  if (signInLink) account.append(cloneLink(signInLink, 'nav-signin'));

  const drawerLinks = document.createElement('p');
  drawerLinks.className = 'nav-drawer-links';
  ['help', 'francais'].forEach((name) => {
    if (!toolLinks[name]) return;
    const copy = cloneLink(toolLinks[name], `nav-drawer-${name}`);
    delete copy.dataset.short;
    drawerLinks.append(copy);
  });

  drawer.append(account);
  if (sections) drawer.append(sections);
  if (search) drawer.append(search);
  drawer.append(drawerLinks);

  nav.append(hamburger, brand, drawer);
  if (tools) nav.append(tools);
  if (signInLink) {
    const tab = document.createElement('div');
    tab.className = 'nav-signin-tab';
    tab.append(signInLink);
    nav.append(tab);
  }

  // close panels on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closePanels(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop > button[aria-expanded="true"]');
    if (open) {
      closePanels(nav);
      open.focus();
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}

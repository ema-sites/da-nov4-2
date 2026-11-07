export default async function decorate(block) {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  block.textContent = '';
  const footer = document.createElement('div');
  footer.innerHTML = html;
  block.append(footer);
}

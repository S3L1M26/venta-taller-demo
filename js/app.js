import { storeConfig } from './config.js';

const state = { products: [], category: 'all', query: '', sort: 'name' };
const priceFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: storeConfig.currency, maximumFractionDigits: 0 });
const $ = (selector) => document.querySelector(selector);

function whatsappUrl(message) {
  if (!/^\d+$/.test(storeConfig.whatsappNumber)) return null;
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function generalMessage() { return storeConfig.defaultMessage; }

function productMessage(product) {
  return `Hola, me interesa consultar el repuesto ${product.name}, código ${product.sku}, con precio de referencia de ${priceFormatter.format(product.price)}. ¿Podrían confirmar disponibilidad, compatibilidad con mi vehículo y opciones de despacho?`;
}

function setWhatsAppLinks() {
  const url = whatsappUrl(generalMessage());
  document.querySelectorAll('[data-whatsapp-general]').forEach((link) => {
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.href = '#';
      link.addEventListener('click', () => window.alert('El número de WhatsApp aún no está configurado. Revisa js/config.js.'));
    }
  });
}

function sanitizeImagePath(path) {
  return typeof path === 'string' && /^(assets\/images\/)[\w./-]+\.svg$/i.test(path) ? path : 'assets/images/parts-placeholder.svg';
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-image';
  const image = document.createElement('img');
  image.src = sanitizeImagePath(product.image);
  image.alt = `Ilustración de ${product.name}`;
  image.loading = 'lazy';
  image.onerror = () => { image.src = 'assets/images/parts-placeholder.svg'; };
  imageWrap.append(image);
  const category = document.createElement('span');
  category.className = 'product-category';
  category.textContent = product.category;
  imageWrap.append(category);
  article.append(imageWrap);
  const body = document.createElement('div');
  body.className = 'product-body';
  const title = document.createElement('h3');
  title.textContent = product.name;
  const sku = document.createElement('p');
  sku.className = 'product-sku';
  sku.textContent = `SKU ${product.sku}`;
  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = product.description;
  const footer = document.createElement('div');
  footer.className = 'product-footer';
  const price = document.createElement('strong');
  price.className = 'product-price';
  price.textContent = priceFormatter.format(product.price);
  const stock = document.createElement('span');
  stock.className = 'stock-status';
  stock.textContent = '● Disponible para consultar';
  footer.append(price, stock);
  const button = document.createElement('a');
  button.className = 'product-whatsapp';
  button.textContent = 'Consultar por WhatsApp ↗';
  const url = whatsappUrl(productMessage(product));
  if (url) {
    button.href = url;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  } else {
    button.href = '#';
    button.addEventListener('click', () => window.alert('El número de WhatsApp aún no está configurado. Revisa js/config.js.'));
  }
  body.append(title, sku, description, footer, button);
  article.append(body);
  return article;
}

function visibleProducts() {
  const query = state.query.trim().toLocaleLowerCase('es');
  const filtered = state.products.filter((product) => {
    const matchesCategory = state.category === 'all' || product.category === state.category;
    const searchable = `${product.name} ${product.category} ${product.sku}`.toLocaleLowerCase('es');
    return matchesCategory && searchable.includes(query);
  });
  return filtered.sort((a, b) => state.sort === 'price-asc' ? a.price - b.price : state.sort === 'price-desc' ? b.price - a.price : a.name.localeCompare(b.name, 'es'));
}

function renderProducts() {
  const grid = $('#products-grid');
  const empty = $('#empty-state');
  grid.replaceChildren();
  const products = visibleProducts();
  $('#results-count').textContent = `${products.length} ${products.length === 1 ? 'repuesto encontrado' : 'repuestos encontrados'}`;
  products.forEach((product) => grid.append(createProductCard(product)));
  empty.hidden = products.length > 0;
}

function resetFilters() {
  state.category = 'all'; state.query = ''; state.sort = 'name';
  $('#search-input').value = ''; $('#sort-select').value = 'name';
  document.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.category === 'all'));
  renderProducts();
}

function bindEvents() {
  $('#search-input').addEventListener('input', (event) => { state.query = event.target.value; renderProducts(); });
  $('#sort-select').addEventListener('change', (event) => { state.sort = event.target.value; renderProducts(); });
  $('#category-filters').addEventListener('click', (event) => {
    const chip = event.target.closest('.filter-chip');
    if (!chip) return;
    state.category = chip.dataset.category;
    document.querySelectorAll('.filter-chip').forEach((item) => item.classList.toggle('is-active', item === chip));
    renderProducts();
  });
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#empty-clear').addEventListener('click', resetFilters);
  const menuToggle = $('.menu-toggle');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    $('#main-nav').classList.toggle('is-open', !open);
  });
  document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false'); $('#main-nav').classList.remove('is-open');
  }));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search-input').focus(); }
  });
}

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.products) || data.products.length !== 10) throw new Error('Formato de inventario inválido');
    state.products = data.products;
    renderProducts();
  } catch (error) {
    console.error('No se pudo cargar el catálogo:', error);
    $('#results-count').textContent = 'Catálogo no disponible';
    $('#load-error').hidden = false;
  }
}

document.querySelectorAll('[data-store-name]').forEach((element) => { element.textContent = storeConfig.name; });
$('#current-year').textContent = String(new Date().getFullYear());
setWhatsAppLinks();
bindEvents();
loadProducts();

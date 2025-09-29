// Check if user is logged in, redirect to login if not
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

if (!getCurrentUser()) {
  window.location.href = 'login.html';
}

// Store functionality
const DB_PATH = 'db.json';
let allBooks = [];
const booksEl = document.getElementById('books');
const template = document.getElementById('book-template');
const searchInput = document.getElementById('search');
const cartCountEl = document.getElementById('cart-count');
const createForm = document.getElementById('create-form');
const usernameEl = document.getElementById('username');

// Display current user
const user = getCurrentUser();
usernameEl.textContent = user.name;

// Logout functionality
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
});

// Cart functions
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const c = getCart().reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = c;
}

// Render books
function renderList(list) {
  booksEl.innerHTML = '';
  list.forEach(book => {
    const node = template.content.cloneNode(true);
    const img = node.querySelector('img');
    img.src = book.cover || 'https://via.placeholder.com/300x180?text=No+Cover';
    img.alt = `${book.title} cover`;
    node.querySelector('h4').textContent = book.title;
    node.querySelector('.author').textContent = book.author;
    node.querySelector('.price').textContent = `$${Number(book.price).toFixed(2)}`;
    const addBtn = node.querySelector('.add');
    addBtn.addEventListener('click', () => addToCart(book));
    const details = node.querySelector('.details');
    details.addEventListener('click', () =>
      alert(`${book.title}\\n\\nAuthor: ${book.author}\\n\\n${book.description || 'No description.'}`)
    );
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.background = 'red';
    deleteBtn.style.color = 'white';
    deleteBtn.addEventListener('click', () => deleteBook(book));
    node.querySelector('.actions').appendChild(deleteBtn);
    booksEl.appendChild(node);
  });
}

function deleteBook(book) {
  if (confirm(`Delete "${book.title}"?`)) {
    allBooks = allBooks.filter(b => b.id !== book.id);
    renderList(allBooks);
  }
}

function addToCart(book) {
  const cart = getCart();
  const found = cart.find(i => i.id === book.id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ id: book.id, title: book.title, price: book.price, qty: 1 });
  }
  saveCart(cart);
  alert(`Added "${book.title}" to cart.`);
}

// Load books
async function load() {
  try {
    const res = await fetch(DB_PATH, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network');
    const data = await res.json();
    allBooks = data.books || [];
  } catch (err) {
    allBooks = [
      {
        id: 1,
        title: 'Fallback Book A',
        author: 'Author A',
        price: 9.99,
        cover: '',
        description: 'Offline sample book.'
      }
    ];
  }
  renderList(allBooks);
  updateCartCount();
}

// Search
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return renderList(allBooks);
  const filtered = allBooks.filter(b =>
    (b.title + ' ' + (b.author || '')).toLowerCase().includes(q)
  );
  renderList(filtered);
});

// Add book
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const price = parseFloat(document.getElementById('price').value) || 0;
  const cover = document.getElementById('cover').value.trim();
  const desc = document.getElementById('desc').value.trim();
  const nextId = allBooks.reduce((m, b) => Math.max(m, b.id || 0), 0) + 1;
  const book = { id: nextId, title, author, price, cover, description: desc };
  allBooks.unshift(book);

  const userBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
  userBooks.unshift(book);
  localStorage.setItem('userBooks', JSON.stringify(userBooks));

  renderList(allBooks);
  createForm.reset();
});

// Start app
async function start() {
  await load();
  const userBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
  if (Array.isArray(userBooks) && userBooks.length) {
    allBooks = [...userBooks, ...allBooks];
  }
  renderList(allBooks);
}

start();

// Cart viewer
document.getElementById('view-cart').addEventListener('click', () => {
  const cart = getCart();
  if (!cart || !cart.length) return alert('Cart is empty');
  const lines = cart.map(i =>
    `${i.title} — ${i.qty} × $${Number(i.price).toFixed(2)} = $${(i.qty * i.price).toFixed(2)}`
  );
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2);
  if (confirm(lines.join('\\n') + `\\n\\nTotal: $${total}\\n\\nClear cart?`)) {
    localStorage.removeItem('cart');
    updateCartCount();
  }
});
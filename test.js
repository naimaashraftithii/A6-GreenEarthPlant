/* =========================================================
   Green Earth — Categories | Cards | Cart | Modal
   - API with graceful local fallback
   - Cart with qty +/−, remove, total
   - Modal image height = card image height + 10px
   ========================================================= */

const API = "https://openapi.programming-hero.com/api";

// DOM
const categoryList = document.getElementById("category-list");
const cardGrid     = document.getElementById("card-grid");
const emptyState   = document.getElementById("empty-state");
const spinner      = document.getElementById("spinner");

const cartItemsEl  = document.getElementById("cart-items");
const cartTotalEl  = document.getElementById("cart-total");
const cartCountEl  = document.getElementById("cart-count");

// Modal
const qvDialog = document.getElementById("quick-view");
const qvClose  = document.getElementById("qv-close");
const qvImg    = document.getElementById("modal-img");
const qvName   = document.getElementById("qv-name");
const qvDesc   = document.getElementById("qv-desc");
const qvCat    = document.getElementById("qv-cat");
const qvPrice  = document.getElementById("qv-price");
const qvAdd    = document.getElementById("qv-add");

// State
let categories = [];
let allPlants  = [];
let cart       = []; // [{id,name,price,qty}]

// Utils
const money = (n) => `৳ ${Number(n || 0).toLocaleString("en-IN")}`;

const showSpinner = (on) => {
  if (on) {
    spinner.classList.remove("hidden");
    cardGrid.classList.add("hidden");
    emptyState.classList.add("hidden");
  } else {
    spinner.classList.add("hidden");
    cardGrid.classList.remove("hidden");
  }
};

const setActive = (btn) => {
  document.querySelectorAll(".cat-btn")
    .forEach(b => b.classList.remove("bg-emerald-700","text-white"));
  btn.classList.add("bg-emerald-700","text-white");
};

// Fetch with fallback
async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("network");
  return res.json();
}

async function loadCategories() {
  try {
    const json = await getJSON(`${API}/categories`);
    categories = json.categories || [];
  } catch {
    categories = [
      { id: 1, category_name: "Fruit Tree" },
      { id: 2, category_name: "Flowering Tree" },
      { id: 3, category_name: "Shade Tree" },
      { id: 4, category_name: "Medicinal Tree" },
      { id: 5, category_name: "Timber Tree" },
      { id: 6, category_name: "Evergreen Tree" },
      { id: 7, category_name: "Ornamental Plant" },
      { id: 8, category_name: "Bamboo" },
      { id: 9, category_name: "Climber" },
      { id: 10, category_name: "Aquatic Plant" }
    ];
  }
  renderCategories();
}

async function loadAllPlants() {
  showSpinner(true);
  try {
    const json = await getJSON(`${API}/plants`);
    allPlants = json.plants || [];
  } catch {
    allPlants = [
      {
        id: 1, name: "Mango Tree",
        image: "https://i.ibb.co.com/cSQdg7tf/mango-min.jpg",
        description: "A fast-growing tropical tree that produces delicious, juicy mangoes during summer. Its dense green canopy offers shade.",
        category: "Fruit Tree", price: 500
      },
      {
        id: 2, name: "Guava Tree",
        image: "https://i.ibb.co.com/WNbbx3rn/guava-min.jpg",
        description: "A hardy fruit tree that grows in various climates, yielding guavas packed with Vitamin C.",
        category: "Fruit Tree", price: 350
      },
      {
        id: 4, name: "Gulmohar",
        image: "https://i.ibb.co.com/1YzsVWjm/Gulmohar-min.jpg",
        description: "Known as the ‘Flame of the Forest’, this tree bursts into a vibrant display of red flowers every summer.",
        category: "Flowering Tree", price: 400
      }
    ];
  }
  renderCards(allPlants);
  showSpinner(false);
}

async function loadPlantsByCategory(id) {
  showSpinner(true);
  try {
    const json = await getJSON(`${API}/category/${id}`);
    renderCards(json.plants || json.data || []);
  } catch {
    const cName = (categories.find(c => String(c.id) === String(id)) || {}).category_name || "";
    renderCards(allPlants.filter(p => p.category === cName));
  } finally {
    showSpinner(false);
  }
}

// UI — Categories
function renderCategories() {
  categoryList.innerHTML = "";
  const base = "cat-btn px-3 py-2 rounded-md hover:bg-emerald-100 text-left";

  const allBtn = document.createElement("button");
  allBtn.className = base + " bg-emerald-700 text-white";
  allBtn.textContent = "All Trees";
  allBtn.onclick = () => { setActive(allBtn); renderCards(allPlants); };
  categoryList.appendChild(allBtn);

  categories.forEach(c => {
    const b = document.createElement("button");
    b.className = base;
    b.textContent = c.category_name;
    b.onclick = () => { setActive(b); loadPlantsByCategory(c.id); };
    categoryList.appendChild(b);
  });
}

// UI — Cards (padded + shadow)
function renderCards(list) {
  cardGrid.innerHTML = "";
  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  list.forEach(p => {
    const card = document.createElement("article");

    // Outer card: padding + shadow + rounded
    card.className = `
      bg-white rounded-3xl shadow-md ring-1 ring-black/5
      hover:shadow-lg hover:ring-emerald-200 transition
      cursor-pointer p-4
    `;

    card.innerHTML = `
      <!-- Image with its own rounding, sitting inside card padding -->
      <img src="${p.image}" alt="${p.name}"
           class="card-img w-full h-48 sm:h-56 object-cover rounded-2xl">

      <!-- Body area with spacing from image -->
      <div class="mt-4">
        <h4 class="font-semibold text-lg">${p.name}</h4>
        <p class="mt-1 text-sm text-gray-600 line-clamp-2">
          ${p.description || ""}
        </p>

        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
            ${p.category}
          </span>
          <span class="font-semibold">${money(p.price)}</span>
        </div>

        <button
          class="mt-3 w-full bg-emerald-700 text-white py-2 rounded-full text-sm add-btn
                 hover:brightness-110 active:brightness-95 transition">
          Add to Cart
        </button>
      </div>
    `;

    // Open modal on full-card click (except the add button)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) return;
      const h = card.querySelector(".card-img").clientHeight + 10; // image + 10px
      openModal(p, h);
    });

    // Add to cart
    card.querySelector(".add-btn").addEventListener("click", () => addToCart(p));

    cardGrid.appendChild(card);
  });
}

// Cart
function addToCart(p) {
  const found = cart.find(i => i.id === p.id);
  if (found) found.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: Number(p.price || 0), qty: 1 });
  renderCart();
}
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}
function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0, count = 0;

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    count += item.qty;

    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-2";
    li.innerHTML = `
      <div class="min-w-0">
        <p class="truncate">${item.name}</p>
        <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <button class="px-2 py-0.5 border rounded" data-act="dec">−</button>
          <span>×${item.qty}</span>
          <button class="px-2 py-0.5 border rounded" data-act="inc">+</button>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="font-medium">${money(item.price * item.qty)}</span>
        <button class="text-red-500" title="Remove" data-act="rm">✖</button>
      </div>`;

    li.querySelector("[data-act='dec']").onclick = () => changeQty(i, -1);
    li.querySelector("[data-act='inc']").onclick = () => changeQty(i, +1);
    li.querySelector("[data-act='rm']").onclick  = () => removeItem(i);

    cartItemsEl.appendChild(li);
  });

  cartTotalEl.textContent = money(total);
  cartCountEl.textContent = count ? `Items: ${count}` : "";
}

// Modal
function openModal(p, imgHeight) {
  qvImg.src = p.image || "";
  qvImg.style.height = imgHeight ? `${imgHeight}px` : "";
  qvName.textContent  = p.name || "Tree";
  qvDesc.textContent  = p.description || "—";
  qvCat.textContent   = p.category || "—";
  qvPrice.textContent = money(p.price || 0);
  qvAdd.onclick = () => addToCart(p);
  qvDialog.showModal();
}
qvClose.addEventListener("click", () => qvDialog.close());

// Boot
loadCategories();
loadAllPlants();
renderCart();

const API = "https://openapi.programming-hero.com/api";

const categoryList = document.getElementById("category-list");
const cardGrid = document.getElementById("card-grid");
const emptyState = document.getElementById("empty-state");
const spinner = document.getElementById("spinner");

const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

// Modal
const modal = document.getElementById("tree-modal");
const modalImg = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalDesc = document.getElementById("modal-desc");
const modalCat = document.getElementById("modal-cat");
const modalPrice = document.getElementById("modal-price");
const modalClose = document.getElementById("modal-close");

let categories = [];
let allPlants = [];
let cart = [];

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
  document.querySelectorAll(".cat-btn").forEach((b) =>
    b.classList.remove("bg-emerald-700", "text-white")
  );
  btn.classList.add("bg-emerald-700", "text-white");
};

// Load categories
async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`);
    const json = await res.json();
    categories = json.categories || [];
  } catch {
    categories = [
      { id: 1, category_name: "Fruit Tree" },
      { id: 2, category_name: "Flowering Tree" },
      { id: 3, category_name: "Shade Tree" },
    ];
  }
  renderCategories();
}

// Load all plants
async function loadAllPlants() {
  showSpinner(true);
  try {
    const res = await fetch(`${API}/plants`);
    const json = await res.json();
    allPlants = json.plants || [];
  } catch {
    allPlants = [
      {
        id: 1,
        name: "Mango Tree",
        image: "https://i.ibb.co.com/cSQdg7tf/mango-min.jpg",
        description:
          "A fast-growing tropical tree that produces delicious, juicy mangoes.",
        category: "Fruit Tree",
        price: 500,
      },
      {
        id: 2,
        name: "Guava Tree",
        image: "https://i.ibb.co.com/WNbbx3rn/guava-min.jpg",
        description: "A hardy fruit tree that grows in various climates.",
        category: "Fruit Tree",
        price: 350,
      },
    ];
  }
  renderCards(allPlants);
  showSpinner(false);
}

// Load plants by category
async function loadPlantsByCategory(id) {
  showSpinner(true);
  try {
    const res = await fetch(`${API}/category/${id}`);
    const json = await res.json();
    renderCards(json.plants || []);
  } catch {
    const catName =
      (categories.find((c) => String(c.id) === String(id)) || {})
        .category_name || "";
    renderCards(allPlants.filter((p) => p.category === catName));
  } finally {
    showSpinner(false);
  }
}

// Render categories
function renderCategories() {
  categoryList.innerHTML = "";
  const base =
    "cat-btn px-3 py-2 rounded-md hover:bg-emerald-100 text-left transition";

  const allBtn = document.createElement("button");
  allBtn.className = base + " bg-emerald-700 text-white";
  allBtn.textContent = "All Trees";
  allBtn.onclick = () => {
    setActive(allBtn);
    renderCards(allPlants);
  };
  categoryList.appendChild(allBtn);

  categories.forEach((c) => {
    const b = document.createElement("button");
    b.className = base;
    b.textContent = c.category_name;
    b.onclick = () => {
      setActive(b);
      loadPlantsByCategory(c.id);
    };
    categoryList.appendChild(b);
  });
}

// Render cards
function renderCards(list) {
  cardGrid.innerHTML = "";
  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  list.forEach((p) => {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-xl shadow-md hover:shadow-lg transition p-3";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}"
           class="w-full h-40 object-cover rounded-lg cursor-pointer">
      <h4 class="font-semibold mt-3 cursor-pointer">${p.name}</h4>
      <p class="text-sm text-gray-600 line-clamp-2">${p.description || ""}</p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">${p.category}</span>
        <span class="font-semibold">${money(p.price)}</span>
      </div>
      <button class="mt-3 w-full bg-emerald-700 text-white py-2 rounded-full text-sm">Add to Cart</button>
    `;

    // Modal
    const open = () => openModal(p);
    card.querySelector("img").addEventListener("click", open);
    card.querySelector("h4").addEventListener("click", open);

    // Cart
    card.querySelector("button").addEventListener("click", () => addToCart(p));

    cardGrid.appendChild(card);
  });
}

// Cart
function addToCart(p) {
  const found = cart.find((i) => i.id === p.id);
  if (found) found.qty += 1;
  else cart.push({ ...p, qty: 1 });
  renderCart();
}

function removeFromCart(i) {
  cart.splice(i, 1);
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-2";
    li.innerHTML = `
      <span>${item.name} ×${item.qty}</span>
      <div class="flex items-center gap-2">
        <span>${money(item.price * item.qty)}</span>
        <button class="text-red-500" title="Remove">✖</button>
      </div>
    `;
    li.querySelector("button").onclick = () => removeFromCart(i);
    cartItemsEl.appendChild(li);
  });

  cartTotalEl.textContent = money(total);
}

// Modal
function openModal(p) {
  modalImg.src = p.image;
  modalName.textContent = p.name;
  modalDesc.textContent = p.description;
  modalCat.textContent = p.category;
  modalPrice.textContent = money(p.price);
  modal.showModal();
}
modalClose.addEventListener("click", () => modal.close());

// Init
loadCategories();
loadAllPlants();
renderCart();






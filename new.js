//API Endpoint
const API = "https://openapi.programming-hero.com/api";

//DOM Elements
const categoryList = document.getElementById("category-list");
const cardGrid     = document.getElementById("card-grid");
const emptyState   = document.getElementById("empty-state");
const spinner      = document.getElementById("spinner");

const cartItemsEl  = document.getElementById("cart-items");
const cartTotalEl  = document.getElementById("cart-total");
 

//Modal Elements
const modal      = document.getElementById("tree-modal");
const modalImg   = document.getElementById("modal-img");
const modalName  = document.getElementById("modal-name");
const modalDesc  = document.getElementById("modal-desc");
const modalCat   = document.getElementById("modal-cat");
const modalPrice = document.getElementById("modal-price");
const modalClose = document.getElementById("modal-close");

// State
let categories   = [];
let categoryById = new Map();
let allPlants    = [];
let cart         = [];

//Utility Functions


// Format price → ৳
const taka = new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });
const money = n => taka.format(Number(n || 0)).replace("BDT", "৳").trim();

// Spinner & empty state
const spin = on => {
  spinner.classList.toggle("hidden", !on);
  cardGrid.classList.toggle("hidden", on);
  if (on) {
    emptyState.classList.remove("hidden");
    emptyState.textContent = "Loading trees... please wait....!!";
  } else {
    emptyState.classList.add("hidden");
  }
};

//active category
const setActive = btn => {
  document.querySelectorAll(".cat-btn").forEach(el => {
    el.classList.remove("bg-emerald-700","text-white","ring-2","ring-emerald-300");
  });
  btn.classList.add("bg-emerald-700","text-white","ring-2","ring-emerald-300");
};

// Toast (basic alert for now)
const toast = msg => alert(msg);

// Fetch JSON with error handling
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network ${res.status}`);
  return res.json();
}

// Fetch Categories
async function fetchCategories() {
  try {
    const { categories: cats = [] } = await fetchJSON(`${API}/categories`);
    categories = cats;
  } catch (err) {
    console.warn("⚠️ Category fallback", err);
    categories = [
      { id: 1, category_name: "Fruit Tree" },
      { id: 2, category_name: "Flowering Tree" },
      { id: 3, category_name: "Shade Tree" },
    ];
  }
  categoryById = new Map(categories.map(c => [String(c.id), c.category_name]));
  renderCategories();
}

//Fetch All Plants
async function fetchAllPlants() {
  try {
    const { plants = [] } = await fetchJSON(`${API}/plants`);
    allPlants = plants;
  } catch (err) {
    console.warn("⚠️ Plants fallback", err);
    allPlants = [
      { id: 1, name: "Mango Tree", image: "https://i.ibb.co/cSQdg7tf/mango-min.jpg", description: "Fast-growing, sweet summer fruit and lovely shade.", category: "Fruit Tree", price: 500 },
      { id: 2, name: "Guava Tree", image: "https://i.ibb.co/WNbbx3rn/guava-min.jpg", description: "Hardy and generous with vitamin-rich fruit.", category: "Fruit Tree", price: 350 },
    ];
  }
  renderCards(allPlants);
}

// Fetch Plants
async function fetchPlantsByCategory(id) {
  spin(true);
  try {
    const { plants = [], data } = await fetchJSON(`${API}/category/${id}`);
    renderCards(plants.length ? plants : (data || []));
  } catch (err) {
    const name = categoryById.get(String(id)) || "";
    renderCards(allPlants.filter(p => p.category === name));
  } finally {
    spin(false);
  }
}

// Render Categories
function renderCategories() {
  categoryList.innerHTML = "";

  const baseClass = "cat-btn px-3 py-2 rounded-md hover:bg-emerald-100 text-left transition";

  // All Trees button
  const allBtn = document.createElement("button");
  allBtn.className = `${baseClass} bg-emerald-700 text-white ring-2 ring-emerald-300`;
  allBtn.textContent = "All Trees";
  allBtn.onclick = () => { setActive(allBtn); renderCards(allPlants); };
  categoryList.appendChild(allBtn);

  // Dynamic categories
  categories.forEach(c => {
    const btn = document.createElement("button");
    btn.className = baseClass;
    btn.textContent = c.category_name;
    btn.onclick = () => { setActive(btn); fetchPlantsByCategory(c.id); };
    categoryList.appendChild(btn);
  });
}

// Render Cards
function renderCards(list) {
  cardGrid.innerHTML = "";

  if (!list.length) {
    emptyState.classList.remove("hidden");
    emptyState.textContent = "No trees found in this category.";
    return;
  }
  emptyState.classList.add("hidden");

  list.forEach(prod => {
    const card = document.createElement("article");
    card.className = `
      bg-white rounded-2xl shadow ring-1 ring-black/5 p-3
      hover:shadow-lg hover:ring-emerald-200 transition cursor-pointer
    `;
    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" class="w-full h-44 sm:h-48 object-cover rounded-xl">
      <h4 class="font-semibold mt-3">${prod.name}</h4>
      <p class="text-sm text-gray-600 line-clamp-2">${prod.description || ""}</p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">${prod.category}</span>
        <span class="font-semibold">${money(prod.price)}</span>
      </div>
      <button class="mt-3 w-full bg-emerald-700 text-white py-2 rounded-full text-sm add-btn">Add to Cart</button>
    `;

    // Open modal (clicking button)
    card.addEventListener("click", e => {
      if (e.target.closest("button")) return; 
      openModal(prod);
    });

    // Add to cart
    const addBtn = card.querySelector(".add-btn");
    addBtn.addEventListener("click", () => {
      addToCart(prod);
      const old = addBtn.textContent;
      addBtn.textContent = " Add to cart!";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = old;
        addBtn.disabled = false;
      }, 1000);
    });

    cardGrid.appendChild(card);
  });
}

// Cart Functions
function addToCart(prod) {
  const hit = cart.find(i => i.id === prod.id);
  if (hit) hit.qty += 1;
  else cart.push({ id: prod.id, name: prod.name, price: Number(prod.price || 0), qty: 1 });
  renderCart();
}

function removeFromCart(i) {
  cart.splice(i, 1);
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  if (!cart.length) {
    cartItemsEl.innerHTML = `<li class="text-gray-500 italic">🛒 Your cart is empty</li>`;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-2";
    li.innerHTML = `
      <span class="truncate">${item.name} ×${item.qty}</span>
      <div class="flex items-center gap-2">
        <span class="font-medium">${money(item.price * item.qty)}</span>
        <button class="text-red-500 hover:text-red-600" title="Remove">✖</button>
      </div>
    `;
    li.querySelector("button").onclick = () => removeFromCart(i);
    cartItemsEl.appendChild(li);
  });

  cartTotalEl.textContent = money(total);
}




// Modal
function openModal(prod) {
   modalImg.src = prod.image || "";
  modalName.textContent = prod.name || "Tree";
   modalDesc.textContent = prod.description || "No description available.";
  modalCat.textContent = prod.category || "—";
   modalPrice.textContent = money(prod.price || 0);
  modal.showModal();
}
modalClose.addEventListener("click", () => modal.close());

// Boot
(async function boot() {
  try {
    spin(true); // start with spinner
    await Promise.all([fetchCategories(), fetchAllPlants()]);
    renderCart();
  } catch (err) {
    console.error("Boot error:", err);
    emptyState.classList.remove("hidden");
    emptyState.textContent = "⚠️ Couldn’t load trees. Please try again later.";
  } finally {
    spin(false);
  }
})();

// ====== Config & DOM ======
const API = "https://openapi.programming-hero.com/api";

const categoryList  = document.getElementById("category-list");
const cardGrid      = document.getElementById("card-grid");
const emptyState    = document.getElementById("empty-state");
const spinner       = document.getElementById("spinner");

const cartItemsEl   = document.getElementById("cart-items");
const cartTotalEl   = document.getElementById("cart-total");

const detailsModal  = document.getElementById("details-modal");
const modalClose    = document.getElementById("modal-close");
const modalImg      = document.getElementById("modal-img");
const modalName     = document.getElementById("modal-name");
const modalCategory = document.getElementById("modal-category");
const modalDesc     = document.getElementById("modal-desc");
const modalPrice    = document.getElementById("modal-price");

// ====== Helpers (style similar to your sample) ======
const createElements = (arr) =>
  arr.map((el) => `<span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">${el}</span>`).join(" ");

const manageSpinner = (status) => {
  if (status) {
    spinner.classList.remove("hidden");
    cardGrid.classList.add("hidden");
    emptyState.classList.add("hidden");
  } else {
    spinner.classList.add("hidden");
    cardGrid.classList.remove("hidden");
  }
};

const removeActive = () => {
  document.querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("bg-emerald-700", "text-white"));
};

const formatPrice = (n) => `৳${Number(n || 0)}`;

// ====== Cart ======
let cart = [];
function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    total += Number(item.price || 0);
    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-2";
    li.innerHTML = `
      <span>${item.name} <span class="text-gray-500">×1</span></span>
      <span class="flex items-center gap-3">
        <span class="font-medium">${formatPrice(item.price)}</span>
        <button data-index="${idx}" class="text-red-600 text-xs">❌</button>
      </span>
    `;
    li.querySelector("button").addEventListener("click", (e) => {
      const i = Number(e.currentTarget.dataset.index);
      cart.splice(i, 1);
      renderCart();
    });
    cartItemsEl.appendChild(li);
  });

  cartTotalEl.textContent = formatPrice(total);
}

// ====== API Loaders ======
const loadCategories = () => {
  fetch(`${API}/categories`)
    .then((res) => res.json())
    .then((json) => displayCategories(json.categories || []));
};

const loadAllPlants = () => {
  manageSpinner(true);
  fetch(`${API}/plants`)
    .then((res) => res.json())
    .then((json) => displayPlants(json.plants || []))
    .finally(() => manageSpinner(false));
};

const loadPlantsByCategory = (id) => {
  manageSpinner(true);
  fetch(`${API}/category/${id}`)
    .then((res) => res.json())
    .then((json) => displayPlants(json.data || []))
    .finally(() => manageSpinner(false));
};

const loadPlantDetail = (id) => {
  fetch(`${API}/plant/${id}`)
    .then((res) => res.json())
    .then((details) => displayPlantDetail(details.plant || details.data || {}));
};

// ====== UI Renderers ======
const displayCategories = (cats) => {
  categoryList.innerHTML = "";

  // "All Trees" button
  const allBtn = document.createElement("button");
  allBtn.className =
    "cat-btn px-3 py-1 rounded text-left hover:bg-emerald-100 bg-emerald-700 text-white";
  allBtn.textContent = "All Trees";
  allBtn.onclick = () => {
    removeActive();
    allBtn.classList.add("bg-emerald-700", "text-white");
    loadAllPlants();
  };
  categoryList.appendChild(allBtn);

  // API categories
  cats.forEach((c) => {
    const btn = document.createElement("button");
    btn.id = `cat-btn-${c.id}`;
    btn.className = "cat-btn px-3 py-1 rounded text-left hover:bg-emerald-100";
    btn.textContent = c.category;
    btn.onclick = () => {
      removeActive();
      btn.classList.add("bg-emerald-700", "text-white");
      loadPlantsByCategory(c.id);
    };
    categoryList.appendChild(btn);
  });
};

const displayPlants = (plants) => {
  cardGrid.innerHTML = "";
  if (!plants.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  plants.forEach((p) => {
    // Normalize
    const id    = p.id || p.plant_id || p.plantId;
    const name  = p.name || p.title || "Tree";
    const img   = p.image || p.img || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop";
    const desc  = p.short_description || p.description || "";
    const cat   = p.category || p.category_name || "General";
    const price = Number(p.price ?? 0);

    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow overflow-hidden flex flex-col";
    card.innerHTML = `
      <div class="w-full h-40 bg-gray-100">
        <img src="${img}" alt="${name}" class="w-full h-40 object-cover">
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <a href="#" class="font-semibold hover:underline tree-name text-gray-900" data-id="${id}">${name}</a>
        <p class="mt-1 text-sm text-gray-600 line-clamp-2">${desc}</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="inline-flex px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">${cat}</span>
          <span class="font-semibold">${formatPrice(price)}</span>
        </div>
        <button class="mt-4 rounded-full bg-emerald-700 text-white py-2 text-sm add-btn"
                data-id="${id}" data-name="${name}" data-price="${price}">
          Add to Cart
        </button>
      </div>
    `;

    // Events
    card.querySelector(".tree-name").addEventListener("click", (e) => {
      e.preventDefault();
      loadPlantDetail(id);
    });

    card.querySelector(".add-btn").addEventListener("click", (e) => {
      const { id, name, price } = e.currentTarget.dataset;
      cart.push({ id, name, price: Number(price) });
      renderCart();
    });

    cardGrid.appendChild(card);
  });
};

const displayPlantDetail = (item) => {
  modalImg.src = item.image || item.img || "";
  modalName.textContent = item.name || item.title || "Tree";
  modalCategory.textContent = item.category ? `Category: ${item.category}` : "";
  modalDesc.innerHTML = item.description || item.long_description || "—";
  modalPrice.textContent = item.price != null ? formatPrice(item.price) : "";
  detailsModal.showModal();
};

// Close modal
modalClose.addEventListener("click", () => detailsModal.close());

// Init
loadCategories();
loadAllPlants();
renderCart();

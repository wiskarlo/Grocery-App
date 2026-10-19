// State Management Data Arrays //
let plannerItems = [];
let checkoutItems = [];

// Initialize UI on page load //
document.addEventListener('DOMContentLoaded', () => {
  ShowGroceryItems();
  ShowCheckoutItems();
});

// Navigation Panel //
function switchTab(tabId, element) { // Switch Between Tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');
  if (element) element.classList.add('active');
}

// Planner Section //
function handleAddPlannedItem(event) { // Action Function for "Add Item"
  event.preventDefault();
  
  const form = event.target;
  const inputs = form.querySelectorAll('input');
  
  const name = inputs[0].value.trim();
  const quantity = parseInt(inputs[1].value, 10);

  if (!name || isNaN(quantity) || quantity <= 0) {
    alert('Please enter a valid item name and quantity.');
    return;
  }

  AddItem(name, quantity);
  form.reset();
}

function AddItem(name, quantity) { // Adding Item/s to Planner
  const existingItem = plannerItems.find(
    item => item.name.toLowerCase() === name.toLowerCase()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const newItem = {
      id: Date.now(),
      name: name,
      quantity: quantity
    };
    plannerItems.push(newItem);
  }

  showNotification(`Successfully added ${name} to Planner.`);
  ShowGroceryItems();
}

function ShowGroceryItems() { // Show Item/s in Planner
  const tbody = document.getElementById('grocery-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (plannerItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No items added yet.</td></tr>`;
    ShowTotalItems();
    return;
  }

  plannerItems.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>
        <button class="delete-btn" onclick="BuyItem(${item.id})">Buy Item</button> |
        <button class="delete-btn" onclick="confirmDeleteItem('planner', ${item.id})">Remove</button>
      </td>`;
    tbody.appendChild(row);
  });

  ShowTotalItems();
}

function DeleteItem(source, id) { // Deleting Item/s from Planner & Checkout
  if (source === 'planner') {
    const item = plannerItems.find(i => i.id === id);
    plannerItems = plannerItems.filter(i => i.id !== id);
    ShowGroceryItems();

    if (item) showNotification(`Successfully deleted ${item.name}.`);
  } else if (source === 'checkout') {
    const item = checkoutItems.find(i => i.id === id);
    checkoutItems = checkoutItems.filter(i => i.id !== id);
    ShowCheckoutItems();

    if (item) showNotification(`Successfully deleted ${item.name}.`);   
  }
}

function ShowTotalItems() { // Show Total Items in Planner
  const totalCountSpan = document.getElementById('totalItems');
  const totalCount = plannerItems.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalCountSpan) {
    totalCountSpan.innerHTML = `<b>${totalCount}</b>`;
  }
} 

function BuyItem(id) {
  const itemToBuy = plannerItems.find(item => item.id === id);
  if (!itemToBuy) return;

  const itemIdInput = document.getElementById('modal-item-id');
  const itemNameLabel = document.getElementById('modal-item-name');

  if (itemIdInput) itemIdInput.value = itemToBuy.id;
  if (itemNameLabel) itemNameLabel.textContent = `Enter price for "${itemToBuy.name}"`;

  openPopup();
}

function ConfirmBuyItem(id, price) {
  const itemIndex = plannerItems.findIndex(item => item.id === id);

  if (itemIndex === -1) return;

  const itemToBuy = plannerItems[itemIndex];

  const existingCheckoutItem = checkoutItems.find(
    item => item.name.toLowerCase() === itemToBuy.name.toLowerCase()
  );

  if (existingCheckoutItem) {
    existingCheckoutItem.quantity += itemToBuy.quantity;
    existingCheckoutItem.price = price; 
  } else {
    checkoutItems.push({ ...itemToBuy, price: price });
  }

  plannerItems.splice(itemIndex, 1);

  showNotification(`Successfully moved ${itemToBuy.name} to Checkout.`);
  ShowGroceryItems();
  ShowCheckoutItems();
}

// Show Item/s in Checkout Table
function ShowCheckoutItems() {
  const tbody = document.getElementById('checkout-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (checkoutItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No bought items yet.</td></tr>`;
    ShowTotalPrice();
    return;
  }

  checkoutItems.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₱ ${item.price.toFixed(2)}</td>
      <td>
        <button class="delete-checkout-btn" onclick="confirmDeleteItem('checkout', ${item.id})">Remove</button>
      </td>`;
    tbody.appendChild(row);
  });

  ShowTotalPrice();
}

function CalculatePriceAndQuantity() {
  const summary = checkoutItems.reduce((acc, item) => {
    acc.totalQuantity += item.quantity;
    acc.totalPrice += item.price * item.quantity;
    return acc;
  }, { totalQuantity: 0, totalPrice: 0 });

  return summary;
} 

function CalculateTotalPrice() {
  return checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function ShowTotalPrice() {
  const totalPriceSpan = document.getElementById('totalPrice');
  const total = CalculateTotalPrice();
  
  if (totalPriceSpan) {
    totalPriceSpan.innerHTML = `<b> ₱ ${total.toFixed(2)} </b>`;
  }
}

// Modal Section
function openPopup() {
  const modal = document.getElementById('popupModal');
  if (modal) modal.showModal();
}

function closePopup() {
  const modal = document.getElementById('popupModal');
  if (modal) {
    modal.close();
    const priceInput = document.getElementById('modal-price-input');
    if (priceInput) priceInput.value = '';
  }
}

function handleModalSubmit(event) {
  event.preventDefault();

  const idInput = document.getElementById('modal-item-id');
  const priceInput = document.getElementById('modal-price-input');

  const id = parseInt(idInput.value, 10);
  const price = parseFloat(priceInput.value);

  if (isNaN(price) || price < 0) {
    alert('Please enter a valid price.');
    return;
  }

  ConfirmBuyItem(id, price);
  closePopup();
}

// Open Delete Confirmation Modal
function confirmDeleteItem(source, id) {
  const sourceInput = document.getElementById('delete-item-source');
  const idInput = document.getElementById('delete-item-id');
  const modalText = document.getElementById('delete-modal-text');

  if (sourceInput) sourceInput.value = source;
  if (idInput) idInput.value = id;

  let item = null;
  if (source === 'planner') item = plannerItems.find(i => i.id === id);
  if (source === 'checkout') item = checkoutItems.find(i => i.id === id);

  if (modalText && item) {
    modalText.textContent = `Are you sure you want to remove "${item.name}"?`;
  }

  openDeletePopup();
}

function openDeletePopup() {
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) deleteModal.showModal();
}

function closeDeletePopup() {
  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.close();
    const deleteForm = document.getElementById('delete-modal-form');
    if (deleteForm) deleteForm.reset();
  }
}

function handleDeleteModalSubmit(event) {
  event.preventDefault();

  const source = document.getElementById('delete-item-source').value;
  const id = parseInt(document.getElementById('delete-item-id').value, 10);

  if (source && !isNaN(id)) {
    DeleteItem(source, id);
  }

  closeDeletePopup();
}

// Notification Section
function showNotification(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  toast.innerHTML = `<i class="fa-solid fa-cart-shopping toast-icon"></i> <span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
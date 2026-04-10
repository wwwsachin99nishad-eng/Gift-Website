// Global cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadReviews();
});

// Add to cart
function addToCartGlobal(id, name, price, image, qty) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ id, name, price, image, qty });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart! 🛒`);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

// Open cart
function openCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty 😢');
        return;
    }
    
    let cartHTML = `
        <div style="max-width: 600px; width: 100%;">
            <h2 style="margin-bottom: 20px; color: var(--text);">Shopping Cart 🛒</h2>
            <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
    `;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        cartHTML += `
            <div style="display: flex; gap: 15px; padding: 15px; background: var(--bg-light); border-radius: 8px; margin-bottom: 12px; align-items: center;">
                <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 5px;">${item.name}</strong>
                    <span style="color: var(--primary); font-weight: 700;">Rs. ${item.price}</span>
                    <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                        <button onclick="updateCartQty('${item.id}', -1)" style="width: 24px; height: 24px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer;">−</button>
                        <span style="min-width: 30px; text-align: center;">${item.qty}</span>
                        <button onclick="updateCartQty('${item.id}', 1)" style="width: 24px; height: 24px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer;">+</button>
                        <button onclick="removeFromCart('${item.id}')" style="margin-left: auto; background: none; border: none; color: var(--danger); cursor: pointer; font-weight: 700;">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartHTML += `
            </div>
            <div style="border-top: 2px solid var(--border); padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 1.1rem;">
                    <strong>Total:</strong>
                    <strong style="color: var(--primary);">Rs. ${total}</strong>
                </div>
                <button class="btn-buy" onclick="openCheckout()" style="margin-bottom: 10px;">Proceed to Checkout ➡️</button>
                <button class="btn-cart" onclick="closeCart()">Continue Shopping</button>
            </div>
        </div>
    `;
    
    showModal(cartHTML);
}

// Update cart quantity
function updateCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            openCart();
        }
    }
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (cart.length > 0) {
        openCart();
    } else {
        closeCart();
        showNotification('Item removed from cart');
    }
}

// Open checkout
function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        closeCart();
        document.getElementById('checkoutStep1').style.display = 'block';
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'none';
        // Initialize payment method
        selectPaymentMethod('UPI');
        checkoutModal.classList.add('active');
    }
}

// Start checkout processing
function startCheckoutProcessing() {
    const name = document.getElementById('custName');
    const phone = document.getElementById('custPhone');
    const house = document.getElementById('custHouse');
    const email = document.getElementById('custEmail');
    
    if (!name.value || !phone.value || !house.value) {
        showNotification('Please fill all required fields ⚠️');
        return;
    }
    
    document.getElementById('checkoutStep1').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep2').style.display = 'block';
        updatePaymentDisplay();
    }, 2000);
}

// Update payment display
function updatePaymentDisplay() {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById('methodAmountStr').textContent = `Rs. ${total}`;
    document.getElementById('btnPayText').textContent = `Pay Rs. ${total}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('deliveryDateStr').textContent = dayName;
}

// Select payment method
function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('opt' + method).classList.add('selected');
    
    document.querySelectorAll('.radio-circle').forEach(radio => {
        radio.style.backgroundColor = 'transparent';
        radio.style.borderColor = '#e0e0e0';
    });
    
    const selectedRadio = document.getElementById('radio' + method);
    if (selectedRadio) {
        selectedRadio.style.backgroundColor = '#e8719b';
        selectedRadio.style.borderColor = '#e8719b';
    }
    
    if (method === 'COD') {
        document.getElementById('codTrustNote').style.display = 'block';
    } else {
        document.getElementById('codTrustNote').style.display = 'none';
    }
}

// Proceed to final
function proceedToFinal() {
    const method = document.querySelector('.payment-option.selected');
    if (!method) {
        showNotification('Please select a payment method ⚠️');
        return;
    }
    
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'block';
        
        const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();
        document.getElementById('randomOrderID').textContent = randomID;
        
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }, 2000);
}

// Go back to methods
function goBackToMethods() {
    document.getElementById('checkoutStep2').style.display = 'block';
    selectPaymentMethod('UPI');
}

// Close checkout
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'none';
    document.getElementById('checkoutStep_Success').style.display = 'none';
    document.getElementById('custName').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custHouse').value = '';
    document.getElementById('custStreet').value = '';
    document.getElementById('custLandmark').value = '';
    document.getElementById('custPincode').value = '';
    document.getElementById('custCity').value = '';
}

// Close cart
function closeCart() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
    }
}

// Show modal
function showModal(content) {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        const box = modal.querySelector('.checkout-box');
        box.innerHTML = `<button class="modal-close checkout-close" onclick="closeCart()">✕</button>${content}`;
        // Hide all checkout steps to show cart content
        document.getElementById('checkoutStep1').style.display = 'none';
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'none';
        modal.classList.add('active');
    }
}

// Create cart modal
function createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.id = 'cartModalOverlay';
    modal.innerHTML = `<div class="checkout-box"></div>`;
    document.body.appendChild(modal);
    return modal;
}

// Account click
function handleAccountClick() {
    alert('Account features coming soon! 👤');
}

// Detect location
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            showNotification('Location detected! 📍');
            document.getElementById('custCity').value = 'Current Location';
        });
    } else {
        showNotification('Geolocation not supported');
    }
}

// Load reviews
function loadReviews() {
    const reviews = [
        { name: 'Priya Singh', rating: 5, text: 'Amazing products! The bangles are stunning and arrived on time. 😍' },
        { name: 'Rahul Patel', rating: 5, text: 'Great service and fast delivery. Will definitely order again! 🚀' },
        { name: 'Neha Sharma', rating: 5, text: 'The bunny plushie is adorable. My daughter loves it! 🐰' },
        { name: 'Arjun Kumar', rating: 4, text: 'Good quality products. Packaging could be better but overall satisfied.' },
        { name: 'Anjali Desai', rating: 5, text: 'The jhumkas are beautiful and authentic. Highly recommended! ✨' },
        { name: 'Vikram Singh', rating: 5, text: 'Best gift delivery service in town. Never disappointed!' }
    ];
    
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-name">👤 ${review.name}</div>
                <div class="review-stars">${'⭐'.repeat(review.rating)}</div>
                <div class="review-text">"${review.text}"</div>
            </div>
        `).join('');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

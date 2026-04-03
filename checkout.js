// CLIENT-SIDE ONLY Razorpay Payment Integration
// No backend server needed! 🎉

let selectedPaymentMethod = 'online';

document.addEventListener('DOMContentLoaded', () => {
    displayCheckoutCart();
    calculateTotals();
    const buttonText = document.getElementById('buttonText');
    const totalAmount = parseFloat(sessionStorage.getItem('orderTotal')) || 0;
    buttonText.innerHTML = `Pay ₹<span id="payAmount">${totalAmount.toFixed(2)}</span> with Razorpay`;
});

function selectPaymentMethod(method) {
    document.querySelector(`input[value="${method}"]`).checked = true;
    document.getElementById('onlineOption').classList.toggle('selected', method === 'online');
    document.getElementById('codOption').classList.toggle('selected', method === 'cod');
    updatePaymentMethod(method);
}

function updatePaymentMethod(method) {
    selectedPaymentMethod = method;
    const paymentNote = document.getElementById('paymentNote');
    const buttonText = document.getElementById('buttonText');
    const codBreakdown = document.getElementById('codBreakdown');
    const totalAmount = parseFloat(sessionStorage.getItem('orderTotal')) || 0;

    calculateTotals();

    if (method === 'cod') {
        paymentNote.style.display = 'block';
        codBreakdown.style.display = 'block';
        buttonText.innerHTML = 'Pay ₹59 Shipping Charges';
    } else {
        paymentNote.style.display = 'none';
        codBreakdown.style.display = 'none';
        buttonText.innerHTML = `Pay ₹<span id="payAmount">${totalAmount.toFixed(2)}</span> with Razorpay`;
    }
}

function displayCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem('plushie_cart')) || [];
    const cartItemsEl = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x ${item.qty}</span>
            <span>₹${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');
}

function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('plushie_cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    let shipping = 0;
    if (selectedPaymentMethod === 'cod') {
        shipping = 59;
    } else {
        shipping = 0;
    }
    
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = '₹' + shipping.toFixed(2);
    
    const totalAmountEl = document.getElementById('totalAmount');
    if (selectedPaymentMethod === 'cod') {
        totalAmountEl.textContent = '₹59';
    } else {
        totalAmountEl.textContent = '₹' + total.toFixed(2);
    }
    
    if (selectedPaymentMethod === 'cod') {
        const remaining = total - 59;
        if (document.getElementById('codFullTotal')) {
            document.getElementById('codFullTotal').textContent = '₹' + total.toFixed(2);
            document.getElementById('codRemaining').textContent = '₹' + remaining.toFixed(2);
            document.getElementById('codDueOnDelivery').textContent = '₹' + remaining.toFixed(2);
        }
    }
    
    sessionStorage.setItem('orderTotal', total);
}

// MAIN PAYMENT FUNCTION - Client-side only!
async function initiatePayment() {
    const cart = JSON.parse(localStorage.getItem('plushie_cart')) || [];
    
    // Validate form
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    
    if (!customerName || !customerEmail || !customerPhone) {
        showError('Please fill in all required fields');
        return;
    }

    if (cart.length === 0) {
        showError('Your cart is empty');
        return;
    }

    const totalAmount = parseFloat(sessionStorage.getItem('orderTotal')) || 0;
    
    if (totalAmount <= 0) {
        showError('Invalid order amount');
        return;
    }

    // Handle Cash on Delivery
    if (selectedPaymentMethod === 'cod') {
        handleCODPayment(totalAmount, customerName, customerEmail, customerPhone, cart);
        return;
    }

    // Handle Online Payment - CLIENT-SIDE ONLY
    openRazorpayCheckout(totalAmount, customerName, customerEmail, customerPhone, cart, 'online');
}

// Open Razorpay Checkout - No Backend Required!
function openRazorpayCheckout(amount, name, email, phone, cart, paymentType) {
    // Generate a receipt ID (just for reference, not validated server-side)
    const receiptId = 'receipt_' + Date.now();
    
    const options = {
        key: RAZORPAY_KEY_ID, // From config.js
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Plushieland',
        description: paymentType === 'cod' 
            ? 'Cash on Delivery - Shipping Advance' 
            : `Order - ${cart.length} item(s)`,
        image: 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300',
        
        // NO order_id required for client-side only!
        
        handler: function(response) {
            handlePaymentSuccess(response, amount, name, email, phone, cart, paymentType);
        },
        
        prefill: {
            name: name,
            email: email,
            contact: phone
        },
        
        notes: {
            address: document.getElementById('customerAddress')?.value || '',
            city: document.getElementById('customerCity')?.value || '',
            postal: document.getElementById('customerPostal')?.value || '',
            paymentType: paymentType
        },
        
        theme: {
            color: '#d946ef'
        },
        
        // Prevent closing without payment
        modal: {
            ondismiss: function() {
                if (confirm('Are you sure you want to cancel this payment?')) {
                    return true;
                }
                return false;
            }
        }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
        handlePaymentError(response.error);
    });
    
    rzp.open();
}

// Handle successful payment
function handlePaymentSuccess(response, amount, name, email, phone, cart, paymentType) {
    const orderId = 'ORD_' + Date.now(); // Generate local order ID
    
    showSuccess(`✓ Payment Successful!
    
Order ID: ${orderId}
Payment ID: ${response.razorpay_payment_id}
Amount: ₹${amount.toFixed(2)}`);
    
    // Save order details to localStorage
    const orderDetails = {
        orderId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id || 'N/A',
        amount: amount,
        paymentMethod: paymentType === 'cod' ? 'COD' : 'Online',
        shippingAdvance: paymentType === 'cod' ? 59 : 0,
        timestamp: new Date().toISOString(),
        customer: {
            name: name,
            email: email,
            phone: phone,
            address: document.getElementById('customerAddress')?.value || '',
            city: document.getElementById('customerCity')?.value || '',
            postal: document.getElementById('customerPostal')?.value || ''
        },
        cartItems: cart
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
    localStorage.removeItem('plushie_cart'); // Clear cart after successful payment
    
    // Redirect to success page after 2 seconds
    setTimeout(() => {
        const method = paymentType === 'cod' ? '&method=COD' : '';
        window.location.href = 'order-success.html?orderId=' + orderId + method;
    }, 2000);
}

// Handle payment error
function handlePaymentError(error) {
    console.error('Payment error:', error);
    if (error.description) {
        showError('Payment failed: ' + error.description);
    } else {
        showError('Payment failed. Please try again.');
    }
}

// Handle Cash on Delivery payment
function handleCODPayment(totalAmount, name, email, phone, cart) {
    const shippingCharge = 59;
    showSuccess('💳 Processing ₹59 Shipping Advance for Cash on Delivery...');
    
    // Open Razorpay for shipping advance payment
    openRazorpayCheckout(shippingCharge, name, email, phone, cart, 'cod');
}

// UI Helper Functions
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.innerHTML = message.replace(/\n/g, '<br>');
    successEl.style.display = 'block';
}

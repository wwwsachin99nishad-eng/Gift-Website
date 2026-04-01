// Load cart from localStorage on page load
let selectedPaymentMethod = 'online'; // Default to online payment

document.addEventListener('DOMContentLoaded', () => {
    displayCheckoutCart();
    calculateTotals();
});

function selectPaymentMethod(method) {
    // Update radio button
    document.querySelector(`input[value="${method}"]`).checked = true;
    
    // Update visual selection
    document.getElementById('onlineOption').classList.toggle('selected', method === 'online');
    document.getElementById('codOption').classList.toggle('selected', method === 'cod');
    
    // Update payment details
    updatePaymentMethod(method);
}

function updatePaymentMethod(method) {
    selectedPaymentMethod = method;
    console.log('updatePaymentMethod called with:', method);
    
    const paymentNote = document.getElementById('paymentNote');
    const buttonText = document.getElementById('buttonText');
    const codBreakdown = document.getElementById('codBreakdown');
    
    // Recalculate totals with new payment method - this will update all displays
    calculateTotals();
    
    // Get the total from sessionStorage after calculateTotals updates it
    const totalAmount = parseFloat(sessionStorage.getItem('orderTotal')) || 0;
    
    // Update visibility and button text
    if (method === 'cod') {
        paymentNote.style.display = 'block';
        codBreakdown.style.display = 'block'; // Show breakdown
        buttonText.innerHTML = 'Pay ₹59 Shipping Charges';
        console.log('COD payment method selected');
    } else {
        // Online Payment
        paymentNote.style.display = 'none';
        codBreakdown.style.display = 'none'; // Hide breakdown
        buttonText.innerHTML = `Pay ₹<span id="payAmount">${totalAmount.toFixed(2)}</span> with Razorpay`;
        console.log('Online payment method selected - Total: ₹' + totalAmount.toFixed(2));
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
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    console.log('calculateTotals - selectedPaymentMethod:', selectedPaymentMethod);
    
    // Shipping charges based on payment method
    let shipping = 0;
    if (selectedPaymentMethod === 'cod') {
        shipping = 59; // ₹59 for COD
    } else {
        shipping = subtotal > 500 ? 0 : 50; // ₹50 or free for online
    }
    
    // Total (without GST)
    const total = subtotal + shipping;
    
    console.log('Calculated - Subtotal:', subtotal, 'Shipping:', shipping, 'Total:', total);
    
    // Update UI - Order line items
    document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = '₹' + shipping.toFixed(2);
    
    // Update amount to pay NOW based on payment method
    const totalAmountEl = document.getElementById('totalAmount');
    if (selectedPaymentMethod === 'cod') {
        totalAmountEl.textContent = '₹59';
        console.log('COD Mode - Setting totalAmount display to ₹59');
    } else {
        totalAmountEl.textContent = '₹' + total.toFixed(2);
        console.log('Online Mode - Setting totalAmount display to ₹' + total.toFixed(2));
    }
    
    // Update COD breakdown if visible
    if (selectedPaymentMethod === 'cod') {
        const remaining = total - 59;
        document.getElementById('codFullTotal').textContent = '₹' + total.toFixed(2);
        document.getElementById('codRemaining').textContent = '₹' + remaining.toFixed(2);
        document.getElementById('codDueOnDelivery').textContent = '₹' + remaining.toFixed(2);
    }
    
    // Store total for payment
    sessionStorage.setItem('orderTotal', total);
}

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

    // Show payment method warning
    const warningMessage = `⚠️ IMPORTANT / महत्वपूर्ण ⚠️

English:
Please use UPI or QR Code method to avoid payment failures. Do not use any other payment method.

NOTE: ₹59 Shipping Charges are collected to prevent fake orders.

हिंदी:
भुगतान विफल होने से बचने के लिए कृपया केवल UPI या QR कोड विधि का उपयोग करें। किसी अन्य भुगतान विधि का उपयोग न करें।

नोट: ₹59 शिपिंग शुल्क नकली ऑर्डर को रोकने के लिए लिए जाते हैं।

Do you want to proceed?`;

    if (!confirm(warningMessage)) {
        return; // User cancelled
    }

    // Handle Cash on Delivery
    if (selectedPaymentMethod === 'cod') {
        handleCOD(totalAmount, customerName, customerEmail, customerPhone, cart);
        return;
    }

    // Handle Online Payment
    try {
        // Create order on backend
        const response = await fetch('http://localhost:3000/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: totalAmount * 100, // Convert to paise
                currency: 'INR',
                receipt: 'receipt_' + Date.now(),
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone
                }
            })
        });

        const orderData = await response.json();

        if (!response.ok) {
            showError(orderData.message || 'Failed to create order');
            return;
        }

        // Razorpay Options
        const options = {
            key: orderData.key_id, // Will be sent from backend
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            name: 'Plushieland',
            description: `${cart.length} item(s)`,
            image: 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300',
            order_id: orderData.order_id,
            handler: function(response) {
                handlePaymentSuccess(response, orderData);
            },
            prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone
            },
            notes: {
                address: document.getElementById('customerAddress').value,
                city: document.getElementById('customerCity').value,
                postal: document.getElementById('customerPostal').value
            },
            theme: {
                color: '#d946ef'
            },
            // Remove cancel button - only show OK button
            modal: {
                ondismiss: function() {
                    // Prevent closing the modal by showing a warning
                    alert('Please complete your payment. Click OK to continue.');
                    return false; // Keep modal open
                }
            },
            // Disable Escape key to close modal
            backdrop: true
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', handlePaymentError);
        rzp1.open();

    } catch (error) {
        console.error('Payment initiation error:', error);
        showError('An error occurred. Please try again.');
    }
}

function handlePaymentSuccess(response, orderData) {
    showSuccess(`Payment successful! Order ID: ${orderData.order_id}`);
    
    // Save order details
    const orderDetails = {
        orderId: orderData.order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
        amount: sessionStorage.getItem('orderTotal'),
        timestamp: new Date().toISOString(),
        customer: {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value
        }
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
    localStorage.removeItem('plushie_cart');
    
    // Redirect to success page after 2 seconds
    setTimeout(() => {
        window.location.href = 'order-success.html?orderId=' + orderData.order_id;
    }, 2000);
}

function handlePaymentError(error) {
    console.error('Payment error:', error);
    showError('Payment failed: ' + error.description);
}

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
    successEl.textContent = message;
    successEl.style.display = 'block';
}

// Cash on Delivery Handler
function handleCOD(totalAmount, customerName, customerEmail, customerPhone, cart) {
    // For COD, charge ₹59 shipping advance via Razorpay
    const codShippingCharge = 59;
    
    showSuccess('💳 Proceed to Pay ₹59 Shipping Advance for Cash on Delivery');
    
    // Create order for shipping advance
    processRazorpayForCOD(codShippingCharge, customerName, customerEmail, customerPhone, totalAmount, cart);
}

async function processRazorpayForCOD(shippingCharge, customerName, customerEmail, customerPhone, totalAmount, cart) {
    try {
        // Create order on backend for shipping charge
        const response = await fetch('http://localhost:3000/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: shippingCharge * 100, // Convert to paise
                currency: 'INR',
                receipt: 'receipt_cod_' + Date.now(),
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone
                }
            })
        });

        const orderData = await response.json();

        if (!response.ok) {
            showError(orderData.message || 'Failed to create order');
            return;
        }

        // Razorpay Options for COD
        const options = {
            key: orderData.key_id,
            amount: shippingCharge * 100, // Amount in paise
            currency: 'INR',
            name: 'Plushieland',
            description: `Cash on Delivery - Shipping Advance`,
            image: 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300',
            order_id: orderData.order_id,
            handler: function(response) {
                handleCODPaymentSuccess(response, orderData, totalAmount, customerName, customerEmail, customerPhone);
            },
            prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone
            },
            notes: {
                type: 'COD',
                address: document.getElementById('customerAddress').value,
                city: document.getElementById('customerCity').value,
                postal: document.getElementById('customerPostal').value
            },
            theme: {
                color: '#d946ef'
            },
            modal: {
                ondismiss: function() {
                    alert('Please complete the shipping advance payment to proceed with Cash on Delivery.');
                    return false;
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', handlePaymentError);
        rzp1.open();

    } catch (error) {
        console.error('COD payment initiation error:', error);
        showError('An error occurred. Please try again.');
    }
}

function handleCODPaymentSuccess(response, orderData, totalAmount, customerName, customerEmail, customerPhone) {
    showSuccess(`✓ Shipping Advance Paid! Order ID: ${orderData.order_id}\n\nYour order will be delivered Cash on Delivery (COD)`);
    
    // Save order details
    const orderDetails = {
        orderId: orderData.order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
        amount: totalAmount,
        shippingAdvance: 59,
        paymentMethod: 'COD',
        timestamp: new Date().toISOString(),
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
        }
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
    localStorage.removeItem('plushie_cart');
    
    // Redirect to success page after 2 seconds
    setTimeout(() => {
        window.location.href = 'order-success.html?orderId=' + orderData.order_id + '&method=COD';
    }, 2000);
}

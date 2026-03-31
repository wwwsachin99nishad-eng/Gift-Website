/**
 * common.js
 * Shared logic for Countdown Timer and Delivery Date
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    setupDeliveryDate();
    initAuth(); // New Auth Init
});

// --- FIREBASE & AUTH LOGIC ---

// PLACEHOLDER: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAJfoldD4acLmzAhTL6U5OMRBmG_rIYg7s",
  authDomain: "gift-app-28ae5.firebaseapp.com",
  projectId: "gift-app-28ae5",
  storageBucket: "gift-app-28ae5.firebasestorage.app",
  messagingSenderId: "34060026010",
  appId: "1:34060026010:web:05f2d265c3318d144a1f23",
  measurementId: "G-R5M1J0BKTS"
};

let confirmationResult = null;
let isMockMode = true; // Default to mock mode until real keys are provided

// RAZORPAY CONFIG
const RZP_KEY_ID = "rzp_test_SXr2WUwQxlLtZo";

/**
 * Initializes Firebase and Auth UI
 */
function initAuth() {
    // Check if Firebase is available and config is updated
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        isMockMode = false;
        console.log("🔥 Firebase Initialized");
    } else {
        console.warn("⚠️ Firebase keys missing. Running in MOCK MODE (OTP: 1234)");
    }

    injectAuthModal();
    injectCartModal(); 
    checkLoginStatus();
    updateCartBadge();

    // NEW: Auto-open modal for new/non-logged-in users
    const userPhone = localStorage.getItem('plushieUser');
    if (!userPhone) {
        setTimeout(() => {
            openAuthModal();
        }, 1500); // Small delay for better UX
    }
}

/**
 * Injects the Auth Modal HTML into the body (Google Only)
 */
function injectAuthModal() {
    const modalHTML = `
        <div class="modal-overlay" id="authModal">
            <div class="auth-box" style="text-align: center; padding: 40px 30px;">
                <button class="modal-close" onclick="closeAuthModal()">✕</button>
                
                <h2 class="auth-title" style="margin-bottom: 5px; font-size: 1.8rem;">Welcome to Sachin's <br> Delivery Hub 🐰</h2>
                <p class="auth-subtitle" style="margin-bottom: 25px; font-weight: 700; color: #4caf7d;">✅ Official & Secured Partner</p>

                <div class="auth-input-group" style="text-align: left; margin-bottom: 20px;">
                    <label class="auth-label">Enter Your Full Name</label>
                    <input type="text" id="loginNameManual" class="checkout-input" placeholder="Your Name" style="margin-bottom:0;">
                </div>

                <button class="google-btn" onclick="signInWithGoogle()" style="padding: 16px; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 5px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google">
                    Continue with Google 🔒
                </button>

                <div class="auth-trust-badges" style="margin-top: 20px;">
                    <div class="trust-item">Verified SDK</div>
                    <div class="trust-item">SSL Encrypted</div>
                </div>

                <p style="margin-top: 20px; font-size: 0.8rem; color: var(--muted); line-height: 1.4;">
                    Trusted by <b>10,000+</b> Happy Customers <br>
                    <span style="font-size: 0.7rem;">Your data is 100% private & never shared.</span>
                </p>
                
                <div id="authStatus" class="auth-status"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Injects the Slide-in Cart Modal
 */
function injectCartModal() {
    if (document.getElementById('cartModal')) return;

    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="cart-drawer" onclick="event.stopPropagation()">
            <div class="cart-header">
                <h2 style="font-family: 'Pacifico', cursive; color: var(--deep-pink); margin: 0;">Your Cart 🛍️</h2>
                <button class="cart-remove-btn" onclick="closeCart()" style="width:36px;height:36px;font-size:1.2rem;">✕</button>
            </div>
            
            <div class="cart-items-list" id="cartItemsContainer">
                <!-- Items injected here -->
            </div>

            <div class="cart-footer">
                <div class="cart-total-row">
                    <span>Total Amount:</span>
                    <span id="cartTotalText">Rs. 0</span>
                </div>
                <button class="btn-buy" style="width:100%; border-radius:12px; padding:18px; font-size:1.1rem;" onclick="proceedToCheckoutFromCart()">
                    Checkout Now ⚡
                </button>
                <button class="btn-continue-shopping" onclick="closeCart()">
                    Keep Shopping 🐰
                </button>
            </div>
        </div>
    `;
    modal.onclick = closeCart;
    document.body.appendChild(modal);
}

let authMode = 'signIn';

/**
 * Switches between Sign In and Sign Up tabs
 */
function switchAuthTab(mode) {
    authMode = mode;
    const tabIn = document.getElementById('tabSignIn');
    const tabUp = document.getElementById('tabSignUp');
    const nameGroup = document.getElementById('nameInputGroup');
    const title = document.getElementById('authMainTitle');
    const sub = document.getElementById('authSubTitle');
    const btn = document.getElementById('sendOtpBtn');

    if (mode === 'signUp') {
        tabUp.classList.add('active');
        tabIn.classList.remove('active');
        nameGroup.style.display = 'block';
        title.textContent = "Join Us ✨";
        sub.textContent = "Create your account for better shopping";
        btn.textContent = "Sign Up ➡️";
    } else {
        tabIn.classList.add('active');
        tabUp.classList.remove('active');
        nameGroup.style.display = 'none';
        title.textContent = "Welcome 🐰";
        sub.textContent = "Login to your account with OTP";
        btn.textContent = "Send OTP ➡️";
    }
    showStatus("", "");
}

/**
 * Google Sign-In Logic (With Name Validation)
 */
function signInWithGoogle() {
    const nameInput = document.getElementById('loginNameManual');
    const name = nameInput ? nameInput.value.trim() : "";
    const statusEl = document.getElementById('authStatus');

    if (!name) {
        showStatus("Please enter your name first", "error");
        if (nameInput) nameInput.style.borderColor = "#ff4d6d";
        return;
    }

    showStatus("Opening Google Auth...", "success");

    if (isMockMode) {
        setTimeout(() => {
            loginSuccess("+910000000000", name);
            showStatus("MOCK MODE: Google login successful!", "success");
        }, 1200);
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                loginSuccess(user.phoneNumber || "Google User", name);
            })
            .catch((error) => {
                console.error(error);
                showStatus("Google Login Error: " + error.message, "error");
            });
    }
}

/**
 * Handles Account Button click (Login or Logout)
 */
function handleAccountClick() {
    const user = localStorage.getItem('plushieUser');
    if (user) {
        if (confirm("Do you want to logout?")) {
            logout();
        }
    } else {
        openAuthModal();
    }
}

function openAuthModal() {
    document.getElementById('authModal').classList.add('open');
    if (!isMockMode && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible'
        });
    }
}

/**
 * Closes the Auth Modal (Only if logged in)
 */
function closeAuthModal() {
    const userPhone = localStorage.getItem('plushieUser');
    if (userPhone) {
        document.getElementById('authModal').classList.remove('open');
    } else {
        showStatus("Please login to access the site", "error");
    }
}

/**
 * Sends OTP via Firebase or Mock Mode
 */
function sendOTP() {
    const nameInput = document.getElementById('loginName').value.trim();
    const phoneInput = document.getElementById('loginPhone').value.trim();
    const statusEl = document.getElementById('authStatus');
    const btn = document.getElementById('sendOtpBtn');

    if (authMode === 'signUp' && !nameInput) {
        showStatus("Please enter your name", "error");
        return;
    }
    if (!/^\d{10}$/.test(phoneInput)) {
        showStatus("Enter a valid 10-digit number", "error");
        return;
    }

    localStorage.setItem('tempName', nameInput); // Store name temporarily
    const fullPhone = "+91" + phoneInput;
    statusEl.innerHTML = "Sending OTP...";
    btn.disabled = true;

    if (isMockMode) {
        setTimeout(() => {
            console.log("Mock OTP Sent: 1234");
            showStep2();
            showStatus("MOCK MODE: OTP is 1234", "success");
        }, 1000);
    } else {
        const appVerifier = window.recaptchaVerifier;
        firebase.auth().signInWithPhoneNumber(fullPhone, appVerifier)
            .then((result) => {
                confirmationResult = result;
                showStep2();
                showStatus("OTP sent to " + fullPhone, "success");
            })
            .catch((error) => {
                console.error(error);
                showStatus("Error: " + error.message, "error");
                btn.disabled = false;
            });
    }
}

function showStep2() {
    document.getElementById('authStep1').style.display = 'none';
    document.getElementById('authStep2').style.display = 'block';
    startResendTimer();
}

/**
 * Verifies OTP
 */
function verifyOTP() {
    const otp = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value).join('');
    const statusEl = document.getElementById('authStatus');
    const btn = document.getElementById('verifyOtpBtn');

    if (otp.length < 4) {
        showStatus("Enter full 4-digit OTP", "error");
        return;
    }

    statusEl.innerHTML = "Verifying...";
    btn.disabled = true;

    if (isMockMode) {
        setTimeout(() => {
            if (otp === "1234") {
                loginSuccess("9876543210");
            } else {
                showStatus("Invalid OTP! Try 1234", "error");
                btn.disabled = false;
            }
        }, 1000);
    } else {
        confirmationResult.confirm(otp)
            .then((result) => {
                loginSuccess(result.user.phoneNumber);
            })
            .catch((error) => {
                showStatus("Invalid OTP! " + error.message, "error");
                btn.disabled = false;
            });
    }
}

function loginSuccess(phone, nameFromGoogle = null) {
    const name = nameFromGoogle || localStorage.getItem('tempName') || "User";
    localStorage.setItem('plushieUser', phone);
    localStorage.setItem('plushieUserName', name);
    localStorage.removeItem('tempName');

    showStatus(`Welcome, ${name}! Login Successful!`, "success");
    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
        // Pre-fill checkout if exists
        const custName = document.getElementById('custName');
        const custPhone = document.getElementById('custPhone');
        if (custName) custName.value = name;
        if (custPhone) custPhone.value = phone.replace("+91", "");
    }, 1500);
}

/**
 * Updates UI based on Login State
 */
function checkLoginStatus() {
    const userPhone = localStorage.getItem('plushieUser');
    const userName = localStorage.getItem('plushieUserName');
    const display = document.getElementById('userDisplay');
    const accBtn = document.getElementById('accountBtn');

    if (userPhone && display) {
        document.body.classList.add('user-logged-in'); // Remove blur & enable close
        display.textContent = userName || userPhone.replace("+91", "");
        display.style.display = 'inline-block';
        if (accBtn) accBtn.innerHTML = "🚪"; 
    } else if (display) {
        document.body.classList.remove('user-logged-in');
        display.style.display = 'none';
        if (accBtn) accBtn.innerHTML = "👤";
    }
}

function logout() {
    localStorage.removeItem('plushieUser');
    localStorage.removeItem('plushieUserName');
    if (!isMockMode) firebase.auth().signOut();
    location.reload();
}

// Helpers
function showStatus(msg, type) {
    const s = document.getElementById('authStatus');
    s.textContent = msg;
    s.className = "auth-status " + (type === 'error' ? 'status-error' : 'status-success');
}

function moveFocus(el, nextId) {
    if (el.value.length === 1 && nextId) {
        document.getElementById(nextId).focus();
    }
}

function startResendTimer() {
    let timeLeft = 30;
    const timerEl = document.getElementById('resendTimer');
    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Resend OTP in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerEl.textContent = "Resend OTP";
            timerEl.classList.add('active');
            timerEl.onclick = () => {
                document.getElementById('authStep2').style.display = 'none';
                document.getElementById('authStep1').style.display = 'block';
                document.getElementById('sendOtpBtn').disabled = false;
                showStatus("", "");
            };
        }
    }, 1000);
}

// --- EXISTING FUNCTIONS ---

/**
 * Initializes the 24-hour countdown timer
 */
function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    function updateTimer() {
        const now = new Date();
        
        // Calculate time remaining until the end of the current day
        const endDay = new Date();
        endDay.setHours(23, 59, 59, 999);
        
        let diff = endDay - now;
        if (diff < 0) diff = 0;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Update DOM
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }

    // Initial call and interval
    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * Calculates and formats tomorrow's date for the delivery badge
 */
function setupDeliveryDate() {
    const deliveryEl = document.getElementById('deliveryDateStr');
    if (!deliveryEl) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = tomorrow.toLocaleDateString('en-IN', options);
    
    deliveryEl.textContent = dateStr;
}

/**
 * Cart Data Management
 */
function getCart() {
    return JSON.parse(localStorage.getItem('plushie_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('plushie_cart', JSON.stringify(cart));
    updateCartBadge();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function clearCart() {
    localStorage.removeItem('plushie_cart');
    updateCartBadge();
    renderCart();
}

function addToCartGlobal(id, name, price, img, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    
    if (existing) {
        existing.qty += quantity;
    } else {
        cart.push({ id, name, price, img, qty: quantity });
    }
    
    saveCart(cart);
    renderCart();
    openCart(); // Show drawer immediately
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById('cartCount');
    
    if (badge) {
        badge.textContent = count;
        
        // Add pulse animation
        badge.classList.remove('cart-bounce');
        void badge.offsetWidth; // Trigger reflow
        badge.classList.add('cart-bounce');

        if (count > 0) {
            badge.style.display = 'flex';
            badge.style.opacity = '1';
        } else {
            badge.style.display = 'none';
            badge.style.opacity = '0';
        }
        console.log(`Badge updated: ${count}`);
    }
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotalText');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty-msg">Your cart is empty! <br> Add some items to start shopping. 🛍️</div>';
        totalEl.textContent = "Rs. 0";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="cart-item">
                <img src="${item.img}" class="cart-item-img" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">Rs. ${item.price} x ${item.qty}</div>
                </div>
                <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove">🗑️</button>
            </div>
        `;
    }).join('');
    
    if (totalEl) totalEl.textContent = `Rs. ${total}`;
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        renderCart();
        modal.classList.add('open');
    }
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.remove('open');
}

function proceedToCheckoutFromCart() {
    closeCart();
    if (typeof openCheckout === 'function') {
        openCheckout();
    } else {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.add('open');
    }
}

/**
 * Global Razorpay Payment Handler
 */
function payWithRazorpay(amount, name, phone, email = "customer@sachindeliveryhub.in") {
    const options = {
        "key": RZP_KEY_ID,
        "amount": amount * 100, // Amount in paise
        "currency": "INR",
        "name": "Sachin's Delivery Hub",
        "description": "Secure Gift Purchase",
        "image": "https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=100",
        "handler": function (response){
            console.log("Payment Successful:", response.razorpay_payment_id);
            // Call the page-specific finishOrder function
            if (typeof finishOrder === 'function') {
                finishOrder();
            } else {
                alert("Payment Successful! Your Order ID: " + response.razorpay_payment_id);
            }
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": phone
        },
        "theme": {
            "color": "#e07090"
        }
    };
    
    try {
        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response){
            alert("Payment Failed: " + response.error.description);
        });
        rzp1.open();
    } catch (e) {
        console.error("Razorpay Error:", e);
        alert("Payment gateway error. Please try again.");
    }
}

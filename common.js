/**
 * common.js
 * Shared logic for Countdown Timer and Delivery Date
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    setupDeliveryDate();
    initAuth(); // New Auth Init
    injectQuickViewModal(); // Initialize Quick View
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
 * Payment Processing with Razorpay
 * Called from product pages for direct payment
 */
function payWithRazorpay(amount, customerName, customerPhone) {
    if (!amount || amount <= 0) {
        alert("Invalid payment amount");
        return;
    }

    // Store cart and customer info in sessionStorage for checkout page
    sessionStorage.setItem('orderTotal', amount.toString());
    sessionStorage.setItem('customerName', customerName);
    sessionStorage.setItem('customerPhone', customerPhone);
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

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
    injectAdPopup();
    initAdPopup();

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
                
                <h2 class="auth-title" style="margin-bottom: 5px; font-size: 1.8rem;">Welcome to <br> Plushieland Gift Store 🐰</h2>
                <p class="auth-subtitle" style="margin-bottom: 25px; font-weight: 700; color: #4caf7d;">✅ Official & Secured Partner</p>

                <div class="auth-input-group" style="text-align: left; margin-bottom: 20px;">
                    <label class="auth-label">Enter Your Full Name</label>
                    <input type="text" id="loginNameManual" class="checkout-input" placeholder="Your Name" style="margin-bottom:0;">
                </div>

                <button class="google-btn" onclick="signInWithGoogle()" style="padding: 16px; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 5px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google">
                    Continue with Google 🔒
                </button>

                <button class="google-btn" onclick="continueAsGuest()" style="padding: 16px; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                    👤 Continue as Guest
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
                <button class="cart-close-btn" onclick="closeCart()">✕</button>
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

/**
 * Injects the Quick View Modal HTML
 */
function injectQuickViewModal() {
    if (document.getElementById('quickViewModal')) return;
    const qvHTML = `
        <div class="modal-overlay" id="quickViewModal" onclick="closeQuickView()">
            <div class="qv-box" onclick="event.stopPropagation()">
                <button class="qv-close" onclick="closeQuickView()">✕</button>
                <div class="qv-img-wrap">
                    <img id="qvImage" src="" alt="Product Image">
                </div>
                <div class="qv-details">
                    <h2 class="qv-title" id="qvTitle">Product Title</h2>
                    <div class="qv-price" id="qvPrice">Rs. 0 <span>Rs. 0</span></div>
                    <p class="qv-desc" id="qvDesc">Product description goes here.</p>
                    <div class="qv-specs-title">Specifications 🛠️</div>
                    <div class="qv-specs" id="qvSpecs">
                        <!-- Specs injected here -->
                    </div>
                    <div style="margin-top:auto; padding-top:20px;">
                        <button class="btn-cart" style="width:100%;" id="qvAddToCartBtn">Quick Add to Cart 🛒</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', qvHTML);
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
 * Continue as Guest (Skip Login)
 */
function continueAsGuest() {
    const nameInput = document.getElementById('loginNameManual');
    const name = nameInput ? nameInput.value.trim() : "";
    
    if (!name) {
        showStatus("Please enter your name first", "error");
        if (nameInput) nameInput.style.borderColor = "#ff4d6d";
        return;
    }

    localStorage.setItem('plushieUser', 'guest');
    localStorage.setItem('plushieUserName', name);
    localStorage.setItem('isGuest', 'true');
    
    showStatus(`Welcome, ${name}! Proceeding as Guest...`, "success");
    setTimeout(() => {
        closeAuthModal();
        checkLoginStatus();
        // Pre-fill checkout if exists
        const custName = document.getElementById('custName');
        if (custName) custName.value = name;
        initAdPopup(); // Show ad after proceeding
    }, 1200);
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
        initAdPopup(); // Show ad after login
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

/**
 * Injects the Ad Popup HTML
 */
function injectAdPopup() {
    if (document.getElementById('adPopup')) return;
    const adHTML = `
        <div class="ad-popup" id="adPopup">
            <button class="close-ad" onclick="closeAd()">✕</button>
            <img src="https://rukminim2.flixcart.com/blobio/649/649/imr/blobio-imr_947221f4263448a5bea75d6ac83bc8c7.jpeg?q=80" class="ad-img" alt="iPhone 17 Pro">
            <div class="ad-info">
                <div class="ad-title">Hidden Black Sale 🌑</div>
                <div class="ad-offer">🔥 Only at ₹999! (96% OFF)</div>
                <div style="display:flex; gap:6px; margin-top:5px;">
                    <button class="btn-buy" id="btnBuyAd" onclick="window.location.href='iphone.html'" style="flex:2;">Claim Link ➡️</button>
                    <button class="btn-buy" onclick="closeAd()" style="flex:1; background:#333; color:#aaa; font-size:0.75rem; border:none;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', adHTML);
}

/**
 * Initializes Ad Popup Timer
 */
function initAdPopup() {
    const userPhone = localStorage.getItem('plushieUser');
    if (userPhone) {
        setTimeout(() => {
            const ad = document.getElementById('adPopup');
            if (ad) ad.classList.add('show');
        }, 3500); // 3.5 seconds delay
    }
}

function closeAd() {
    const ad = document.getElementById('adPopup');
    if (ad) ad.classList.remove('show');
}

// --- EXISTING FUNCTIONS ---

/**
 * Initializes the 24-hour countdown timer
 */
function initCountdown() {
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

        // Flash Sale Elements
        const fsHours = document.getElementById('fs-hours');
        const fsMinutes = document.getElementById('fs-minutes');
        const fsSeconds = document.getElementById('fs-seconds');

        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');

        if (hoursEl) hoursEl.textContent = hh;
        if (minutesEl) minutesEl.textContent = mm;
        if (secondsEl) secondsEl.textContent = ss;

        if (fsHours) fsHours.textContent = hh;
        if (fsMinutes) fsMinutes.textContent = mm;
        if (fsSeconds) fsSeconds.textContent = ss;
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

function addToCartGlobal(id, name, price, img, quantity = 1, suppressDrawer = false, syncQty = false) {
    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    
    if (existing) {
        if (syncQty) {
            existing.qty = quantity; // Sync to exact qty for Buy Now
        } else {
            existing.qty += quantity;
        }
    } else {
        cart.push({ id, name, price, img, qty: quantity });
    }
    
    saveCart(cart);
    renderCart();
    if (typeof updateCartBadge === 'function') updateCartBadge();
    
    if (!suppressDrawer) {
        openCart(); // Show drawer immediately
    }
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
    // Redirect to checkout page
    const cart = JSON.parse(localStorage.getItem('plushie_cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
}

/**
 * QUICK VIEW LOGIC & DATA
 */
const ELECTRONICS_DATA = {
    'airpods-pro-2': {
        name: "Apple AirPods Pro (2nd Gen)",
        price: 249, oldPrice: 24900,
        img: "https://rukminim2.flixcart.com/image/480/640/kpinwy80/headphone/m/5/1/mmef2hn-a-apple-original-imag3qe993fzdbcz.jpeg?q=90",
        desc: "The absolute best in-ear headphones with Active Noise Cancellation and spatial audio. Experience magic in your ears.",
        specs: { "Driver": "Custom high-excursion Apple driver", "Connectivity": "Bluetooth 5.3", "Battery": "Up to 6 hours", "Waterproof": "IPX4" }
    },
    'ps5-slim': {
        name: "PlayStation 5 Slim Console",
        price: 299, oldPrice: 54990,
        img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
        desc: "Experience lightning-fast loading with an ultra-high speed SSD and deeper immersion with haptic feedback.",
        specs: { "Storage": "1TB SSD", "GPU": "Ray Tracing Support", "Output": "4K 120Hz", "HDR": "Yes" }
    },
    's24-ultra': {
        name: "Samsung Galaxy S24 Ultra",
        price: 299, oldPrice: 129999,
        img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
        desc: "The ultimate smartphone experience with the built-in S Pen and the most advanced mobile camera yet.",
        specs: { "Camera": "200MP Main", "Processor": "Snapdragon 8 Gen 3", "Display": "6.8\" AMOLED 120Hz", "Battery": "5000mAh" }
    },
    'watch-ultra-2': {
        name: "Apple Watch Ultra 2",
        price: 285, oldPrice: 89900,
        img: "https://rukminim2.flixcart.com/image/948/948/xif0q/smartwatch/9/h/m/-original-imah4jm9xwddbggr.jpeg?q=90",
        desc: "The most rugged and capable Apple Watch ever. Built for athletes and outdoor explorers of all kinds.",
        specs: { "Case": "49mm Titanium", "Display": "3000 nits Peak", "Battery": "Up to 36 hours", "GPS": "Precision Dual-frequency" }
    },
    'sony-xm5': {
        name: "Sony WH-1000XM5 ANC",
        price: 264, oldPrice: 34990,
        img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
        desc: "Industry-leading noise cancellation and magnificent sound quality. Perfect for travel or deep focus.",
        specs: { "ANC": "Integrated Processor V1", "Drivers": "30mm specially designed", "Battery": "30 hours", "Fast Charge": "3 mins = 3 hrs" }
    },
    'macbook-air-m3': {
        name: "MacBook Air M3 (13-inch)",
        price: 299, oldPrice: 114900,
        img: "https://rukminim2.flixcart.com/image/948/948/xif0q/computer/g/t/w/-original-imagypv6zpfu8kzh.jpeg?q=90",
        desc: "The world's most popular laptop is now even better with the M3 chip. Superlight and incredibly fast.",
        specs: { "Chip": "Apple M3 8-core CPU", "RAM": "8GB Unified", "Display": "Liquid Retina 13.6\"", "Port": "MagSafe 3" }
    },
    'ipad-pro-m4': {
        name: "Apple iPad Pro M4 (11\")",
        price: 281, oldPrice: 99900,
        img: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=webp&qlt=90&.v=cXN0QTVTNDBtbGIzcy91THBPRThnMkpvMjZnN3E5aGRZVXJIWmhFMitJSU9WV3R2ZHdZMXRzTjZIcWdMTlg4eUJQYkhSV3V1dC9oa0s5K3lqMGtUaFYrNkhvSzBtcy9ubWtTZUpaU0lsQ2NWNTFabEhVdlFNSjJrWGh4dTRLbEk&traceId=1",
        desc: "Unbelievably thin and powerful. Features the world's most advanced display and groundbreaking performance.",
        specs: { "Display": "Ultra Retina XDR", "Chip": "Apple M4", "Rear Camera": "12MP Wide", "Front Camera": "Landscape 12MP" }
    },
    'dji-mini-4': {
        name: "DJI Mini 4 Pro Drone",
        price: 299, oldPrice: 95000,
        img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500",
        desc: "The Mini 4 Pro is our most advanced mini-camera drone to date. It integrates powerful imaging capabilities.",
        specs: { "Weight": "<249g", "Obstacle Sensing": "Omnidirectional", "Video": "4K/60fps HDR", "Transmission": "20km Max" }
    },
    'gopro-12': {
        name: "GoPro HERO 12 Black",
        price: 249, oldPrice: 45000,
        img: "https://m.media-amazon.com/images/I/61dUvabnSmL._SL1500_.jpg",
        desc: "Best-in-class image quality, even better HyperSmooth video stabilization and a huge boost in battery performance.",
        specs: { "Video": "5.3K60 / 4K120", "Photos": "27MP", "Stabilization": "HyperSmooth 6.0", "Waterproof": "33ft (10m)" }
    },
    'canon-r50': {
        name: "Canon EOS R50 Mirrorless",
        price: 299, oldPrice: 75995,
        img: "images/canon_r50.png",
        desc: "Perfect for content creators on the go. Compact, lightweight, and incredibly smart autofocus.",
        specs: { "Sensor": "24.2MP APS-C", "AF": "Dual Pixel CMOS AF II", "Video": "4K 30p Uncropped", "Screen": "3.0\" Vari-angle" }
    },
    'dyson-v15': {
        name: "Dyson V15 Detect Vacuum",
        price: 272, oldPrice: 65990,
        img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
        desc: "The most powerful, intelligent cordless vacuum. Laser reveals microscopic dust you can't see.",
        specs: { "Suction Power": "230AW", "Runtime": "Up to 60 mins", "Filtration": "HEPA whole-machine", "Laser": "Piezo Sensor" }
    },
    'switch-oled': {
        name: "Nintendo Switch (OLED)",
        price: 911, oldPrice: 32000,
        img: "https://rukminim2.flixcart.com/image/948/948/kuipea80/gamingconsole/l/t/v/64-switch-oled-console-with-white-joy-con-nintendo-no-original-imag7mpascrk2cyy.jpeg?q=90",
        desc: "The newest member of the Nintendo Switch family. Features a vibrant 7-inch OLED screen and enhanced audio.",
        specs: { "Display": "7-inch OLED", "Storage": "64GB", "Mode": "TV, Tabletop, Handheld", "Joy-Con": "Detachable" }
    },
    'instax-12': {
        name: "Fujifilm Instax Mini 12",
        price: 185, oldPrice: 9999,
        img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
        desc: "Capture the moment with a high-style, easy-to-use instant camera. Perfect for parties and travel.",
        specs: { "Film": "instax mini film", "Exposure": "Automatic", "Flash": "Constant firing", "Lens": "2 components, 2 elements" }
    },
    'echo-show-10': {
        name: "Amazon Echo Show 10",
        price: 249, oldPrice: 24999,
        img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500",
        desc: "Smart display with motion. It moves with you, keeping the 10.1\" HD screen in view while you cook or call.",
        specs: { "Screen": "10.1\" Rotating HD", "Camera": "13MP Auto-framing", "Speaker": "2.1 System", "Privacy": "Slighty built-in" }
    },
    'logitech-mouse': {
        name: "Logitech G Pro X Superlight 2",
        price: 224, oldPrice: 16995,
        img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        desc: "Designed with the world's leading esports pros. Engineered to win. Incredibly lightweight and precise.",
        specs: { "Weight": "60g", "Sensor": "HERO 2", "Connectivity": "LIGHTSPEED Wireless", "Polling": "2KHz" }
    }
};

function openQuickView(id) {
    const data = ELECTRONICS_DATA[id];
    if (!data) return;

    document.getElementById('qvTitle').innerText = data.name;
    document.getElementById('qvPrice').innerHTML = `Rs. ${data.price} <span>Rs. ${data.oldPrice.toLocaleString()}</span>`;
    document.getElementById('qvDesc').innerText = data.desc;
    document.getElementById('qvImage').src = data.img;

    const specsContainer = document.getElementById('qvSpecs');
    specsContainer.innerHTML = Object.entries(data.specs).map(([key, val]) => `
        <div class="qv-spec-item">
            <span class="qv-spec-label">${key}</span>
            <span class="qv-spec-val">${val}</span>
        </div>
    `).join('');

    const addBtn = document.getElementById('qvAddToCartBtn');
    addBtn.onclick = () => {
        addToCartGlobal(id, data.name, data.price, data.img, 1);
        closeQuickView();
    };

    document.getElementById('quickViewModal').classList.add('open');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.classList.remove('open');
}

const images = [
    'https://www.myimaginestore.com/media/catalog/product/cache/4a48ac28cbb6e9c41470e5be5a6d3043/i/p/iphone_17_pro_cosmic_orange_pdp_image_position_1__en-in_1.jpg',
    'https://m.media-amazon.com/images/I/618vU2qKXQL._SL1500_.jpg',
    'https://rukminim2.flixcart.com/blobio/649/649/imr/blobio-imr_947221f4263448a5bea75d6ac83bc8c7.jpeg?q=80'
  ];

  let currentImg = 0;
  let qty = 1;

  // Build thumbnails
  const thumbsEl = document.getElementById('thumbnails');
  if (thumbsEl) {
    images.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'thumb' + (i === 0 ? ' active' : '');
      div.innerHTML = `<img src="${src}" alt="thumb ${i+1}">`;
      div.onclick = () => setMainImage(i);
      thumbsEl.appendChild(div);
    });
  }

  function setMainImage(i) {
    currentImg = i;
    const mainImgEl = document.getElementById('mainImage');
    if (mainImgEl) mainImgEl.src = images[i];
    document.querySelectorAll('.thumb').forEach((t, idx) => {
      t.classList.toggle('active', idx === i);
    });
  }

  function changeQty(delta) {
    qty = Math.max(1, qty + delta);
    const qtyValueEl = document.getElementById('qtyValue');
    if (qtyValueEl) qtyValueEl.textContent = qty;
  }

  function selectStyle(btn, name) {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const selectedStyleEl = document.getElementById('selectedStyle');
    if (selectedStyleEl) selectedStyleEl.textContent = name;
  }

  function addToCart() {
    addToCartGlobal('iphone-17-pro', 'iPhone 17 Pro 1TB', 999.00, 'https://www.myimaginestore.com/media/catalog/product/cache/4a48ac28cbb6e9c41470e5be5a6d3043/i/p/iphone_17_pro_cosmic_orange_pdp_image_position_1__en-in_1.jpg', qty);
    
    // UI Feedback
    const btn = document.querySelector('.btn-cart');
    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (btn) {
      btn.textContent = '✅ Reserved for you!';
      btn.style.background = '#4caf7d';
      setTimeout(() => {
        btn.textContent = '🛒 Add to Cart';
        btn.style.background = '';
      }, 1800);
    }
  }

  function openModal() {
    const modalImgEl = document.getElementById('modalImg');
    if (modalImgEl) modalImgEl.src = images[currentImg];
    document.getElementById('modal').classList.add('open');
  }
  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }

  // Reviews
  const reviews = [
    { name: 'Rohan J.', stars: 5, text: 'The Cosmic Orange is just stunning. Performances is out of this world. Great service from Plushieland!', image: 'https://rukminim2.flixcart.com/blobio/649/649/imr/blobio-imr_a403562d39b54b3aa5df148d3f6e9f33.jpg?q=80' },
    { name: 'Kritika M.', stars: 5, text: 'Got this in pre-sale at Plushieland Gift Delivery Discount Hub. Incredible offer for 1TB variant!', image: 'https://rukminim2.flixcart.com/blobio/192/192/imr/blobio-imr_410c2f9f41ff41249224529f0f142d72.jpeg?q=80' },
    { name: 'Vikram S.', stars: 5, text: '24-hour VIP Express Delivery by Plushieland Gift Store. Original sealed box. Highly recommended!', image: 'https://rukminim2.flixcart.com/blobio/192/192/imr/blobio-imr_89589e4f49f04b1d994ee0d371130735.jpg?q=80' },
    { name: 'Siddharth M.', stars: 5, text: 'Outstanding service from Gift Delivery Discount Hub. The camera quality is absolutely mind-blowing!', image: 'https://rukminim2.flixcart.com/blobio/192/192/imr/blobio-imr_7dc9eab48080446998e5a10ad7765fec.jpeg?q=80' }
  ];

  const grid = document.getElementById('reviewsGrid');
  if (grid) {
    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      let imgHTML = r.image ? `<img src="${r.image}" class="review-img" alt="Review Image">` : '';
      card.innerHTML = `
        <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div class="review-name">${r.name}</div>
        <div class="review-text">"${r.text}"</div>
        ${imgHTML}
      `;
      grid.appendChild(card);
    });
  }

  // Wishlist toggle
  const wf = document.querySelector('.wishlist-float');
  let wishlisted = false;
  if (wf) {
    wf.addEventListener('click', () => {
      wishlisted = !wishlisted;
      wf.textContent = wishlisted ? '❤️' : '🤍';
    });
  }

  // --- CHECKOUT LOGIC ---
  const PRICE_PER_ITEM = 99999;

  function openCheckout() {
    // Add current product to cart
    const productName = document.querySelector('.product-title')?.textContent?.trim() || 'Product';
    const productPrice = PRICE_PER_ITEM;
    const productImg = document.getElementById('mainImage')?.src || '';
    const productId = 'product-' + Date.now();
    
    addToCartGlobal(productId, productName, productPrice, productImg, qty, true, true);
    
    // Redirect to checkout.html with payment method selection
    window.location.href = 'checkout.html';
  }

  function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
  }

  function startCheckoutProcessing() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    
    if(!name || !phone) {
        alert("Please enter Name and Mobile to continue.");
        return;
    }

    document.getElementById('checkoutStep1').style.display = 'none';
    const loadingEl = document.getElementById('checkoutLoading');
    if(loadingEl) loadingEl.style.display = 'block';

    setTimeout(() => {
        showPaymentMethods();
    }, 2000);
  }

  let selectedMethod = 'UPI';

  function selectPaymentMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('opt' + method).classList.add('selected');
    
    let baseAmt = getCartTotal() || PRICE_PER_ITEM;
    if (method === 'COD') {
        const trustNote = document.getElementById('codTrustNote');
        if (trustNote) trustNote.style.display = 'block';
        document.getElementById('btnPayText').textContent = 'Pay Rs. 59 Shipping Only';
        document.getElementById('methodAmountStr').textContent = `Rs. 59 (Advance)`;
    } else {
        const trustNote = document.getElementById('codTrustNote');
        if (trustNote) trustNote.style.display = 'none';
        document.getElementById('btnPayText').textContent = `Pay Rs. ${baseAmt.toLocaleString('en-IN')}`;
        document.getElementById('methodAmountStr').textContent = `Rs. ${baseAmt.toLocaleString('en-IN')}`;
    }
  }

  function showPaymentMethods() {
    const loadingEl = document.getElementById('checkoutLoading');
    if(loadingEl) loadingEl.style.display = 'none';
    
    selectPaymentMethod('UPI'); // default (will show PRICE_PER_ITEM if cart is empty)
    document.getElementById('checkoutStep2').style.display = 'block';
  }

  function proceedToFinal() {
    let finalAmt = getCartTotal() || PRICE_PER_ITEM;
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    
    if (selectedMethod === 'COD') {
        finalAmt = 59; // 59 Rs Shipping Advance
        alert("Cash on Delivery requires ₹59 Shipping Advance. Opening Secure Payment...");
    }

    // Global Razorpay
    if (typeof payWithRazorpay === 'function') {
        payWithRazorpay(finalAmt, name, phone);
    } else {
        alert("Payment Gateway Error. Please try again.");
    }
  }

  function finishOrder() {
    document.getElementById('checkoutStep2').style.display = 'none';
    if (typeof clearCart === 'function') clearCart();
    
    const randomId = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('randomOrderID').textContent = randomId;
    document.getElementById('checkoutStep_Success').style.display = 'block';
  }

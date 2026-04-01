const images = [
    'https://coveradda24.myshopify.com/cdn/shop/files/WhatsAppImage2026-01-15at1.33.34PM_fd3e5de8-1d97-4501-95ee-af4d879c958d.jpg?v=1768652364&width=832',
    'https://coveradda24.myshopify.com/cdn/shop/files/WhatsApp_Image_2026-01-24_at_4.39.23_PM.jpg?v=1769597195&width=1920'
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
    addToCartGlobal('jhumka-box', 'Jhumka Box - 16 Pairs', 199, 'https://coveradda24.myshopify.com/cdn/shop/files/WhatsAppImage2026-01-15at1.33.34PM_fd3e5de8-1d97-4501-95ee-af4d879c958d.jpg?v=1768652364&width=300', qty);
    
    // UI Feedback
    const btn = document.querySelector('.btn-cart');
    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (btn) {
      btn.textContent = '✅ Added to Cart!';
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
    { name: 'Amit B.', stars: 5, text: 'A fantastic collection of traditional earrings. My sister loved the variety and quality.', image: 'https://judgeme.imgix.net/fubs/1769869110__inbound8238139474920189397__original.jpg?auto=format&w=160' },
    { name: 'Pooja T.', stars: 5, text: 'So many options! I have a pair for every outfit now. The designs are really authentic.', image: 'https://judgeme.imgix.net/fubs/1765782776__whatsappimage2025-12-05at125612am__original.jpeg?auto=format&w=160' },
    { name: 'Rahul V.', stars: 4, text: 'Bought this for my mother. She really appreciated the traditional Indian craftsmanship.', image: 'https://judgeme.imgix.net/fubs/1768391636__88919__original.jpg?auto=format&w=160' },
    { name: 'Shweta D.', stars: 5, text: 'The variety is amazing for this price. Perfect for Navratri, Diwali, and weddings.' },
    { name: 'Vinay K.', stars: 5, text: 'Packaged very well. None of the pieces were damaged. Excellent value for 16 pairs.' },
    { name: 'Neha J.', stars: 5, text: 'Very happy with the 16 unique designs. They all look stunning and high-end.' },
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
  const PRICE_PER_ITEM = 199;

  function openCheckout() {
    // Add/Sync Jhumka in cart silently before opening checkout
    addToCartGlobal('jhumka-box', 'Jhumka Box - 16 Pairs', 199, 'https://coveradda24.myshopify.com/cdn/shop/files/WhatsAppImage2026-01-15at1.33.34PM_fd3e5de8-1d97-4501-95ee-af4d879c958d.jpg?v=1768652364&width=300', qty, true, true);
    
    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';

    // NEW: Pre-fill Name & Phone if logged in
    const userPhone = localStorage.getItem('plushieUser');
    const userName = localStorage.getItem('plushieUserName');
    if (userPhone) {
        const custName = document.getElementById('custName');
        const custPhone = document.getElementById('custPhone');
        if (custName && userName) custName.value = userName;
        if (custPhone) custPhone.value = userPhone.replace("+91", "");
    }
  }

  function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
  }

  function detectLocation() {
    const locBtn = document.querySelector('.btn-location-small');
    if(locBtn) locBtn.textContent = '⏳ Auto Detecting...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    if(data.address) {
                        if(document.getElementById('custStreet')) {
                            document.getElementById('custStreet').value = data.address.road || data.address.suburb || data.address.neighbourhood || '';
                        }
                        if(document.getElementById('custCity')) {
                            document.getElementById('custCity').value = data.address.city || data.address.state_district || data.address.state || '';
                        }
                        if(document.getElementById('custPincode')) {
                            document.getElementById('custPincode').value = data.address.postcode || '';
                        }
                    }
                    if(locBtn) locBtn.textContent = '📍 Auto Detect';
                }).catch(e => {
                    if(locBtn) locBtn.textContent = '📍 Auto Detect';
                    alert("Could not fetch address details automatically.");
                });
        }, () => {
            if(locBtn) locBtn.textContent = '📍 Auto Detect';
            alert("Location access denied. Please enter manually.");
        });
    } else {
        alert("Geolocation not supported on this device.");
    }
  }

  function startCheckoutProcessing() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const house = document.getElementById('custHouse').value.trim();
    const street = document.getElementById('custStreet').value.trim();
    
    if(!name || !phone || !house || !street) {
        alert("Please enter Name, Mobile, and complete Address (Flat & Street) to continue.");
        return;
    }

    document.getElementById('checkoutStep1').style.display = 'none';
    const loadingEl = document.getElementById('checkoutLoading');
    if(loadingEl) loadingEl.style.display = 'block';

    const loadingPhrases = ["Verifying stock...", "Securing your connection...", "Encrypting your data...", "Generating secure UPI link..."];
    const loadingText = document.getElementById('loadingText');
    
    let step = 0;
    const interval = setInterval(() => {
        if(step < loadingPhrases.length) {
            if(loadingText) loadingText.textContent = loadingPhrases[step];
            step++;
        }
    }, 600);

    setTimeout(() => {
        clearInterval(interval);
        showPaymentMethods();
    }, 2800);
  }

  let selectedMethod = 'UPI';

  function selectPaymentMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('opt' + method).classList.add('selected');
    
    let finalAmt = getCartTotal();
    if(method === 'COD') {
        const trustNote = document.getElementById('codTrustNote');
        if(trustNote) trustNote.style.display = 'block';
        document.getElementById('btnPayText').textContent = 'Pay Rs. 59 Shipping Only';
    } else {
        const trustNote = document.getElementById('codTrustNote');
        if(trustNote) trustNote.style.display = 'none';
        document.getElementById('btnPayText').textContent = `Pay Rs. ${finalAmt}`;
    }
  }

  function showPaymentMethods() {
    const loadingEl = document.getElementById('checkoutLoading');
    if(loadingEl) loadingEl.style.display = 'none';
    
    let baseAmt = getCartTotal();
    document.getElementById('methodAmountStr').textContent = `Rs. ${baseAmt}`;
    
    selectPaymentMethod('UPI'); // default
    document.getElementById('checkoutStep2').style.display = 'block';
  }

  function proceedToFinal() {
    // NEW: Modern Confirmation Warning before entering Razorpay
    const warningMsg = `WARNING / चेतावनी:\n\nEnglish: Please use UPI Payment only to avoid transaction failures.\nHindi: भुगतान विफल होने से बचाने के लिए कृपया केवल UPI का ही उपयोग करें।`;
    if (!confirm(warningMsg)) {
        return; // User cancelled
    }

    let finalAmt = getCartTotal();
    let upiNote = `Order%20for%20`;

    if (selectedMethod === 'COD') {
        finalAmt = 59; // 59 Rs Shipping
        upiNote = `COD%20Shipping%20for%20`;
    }

    if (selectedMethod === 'UPI' || selectedMethod === 'Card') {
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        
        // Use Global Razorpay
        payWithRazorpay(finalAmt, name, phone);
    } 
    else if (selectedMethod === 'COD') {
        // Cash on Delivery logic (Direct Success or Shipping Advance)
        alert("Cash on Delivery requires ₹59 Shipping Advance. Opening Secure Payment...");
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        payWithRazorpay(59, name, phone);
    }
  }

  function finishOrder() {
    document.getElementById('checkoutStep2').style.display = 'none';
    if(document.getElementById('checkoutStep3_UPI')) {
        document.getElementById('checkoutStep3_UPI').style.display = 'none';
    }
    
    // Clear global cart after success
    if (typeof clearCart === 'function') clearCart();
    
    const randomId = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('randomOrderID').textContent = randomId;
    
    document.getElementById('checkoutStep_Success').style.display = 'block';
  }

  function cancelPaymentSelect() {
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutStep1').style.display = 'block';
  }

  function goBackToMethods() {
    document.getElementById('checkoutStep3_UPI').style.display = 'none';
    document.getElementById('checkoutStep2').style.display = 'block';
  }

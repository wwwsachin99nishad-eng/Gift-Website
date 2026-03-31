const images = [
    'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=1220',
    'https://www.hellokidology.in/cdn/shop/files/9_2fb84739-1713-49ac-a6f7-1e96235c5a9b.jpg?v=1699973060&width=610',
    'https://www.hellokidology.in/cdn/shop/files/6_7015c966-236d-43b6-a9f5-5c086e0feef3.jpg?v=1741688694&width=610',
    'https://www.hellokidology.in/cdn/shop/files/71XMNIZYqOL._SL1500_7d9e3582-b956-48fd-8fc9-87ba132e04fd.jpg?v=1741688694&width=1220',
    'https://www.hellokidology.in/cdn/shop/files/adorable-strawberry-rabbit-plushie-cute-bunny-soft-toy-35-cm-original-imah2edhnbhahuyv_eb9a0bdb-e40a-4c9b-8976-7371d645476d.webp?v=1741688694&width=1220',
    'https://cdn.shopify.com/s/files/1/0709/6093/9317/files/gfvkytf_480x480_ac80ee07-4208-4eeb-91c1-242bc2fdeafa_480x480.gif?v=1684479066'
  ];

  let currentImg = 0;
  let qty = 1;
  let cartCount = 0;

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
    cartCount += qty;
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = cartCount;
    
    // Enable Buy Now
    const buyBtn = document.getElementById('btnBuyNow');
    if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.style.animation = 'pulseBuy 1.2s 2 ease-in-out';
    }

    const btn = document.querySelector('.btn-cart');
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
    { name: 'Aarav K.', stars: 5, text: 'Gifted this to my sister and she loves how it turns into a strawberry! Clever design.' },
    { name: 'Sneha P.', stars: 5, text: 'The softest plushie I have ever owned. Perfect for desk decoration and very huggable.' },
    { name: 'Ishaan M.', stars: 5, text: 'My son carries his "bunny-berry" everywhere. High quality and safe for kids.' },
    { name: 'Ananya S.', stars: 4, text: 'Super cute and matches my room perfectly. The reversible zipper is very smooth.' },
    { name: 'Kabir V.', stars: 5, text: 'Bought this as a surprise gift, and it was a hit! Worth every rupee for the quality.' },
    { name: 'Diya R.', stars: 5, text: 'Arrived quickly in beautiful packaging. Soft, cuddly, and looks exactly like the photos!' },
  ];

  const grid = document.getElementById('reviewsGrid');
  if (grid) {
    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div class="review-name">${r.name}</div>
        <div class="review-text">"${r.text}"</div>
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
  const PRICE_PER_ITEM = 99;

  function openCheckout() {
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
    
    let finalAmt = qty * PRICE_PER_ITEM;
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
    
    let baseAmt = qty * PRICE_PER_ITEM;
    document.getElementById('methodAmountStr').textContent = `Rs. ${baseAmt}`;
    
    selectPaymentMethod('UPI'); // default
    document.getElementById('checkoutStep2').style.display = 'block';
  }

  function proceedToFinal() {
    let finalAmt = qty * PRICE_PER_ITEM;
    let upiNote = `Order%20for%20`;

    if (selectedMethod === 'COD') {
        finalAmt = 59; // 59 Rs Shipping
        upiNote = `COD%20Shipping%20for%20`;
    }

    if (selectedMethod === 'UPI' || selectedMethod === 'COD') {
        const name = document.getElementById('custName').value.trim();
        const safeName = encodeURIComponent(name);
        document.getElementById('finalAmountStr').textContent = `Rs. ${finalAmt}` + (selectedMethod === 'COD' ? " (Advance Shipping)" : "");
        
        const upiLink = `upi://pay?pa=yoshivam@fam&pn=Plushieland&am=${finalAmt}&tn=${upiNote}${safeName}`;
        document.getElementById('upiLinkBtn').href = upiLink;
        
        const qrContainer = document.getElementById('paymentQR');
        qrContainer.innerHTML = ''; 
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrContainer, {
              text: upiLink, width: 150, height: 150,
              colorDark : "#e07090", colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
          });
        }
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutStep3_UPI').style.display = 'block';
    } 
    else if (selectedMethod === 'Card') {
        alert("Credit/Debit Card servers are currently facing downtime. Please use UPI or COD.");
    }
  }

  function finishOrder() {
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutStep3_UPI').style.display = 'none';
    
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

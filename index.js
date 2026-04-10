// Index page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    setupSearchBar();
    setupCart();
});

// Initialize filters
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.textContent);
        });
    });
}

// Filter products
function filterProducts(category) {
    const cards = document.querySelectorAll('.rec-card');
    cards.forEach(card => {
        if (category === 'All' || card.textContent.includes(category)) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    });
}

// Setup search bar
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const cards = document.querySelectorAll('.rec-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h4, .rec-title')?.textContent.toLowerCase() || '';
                const description = card.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (title.includes(query) || description.includes(query)) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    }
}

// Setup cart
function setupCart() {
    updateCartCount();
    document.addEventListener('click', function(e) {
        if (e.target.textContent.includes('🛒')) {
            e.preventDefault();
            openCart();
        }
    });
}

// Filter categories
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

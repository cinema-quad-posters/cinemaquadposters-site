// Utility to get/set cart (array of {id, title, price, thumbnail})
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
        console.error('Cart parse error:', e);
        return [];
    }
}

function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(item) {
    const cart = getCart();
    if (!cart.some(c => c.id === item.id)) {
        cart.push({ id: item.id, title: item.title, price: item.price, thumbnail: item.thumbnail });
        setCart(cart);
        alert(`${item.title} added to cart!`);
        updateCartBadge(true); // Animate on add
    } else {
        alert(`${item.title} is already in your cart.`);
    }
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    setCart(cart);
    updateCartBadge(); // Update without animation on remove
}

// Shared badge update (fast, no duplication)
function updateCartBadge(animate = false) {
    const badge = document.getElementById('cartCount');
    if (badge) {
        const count = getCart().length;
        badge.textContent = count;
        if (animate && count > 0) {
            badge.classList.add('animate');
            setTimeout(() => badge.classList.remove('animate'), 300);
        }
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => updateCartBadge());
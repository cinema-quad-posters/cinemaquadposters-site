// Utility to get/set cart (array of {id: string, title: string, price: number, thumbnail: string})
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(item) {
    const cart = getCart();
    // Check if already in cart (simple: no quantity, assume one per item)
    if (!cart.some(c => c.id === item.id)) {
        cart.push(item);
        setCart(cart);
        alert(`${item.title} added to cart!`); // Or use a toast/modal
    } else {
        alert(`${item.title} is already in your cart.`);
    }
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    setCart(cart);
}

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

// Initial badge update on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);
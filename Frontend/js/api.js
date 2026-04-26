const API_URL = 'http://localhost:5000/api';

// Helper to make fetch requests
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        credentials: 'include', // ✅ send cookies with every request
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    login: (credentials) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    register: (userData) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    // ✅ FIXED LOGOUT
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Correct path (no file not found error)
        window.location.replace('./login.html');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Products API
const ProductsAPI = {
    getAll: () => apiFetch('/products'),

    getById: (id) => apiFetch(`/products/${id}`),

    create: (productData) => apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    }),

    update: (id, productData) => apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    }),

    delete: (id) => apiFetch(`/products/${id}`, {
        method: 'DELETE'
    })
};

// Orders API
const OrdersAPI = {
    create: (orderData) => apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    }),

    getMyOrders: () => apiFetch('/orders/my'),

    getAll: () => apiFetch('/orders'), // Admin

    updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
};

// Cart Logic
const CartLogic = {
    getCart: () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },

    addToCart: (product) => {
        const cart = CartLogic.getCart();
        const existing = cart.find(item => item._id === product._id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },

    removeFromCart: (productId) => {
        let cart = CartLogic.getCart();
        cart = cart.filter(item => item._id !== productId);

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },

    updateQuantity: (productId, quantity) => {
        let cart = CartLogic.getCart();
        const item = cart.find(item => item._id === productId);

        if (item) {
            item.quantity = quantity;

            if (item.quantity <= 0) {
                cart = cart.filter(i => i._id !== productId);
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },

    clearCart: () => {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
    }
};
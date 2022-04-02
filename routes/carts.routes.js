const express = require('express');

// Controllers
const {
	addProductToCart,
	getUserCart,
	updateProductCart,
	purchaseCart,
	removeProductFromCart
} = require('../controllers/carts.controller');

// Middlewares
const {
	updateProductCartValidations,
	validateResult,
} = require('../middlewares/validators.middleware');
const { protectSession } = require('../middlewares/auth.middleware');

const router = express.Router();


router.use(protectSession);

// Get user's cart
router.get('/my-cart', getUserCart);

// Add product to cart
router.post('/add-product', addProductToCart);

// Update cart product quantity
router.patch('/update-cart-product',updateProductCart);


router.post('/purchase',purchaseCart);

// Remove product from cart
router.delete('/:productId', removeProductFromCart);


module.exports = { cartsRouter: router };
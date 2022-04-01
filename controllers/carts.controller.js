// Models
const { Product } = require('../models/product.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model')

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { filterObj } = require('../utils/filterObj');
const { AppError } = require('../utils/appError');

exports.getUserCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
  
	const cart = await Cart.findOne({
	  where: { status: 'active', userId: currentUser.id },
	  include: [
		{
		  model: Product,
		  through: { where: { status: 'active' } }
		}
	  ]
	});
  
	if (!cart) {
	  return next(new AppError(404, 'Uppss!! you do not have a cart yet'));
	}
  
	res.status(200).json({ status: 'success', data: { cart } });
  });

exports.addProductToCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
	const { productId, quantity } = req.body;
  
	// Check if product to add, does not exceeds that requested amount
	const product = await Product.findOne({
	  where: { status: 'active', id: productId }
	});
  
	if (quantity > product.quantity) {
	  return next(
		new AppError(400, `This product only has ${product.quantity} items.`)
	  );
	}
  
	// Check if user's cart is active, if not, create one
	const cart = await Cart.findOne({
	  where: { status: 'active', userId: currentUser.id }
	});
  
	if (!cart) {
	  // Create a new cart
	  const newCart = await Cart.create({ userId: currentUser.id });
  
	  await ProductInCart.create({
		productId,
		cartId: newCart.id,
		quantity
	  });
	} else {
	  // Cart already exists
	  // Check if product is already in the cart
	  const productExists = await ProductInCart.findOne({
		where: { cartId: cart.id, productId }
	  });
  
	  if (productExists && productExists.status === 'active') {
		return next(new AppError(400, 'This product is already in the cart'));
	  }
  
	  // If product is in the cart but was removed before, add it again
	  if (productExists && productExists.status === 'removed') {
		await productExists.update({ status: 'active', quantity });
	  }
  
	  // Add new product to cart
	  if (!productExists) {
		await ProductInCart.create({ cartId: cart.id, productId, quantity });
	  }
	}
  
	res.status(201).json({ status: 'success' });
  });

exports.updateProductCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
	const { productId, newQuantity } = req.body;

	// Find user's cart
	const userCart = await Cart.findOne({
		where: { userId: currentUser.id, status: 'onGoing' },
	});

	if (!userCart) {
		return next(new AppError('Invalid cart', 400));
	}

	// Find product in cart
	const productInCart = await ProductInCart.findOne({
		where: {
			productId,
			cartId: userCart.id,
			status: 'active',
		},
		include: [{ model: Product }],
	});

	if (!productInCart) {
		return next(new AppError('Invalid product', 400));
	}

	if (newQuantity > +productInCart.product.quantity) {
		return next(
			new AppError(
				`This product only has ${productInCart.product.quantity} items`,
				400
			)
		);
	}

	let updatedTotalPrice;

	// Check if user added or removed from the selected product
	// If user send 0 quantity to product, remove it from the cart
	if (newQuantity === 0) {
		updatedTotalPrice =
			+userCart.totalPrice - +productInCart.quantity * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: 0, status: 'removed' });
	} else if (newQuantity > +productInCart.quantity) {
		// New items were added
		updatedTotalPrice =
			+userCart.totalPrice +
			(newQuantity - +productInCart.quantity) * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: newQuantity });
	} else if (newQuantity < +productInCart.quantity) {
		// Items were removed from the cart
		updatedTotalPrice =
			+userCart.totalPrice -
			(+productInCart.quantity - newQuantity) * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: newQuantity });
	}

	// Calculate new total price
	await userCart.update({ totalPrice: updatedTotalPrice });

	res.status(204).json({ status: 'success' });
});


exports.removeProductFromCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
	const { productId } = req.params;
  
	const cart = await Cart.findOne({
	  where: { status: 'active', userId: currentUser.id }
	});
  
	if (!cart) {
	  return next(new AppError(404, 'This user does not have a cart yet'));
	}
  
	const productInCart = await ProductInCart.findOne({
	  where: { status: 'active', cartId: cart.id, productId }
	});
  
	if (!productInCart) {
	  return next(new AppError(404, 'This product does not exist in this cart'));
	}
  
	await productInCart.update({ status: 'removed', quantity: 0 });
  
	res.status(204).json({ status: 'success' });
  });
  
  exports.purchaseCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
  
	// Find user's cart
	const cart = await Cart.findOne({
	  where: { status: 'active', userId: currentUser.id },
	  include: [
		{
		  model: Product,
		  through: { where: { status: 'active' } }
		}
	  ]
	});
  
	if (!cart) {
	  return next(new AppError(404, 'This user does not have a cart yet'));
	}
  
	let totalPrice = 0;
  
	// Update all products as purchased
	const cartPromises = cart.products.map(async (product) => {
	  await product.productInCart.update({ status: 'purchased' });
  
	  // Get total price of the order
	  const productPrice = product.price * product.productInCart.quantity;
  
	  totalPrice += productPrice;
  
	  // Discount the quantity from the product
	  const newQty = product.quantity - product.productInCart.quantity;
  
	  return await product.update({ quantity: newQty });
	});
  
	await Promise.all(cartPromises);
  
	// Mark cart as purchased
	await cart.update({ status: 'purchased' });
  
	const newOrder = await Order.create({
	  userId: currentUser.id,
	  cartId: cart.id,
	  issuedAt: Date.now().toLocaleString(),
	  totalPrice
	});
  
	res.status(201).json({
	  status: 'success',
	  data: { newOrder }
	});
  });
 
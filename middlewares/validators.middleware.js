const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError');

// Validations in User routes 
exports.createUserValidations = [
	body('username').isString().notEmpty().withMessage('Enter a valid name'),
	body('email').isEmail().notEmpty().withMessage('Enter a valid email'),
	body('password')
		.isAlphanumeric()
		.withMessage(`Password must include letters and numbers`)
		.isLength({ min: 6, max: 20 })
		.withMessage('Password must be 8 characters long'),
];

exports.updateUserValidations = [
	body('username').notEmpty().withMessage(`Name can't be empty`),
	body('email').isEmail().notEmpty().withMessage('Enter a valid email'),
];

exports.loginUserValidations = [
	body('email').isEmail().notEmpty().withMessage('Credentials are not valid'),
	body('password').notEmpty().withMessage('Credentials are not valid'),
];

// End: Validations in User routes 

// Validations in Product routes 
exports.createProductValidations = [
	// Name can't be empty
	body('title').isString().notEmpty().withMessage('Enter a valid title'),
	// Description can't be empty
	body('description')
		.isString()
		.notEmpty()
		.withMessage('Enter a valid description'),
	// Quantity must be a number
	body('quantity')
		.isNumeric()
		.custom(value => +value > 0)
		.withMessage('Enter a valid quantity'),
	// Price must be a decimal
	body('price')
		.isDecimal()
		.custom(value => value > 0)
		.withMessage('Enter a valid price'),
	
	// Category can't be empty
	// body('status').isString('active').notEmpty().withMessage('Must inform if this product is active or not'),
];

// End: Validations in Product routes 

// Validations in Order routes 
exports.updateProductCartValidations = [
	body('newQuantity')
		.isNumeric()
		.custom(value => value >= 0)
		.withMessage('Enter a valid quantity'),
];

// End: Validations in Order routes

exports.validateResult = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const message = errors
			.array() // [ { msg, ... }, { msg, ... }, { msg, ... } ]
			.map(({ msg }) => msg) // [msg, msg, msg]
			.join('. '); // 'msg. msg. msg'

		return next(new AppError(message, 400));
	}

	next();
};
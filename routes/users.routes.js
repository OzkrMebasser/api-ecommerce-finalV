const express = require('express');

// Controllers
const {
	getAllUsers,
	createUser,
	getUserById,
	updateUser,
	disableUserAccount,
	loginUser,
} = require('../controllers/users.controller');

// Middlewares
const {
	createUserValidations,
	updateUserValidations,
	loginUserValidations,
	validateResult,
} = require('../middlewares/validators.middleware');

const router = express.Router();

// Only adminUser is allow to get all users
router.get('/', getAllUsers);
router.get('/orders');

// Post - Create new user
router.post('/', createUserValidations, validateResult, createUser);
router
	.route('/:id')
	.get(getUserById)
	.patch(updateUserValidations, validateResult, updateUser)
	.delete(disableUserAccount);


// Post - Login user
// router.post('/login', loginUserValidations);
router.post('/login', loginUserValidations, validateResult, loginUser);


module.exports = { userRouter: router };
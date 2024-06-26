const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

dotenv.config({ path: './config.env' });

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Nested includes
  const users = await User.findAll({
    where: { status: 'active' },

    attributes: { exclude: ['password'] },
    include: [
      {
        model: Product
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: { users }
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // If user exists with given email
  const user = await User.findOne({
    where: { email, status: 'active' }
  });

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return next(
      new AppError('Credentials are not valid', 401)
    );
  }

  // Generate JWT
  const token = await jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN
    }
  );

  console.log(token);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    )
  };

  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  // http -> https
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    attributes: { exclude: ['password'] },
    where: { id },

    attributes: { exclude: ['password'] },

    include: [
      { model: Product, include: [{ model: Cart }] }
    ]
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
	const { username, email, password, status } = req.body;
  
	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(password, salt);
  
	const newUser = await User.create({
	  username,
	  email,
	  password: hashedPassword,
	  status: status || 'active'
	});
  
	// Remove password from response
	newUser.password = undefined;
  
	// Generate JWT
	const token = await jwt.sign(
	  { id: newUser.id }, // Corrected to newUser.id
	  process.env.JWT_SECRET,
	  {
		expiresIn: process.env.JWT_EXPIRES_IN
	  }
	);
  
	// Send the user data along with the token in the response
	res.status(201).json({
	  status: 'success',
	  data: { user: newUser, token }
	});
  });
  

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { username, email } = req.body;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(
      new AppError('No user found with this id', 404)
    );
  }

  await user.update({ username, email });

  res.status(204).json({ status: 'success' });
});

exports.disableUserAccount = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.update({ status: 'inactive ' });

    res.status(204).json({ status: 'success' });
  }
);

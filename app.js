const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit= require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Routers
const { userRouter } = require('./routes/users.routes');
const { productsRouter } = require('./routes/products.routes');
const { cartsRouter } = require('./routes/carts.routes');

// Controllers
const { globalErrorHandler } = require('./controllers/error.controller');

// Utils
const { AppError } = require('./utils/appError');

// Init app
const app = express();

app.use(express.urlencoded( {extended: true}));
app.use(express.json());

app.use('*', cors());

app.use(cookieParser());

// Limit for petions
app.use(rateLimit({
	windowMs: 60 * 1000,
	max: 50,
	message: `You have made too much petions to our API`

}));

app.use(helmet());
app.use(compression());
// To see request similar to a console.log
app.use(morgan('dev'));

// Endpoints
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/carts', cartsRouter);

app.use('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = { app };

// require('crypto').randomBytes(64).toString('hex');
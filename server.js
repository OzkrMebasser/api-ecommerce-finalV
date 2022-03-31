const dotenv = require('dotenv');

// Utils
const { db } = require('./utils/database');
const { initModels } = require('./utils/initModels');

// Express app
const { app } = require('./app');

dotenv.config({ path: './config.env' });



// Model relations
db.authenticate()
  .then(() => console.log('Database is authenticated & connected'))
  .catch((err) => console.log(err));

initModels();

db.sync()
	.then(() => {
		console.log('Database is sync with success ');
		startServer();
	})
	.catch(err => console.log(err));

const startServer = () => {
	const PORT = process.env.PORT || 4000;

	app.listen(PORT, () => {
		console.log(`Ecommerce API running on port ${PORT}!`);
	});
};


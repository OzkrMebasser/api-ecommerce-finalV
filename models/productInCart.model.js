const { DataTypes } = require('sequelize');

// Utils
const { db } = require('../utils/database');

const ProductInCart = db.define(
	'productInCarts',
	{
		id: {
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			type: DataTypes.INTEGER
		  },
		  productId: {
			type: DataTypes.INTEGER,
			allowNull: false
		  },
		  cartId: {
			type: DataTypes.INTEGER,
			allowNull: false
		  },
		  quantity: {
			type: DataTypes.INTEGER,
			allowNull: false
		  },
		  status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 'active'
		  }
	}

);

module.exports = { ProductInCart };
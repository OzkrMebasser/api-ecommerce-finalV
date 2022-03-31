const { DataTypes } = require('sequelize');
const { db } = require('../utils/database');

const Order = db.define(
	'orders',
	{
		id: {
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			type: DataTypes.INTEGER
		  },
		  userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		  },
		  cartId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true
		  },
		  issuedAt: {
			type: DataTypes.STRING(255),
			allowNull: false
		  },
		  totalPrice: {
			type: DataTypes.INTEGER,
			allowNull: false
		  },
		  status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 'active'
		  }
	},
	// { timestamps: false }
);

module.exports = { Order };

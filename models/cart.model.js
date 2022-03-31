const { DataTypes } = require('sequelize');
const { db } = require('../utils/database');

const Cart = db.define(
	'carts',
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
		  status: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 'active'
		  }
	},
	// { timestamps: false }
);

module.exports = { Cart };

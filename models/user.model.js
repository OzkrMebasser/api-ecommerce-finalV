const { DataTypes } = require('sequelize');
const { db } = require('../utils/database');

const User = db.define(
	'users',
	{
		id: {
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			type: DataTypes.INTEGER,
		},
		username: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
			// active || inactive
			defaultValue: 'active',
		},
	},
	// { timestamps: false }
);

module.exports = { User };
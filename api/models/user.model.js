"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		"GCEP_Users",
		{
			firstName: {
				type: DataTypes.STRING,
				field: "firstName"
			},
			lastName: {
				type: DataTypes.STRING,
				field: "lastName"
			},
			streetAddress1: {
				type: DataTypes.STRING,
				field: "streetAddress1"
			},
			streetAddress2: {
				type: DataTypes.STRING,
				field: "streetAddress2"
			},
			city: {
				type: DataTypes.STRING,
				field: "city"
			},
			zipCode: {
				type: DataTypes.STRING,
				field: "zipCode"
			},
			state: {
				type: DataTypes.STRING,
				field: "state"
			},
			country: {
				type: DataTypes.STRING,
				field: "country"
			},
			phone: {
				type: DataTypes.STRING,
				field: "phone"
			},
			email: {
				type: DataTypes.STRING,
				field: "email"
			},
			password: {
				type: DataTypes.STRING,
				field: "password"
			},
			accountTypeDetail: {
				type: DataTypes.STRING,
				field: "accountTypeDetail"
			}
		},
		{
			timestamps: true,
			createdAt: "createdDate",
			updatedAt: "modifiedDate"
		}
	);

	User.findByID = async id => {
		return await User.findByPk(id)
			.then(user => (user ? user : undefined))
			.catch(err => undefined);
	};

	User.findUser = async email => {
		return await User.findOne({ where: { email } })
			.then(user => (user ? user : undefined))
			.catch(err => undefined);
	};

	User.createUser = async user => {
		return await User.create(user)
			.then(user => user)
			.catch(err => undefined);
	};

	User.deleteUser = async id => {
		return await User.destroy({
			where: { id: id }
		})
			.then(num => (num == 1 ? true : false))
			.catch(err => false);
	};

	User.updateUser = async (email, data) => {
		return await User.update(data, { where: { email } })
			.then(user => user)
			.catch(err => undefined);
	};

	return User;
};

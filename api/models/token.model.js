"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
	// DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
	// 	date = this._applyTimezone(date, options);
	// 	return date.format("YYYY-MM-DD HH:MM:SS");
	// };

	let Token = sequelize.define("GCEP_Tokens", {
		authCode: {
			type: DataTypes.STRING,
			field: "authCode"
		},
		email: {
			type: DataTypes.TEXT,
			field: "email",
		},
		userId: {
			type: DataTypes.INTEGER(),
			allowNull: true,
			references: {
				model: 'GCEP_Users',
				key: 'id'
			}
		},
		conedSub: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		access_token: {
			type: DataTypes.TEXT,
			field: "access_token",
		},
		refresh_token: {
			type: DataTypes.STRING,
			field: "refresh_token"
		},
		expires_in: {
			type: DataTypes.STRING,
			field: "expires_in"
		},
		expiry_date: {
			type: DataTypes.DATE,
			field: "expiry_date"
		},
		scope: {
			type: DataTypes.TEXT,
			field: "scope"
		},
		resourceURI: {
			type: DataTypes.STRING,
			field: "resourceURI"
		},
		authorizationURI: {
			type: DataTypes.STRING,
			field: "authorizationURI"
		},
		accountNumber: {
			type: DataTypes.STRING,
			field: "accountNumber"
		},
		subscriptionId: {
			type: DataTypes.STRING,
			field: "subscriptionId"
		},
		authorizationId: {
			type: DataTypes.STRING,
			field: "authorizationId"
		},
		conedAddress: {
			type: DataTypes.STRING,
			field: "conedAddress"
		},
		meterAccountId: {
			type: DataTypes.STRING,
			field: "meterAccountId"
		},
		meterReadingId: {
			type: DataTypes.STRING,
			field: "meterReadingId"
		},
		usagePointId: {
			type: DataTypes.STRING,
			field: "usagePointId"
		}
	},
		{
			timestamps: true,
			createdAt: "createdDate",
			updatedAt: "modifiedDate"
		});

	Token.findByToken = async code => {
		return await Token.findOne({
			where: {
				authCode: code
			}
		})
			.then(token => token || undefined)
			.catch(err => false);
	};

	Token.createToken = async tokenData => {
		return await Token.create(tokenData)
			.then(token => token)
			.catch(err => false);
	};

	Token.updateToken = async (authCode, tokenData) => {
		return await Token.update(tokenData, {
			where: {
				authCode: authCode
			}
		})
			.then(token => token || undefined)
			.catch(err => false);
	};

	return Token;
};
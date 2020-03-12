"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
	DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
		date = this._applyTimezone(date, options);
		return date.format("YYYY-MM-DD HH:MM:SS");
	};

	let Token = sequelize.define("GCEP_Tokens", {
		authCode: {
			type: DataTypes.STRING,
			field: "authCode"
		},
		access_token: {
			type: DataTypes.STRING,
			field: "access_token"
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
			type: DataTypes.STRING,
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
			type: DataTypes.INTEGER,
			field: "accountNumber"
		}
	});

	Token.findByToken = async code => {
		return await Token.findOne({
			where: {
				authCode: code
			}
		})
			.then(token => token || undefined)
			.catch(err => undefined);
	};

	Token.createToken = async tokenData => {
		return await Token.create(tokenData)
			.then(token => token)
			.catch(err => undefined);
	};

	Token.updateToken = async (authCode, tokenData) => {
		return await Token.update(tokenData, { where: { authCode: authCode } })
			.then(token => token || undefined)
			.catch(err => undefined);
	};

	return Token;
};

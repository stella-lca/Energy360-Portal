"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
	// DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
	// 	date = this._applyTimezone(date, options);
	// 	return date.format("YYYY-MM-DD HH:MM:SS");
	// };

	let Log = sequelize.define("GCEP_API_Responses", {
		content: {
			type: DataTypes.TEXT,
			field: "content",
		},
		status: {
			type: DataTypes.BOOLEAN,
			field: "status"
		}
	}, {
		timestamps: true,
		createdAt: "createdDate",
		updatedAt: "modifiedDate"
	});

	Log.findLog = async id => {
		return await Log.findByPk(id)
			.then(data => data || undefined)
			.catch(err => err);
	};

	Log.findAllLog = async () => {
		return await Log.findAll()
			.then(data => data || undefined)
			.catch(err => err);
	};

	Log.createLog = async data => {
		return await Log.create(data)
			.then(data => data)
			.catch(err => err);
	};


	return Log;
};
"use strict";

module.exports = (sequelize, DataTypes) => {

	let MeterReading = sequelize.define("GCEP_MeterReading", {
		date: {
			type: DataTypes.STRING,
			field: "date"
		},
		KVARHReading: {
			type: DataTypes.TEXT,
			field: "KVARHReading",
		},
		tokenId: {
			type: DataTypes.INTEGER(),
			allowNull: true,
			references: {
				model: 'GCEP_Tokens',
				key: 'id'
			}
		},
		KWHReading: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'KWHReading'
		}
	},
		{
			timestamps: true,
			createdAt: "createdDate",
			updatedAt: "modifiedDate"
		});

	return MeterReading;
};
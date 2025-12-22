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
		intervalBlockPayloadId: {
			type: DataTypes.INTEGER(),
			references: {
				model: 'GCEP_IntervalBlockPayloads',
				key: 'id'
			}
		},
		KWHReading: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'KWHReading'
		},
		kWReading: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'kWReading'
		}
	},
		{
			timestamps: true,
			createdAt: "createdDate",
			updatedAt: "modifiedDate"
		});

	return MeterReading;
};

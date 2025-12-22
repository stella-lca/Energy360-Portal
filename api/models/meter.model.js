"use strict";

module.exports = (sequelize, DataTypes) => {
    // DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    // 	date = this._applyTimezone(date, options);
    // 	return date.format("YYYY-MM-DD HH:MM:SS");
    // };

    let Meter = sequelize.define("GCEP_Meter", {
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
        conedAddress: {
            type: DataTypes.STRING,
            field: "conedAddress"
        },
        meterAccountId: {
            type: DataTypes.STRING,
            field: "meterAccountId"
        }
    },
        {
            timestamps: true,
            createdAt: "createdDate",
            updatedAt: "modifiedDate"
        });

    return Meter;
};
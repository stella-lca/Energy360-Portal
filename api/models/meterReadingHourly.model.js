"use strict";

module.exports = (sequelize, DataTypes) => {

    let MeterReadingHourly = sequelize.define("GCEP_MeterReadingHourly", {
        date: {
            type: DataTypes.STRING,
            field: "date"
        },
        KVARHReading: {
            type: DataTypes.TEXT,
            field: "KVARHReading",
        },
        time: {
            type: DataTypes.TEXT,
            field: "time",
        },
        tokenId: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            references: {
                model: 'GCEP_Tokens',
                key: 'id'
            }
        },
        intervalBlockPayloadId: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            references: {
                model: 'GCEP_IntervalBlockPayload',
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

    return MeterReadingHourly;
};
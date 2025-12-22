"use strict";

module.exports = (sequelize, DataTypes) => {

    let MeterReadingHourly = sequelize.define("GCEP_HourlyMeterReading", {
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

    return MeterReadingHourly;
};

"use strict";

module.exports = (sequelize, DataTypes) => {

    let IntervalBlockPayload = sequelize.define("GCEP_IntervalBlockPayloads", {
        tokenId: {
            type: DataTypes.INTEGER(),
            references: {
                model: 'GCEP_Tokens',
                key: 'id'
            }
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

    return IntervalBlockPayload;
};
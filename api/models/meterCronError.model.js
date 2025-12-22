"use strict";

module.exports = (sequelize, DataTypes) => {

    let MeterCronError = sequelize.define("GCEP_MeterCronError", {
        errorMessage: {
            type: DataTypes.STRING,
            field: "errorMessage"
        },
        intervalBlockPayloadId: {
            type: DataTypes.INTEGER(),
            references: {
                model: 'GCEP_IntervalBlockPayloads',
                key: 'id'
            }
        },
        minDate: {
            type: DataTypes.STRING,
            field: "minDate"
        },
        maxDate: {
            type: DataTypes.STRING,
            field: "maxDate"
        }
    },
        {
            timestamps: true,
            createdAt: "createdDate",
            updatedAt: "modifiedDate"
        });

    return MeterCronError;
};